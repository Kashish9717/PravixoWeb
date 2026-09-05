import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { CreditCard, Search, ArrowUpRight, ShieldAlert, Award, RefreshCcw, Landmark, Activity, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";

export function PaymentsPage() {
  useEffect(() => {
    document.title = "Escrow Payments & Webhooks — Pravixo Admin";
  }, []);

  const [activeTab, setActiveTab] = useState("stats");
  const [search, setSearch] = useState("");
  const [resolvingId, setResolvingId] = useState(null);

  // Webhook Simulation Panel States
  const [simEvent, setSimEvent] = useState("payment.captured");
  const [simPayload, setSimPayload] = useState('{\n  "order_id": "order_ABC123",\n  "payment_id": "pay_XYZ789"\n}');
  const [simulating, setSimulating] = useState(false);

  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState(null);
  const [webhookLogs, setWebhookLogs] = useState(null);

  const fetchData = async () => {
    try {
      const [statsRes, paymentsRes, webhookRes] = await Promise.all([
        api.get("/admin/revenue-stats"),
        api.get("/admin/payments"),
        api.get("/admin/webhook-logs").catch(() => ({ data: { success: true, data: [] } }))
      ]);
      if (statsRes.data.success) setStats(statsRes.data.data);
      if (paymentsRes.data.success) setPayments(paymentsRes.data.data);
      if (webhookRes.data.success) setWebhookLogs(webhookRes.data.data);
    } catch (err) {
      console.error("Failed to fetch payments data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = payments?.filter((p) => {
    const campaignTitle = p.campaign?.title?.toLowerCase() || "";
    const brandName = p.brand?.fullName?.toLowerCase() || "";
    const creatorName = p.creator?.fullName?.toLowerCase() || "";
    const searchLower = search.toLowerCase();

    const matchesSearch =
      !search ||
      campaignTitle.includes(searchLower) ||
      brandName.includes(searchLower) ||
      creatorName.includes(searchLower) ||
      p._id.includes(searchLower) ||
      p.payoutReference?.toLowerCase().includes(searchLower) ||
      p.gatewayOrderId?.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    if (activeTab === "holding") {
      return p.paymentStatus === "holding" || p.paymentStatus === "disputed";
    }
    if (activeTab === "released") {
      return p.paymentStatus === "completed" || p.paymentStatus === "released";
    }
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
      case "released":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "holding":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "invoice_generated":
        return "bg-amber/10 text-amber border-amber-500/20";
      case "disputed":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "refunded":
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleResolve = async (paymentId, resolution) => {
    setResolvingId(paymentId);
    try {
      await api.post(`/admin/payments/${paymentId}/resolve`, { resolution });
      toast.success(`Dispute resolved successfully: funds ${resolution === "release" ? "released" : "refunded"}`);
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    } finally {
      setResolvingId(null);
    }
  };

  const handleSimulateWebhook = async () => {
    setSimulating(true);
    try {
      await api.post("/payments/webhook", JSON.parse(simPayload));
      toast.success("Simulated webhook payload executed successfully!");
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">
          Escrow Payments & Webhooks
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Audit campaign invoices, track payouts queue, simulate gateway webhooks, and resolve disputes.
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-border">
        {["stats", "holding", "released", "all", "webhooks"].map((tab) => (
          <button
            key={tab}
            className={`py-3 px-6 text-sm font-semibold capitalize border-b-2 transition-all duration-200 ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "stats" ? "Revenue Stats" : tab === "holding" ? "Holding Escrows" : tab === "released" ? "Payout Queue" : tab === "webhooks" ? "Webhook Simulation" : "All Transactions"}
          </button>
        ))}
      </div>

      {/* REVENUE STATS TAB */}
      {activeTab === "stats" && (
        <div className="space-y-6">
          {!stats ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="p-6 border border-border rounded-3xl bg-card">
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-8 w-32" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="p-6 border border-border rounded-3xl bg-card shadow-sm space-y-2">
                <div className="flex justify-between items-center text-muted-foreground text-xs font-bold uppercase tracking-wider">
                  <span>Today's Revenue</span>
                  <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold">₹{stats.todayRevenue.toLocaleString()}</p>
              </div>

              <div className="p-6 border border-border rounded-3xl bg-card shadow-sm space-y-2">
                <div className="flex justify-between items-center text-muted-foreground text-xs font-bold uppercase tracking-wider">
                  <span>Weekly Revenue</span>
                  <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold">₹{stats.weeklyRevenue.toLocaleString()}</p>
              </div>

              <div className="p-6 border border-border rounded-3xl bg-card shadow-sm space-y-2">
                <div className="flex justify-between items-center text-muted-foreground text-xs font-bold uppercase tracking-wider">
                  <span>Monthly Revenue</span>
                  <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold">₹{stats.monthlyRevenue.toLocaleString()}</p>
              </div>

              <div className="p-6 border border-border rounded-3xl bg-card shadow-sm space-y-2">
                <div className="flex justify-between items-center text-muted-foreground text-xs font-bold uppercase tracking-wider">
                  <span>Total Gross Volume</span>
                  <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>

              <div className="p-6 border border-border rounded-3xl bg-card shadow-sm space-y-2 border-emerald-500/20 bg-emerald-500/5">
                <div className="flex justify-between items-center text-emerald-600 text-xs font-bold uppercase tracking-wider">
                  <span>Commission Earned (20%)</span>
                  <Award className="h-4 w-4" />
                </div>
                <p className="text-2xl font-bold text-emerald-600">₹{stats.platformCommissionEarned.toLocaleString()}</p>
              </div>

              <div className="p-6 border border-border rounded-3xl bg-card shadow-sm space-y-2 border-blue-500/20 bg-blue-500/5">
                <div className="flex justify-between items-center text-blue-500 text-xs font-bold uppercase tracking-wider">
                  <span>Money In Holding</span>
                  <RefreshCcw className="h-4 w-4 animate-spin-slow" />
                </div>
                <p className="text-2xl font-bold text-blue-500">₹{stats.paymentsInHolding.toLocaleString()}</p>
              </div>

              <div className="p-6 border border-border rounded-3xl bg-card shadow-sm space-y-2">
                <div className="flex justify-between items-center text-muted-foreground text-xs font-bold uppercase tracking-wider">
                  <span>Released Payments</span>
                  <CreditCard className="h-4 w-4" />
                </div>
                <p className="text-2xl font-bold">₹{stats.releasedPayments.toLocaleString()}</p>
              </div>

              <div className="p-6 border border-border rounded-3xl bg-card shadow-sm space-y-2 border-red-500/20 bg-red-500/5">
                <div className="flex justify-between items-center text-red-500 text-xs font-bold uppercase tracking-wider">
                  <span>Disputed Payments</span>
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <p className="text-2xl font-bold text-red-500">₹{stats.disputedPayments.toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* WEBHOOK SIMULATOR TAB */}
      {activeTab === "webhooks" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="p-6 border border-border rounded-3xl bg-card space-y-4">
            <h3 className="font-display text-base font-bold flex items-center gap-1.5">
              <Terminal className="h-5 w-5 text-primary" /> Simulate Webhook Event
            </h3>
            <p className="text-xs text-muted-foreground">
              Paste order details below to trigger gateway captured webhook alerts.
            </p>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase">Event Type</label>
                <select
                  className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none"
                  value={simEvent}
                  onChange={(e) => setSimEvent(e.target.value)}
                >
                  <option value="payment.captured">payment.captured</option>
                  <option value="payment.authorized">payment.authorized</option>
                  <option value="refund.processed">refund.processed</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase">Payload JSON</label>
                <Textarea
                  rows={6}
                  className="font-mono text-xs rounded-xl bg-background border-border"
                  value={simPayload}
                  onChange={(e) => setSimPayload(e.target.value)}
                />
              </div>
              <Button
                className="w-full rounded-full gradient-sunset border-0 text-white shadow-glow text-xs font-semibold h-9"
                disabled={simulating}
                onClick={handleSimulateWebhook}
              >
                {simulating ? "Executing simulation..." : "Trigger Gateway Webhook"}
              </Button>
            </div>
          </div>

          <div className="p-6 border border-border rounded-3xl bg-card space-y-4">
            <h3 className="font-display text-base font-bold flex items-center gap-1.5">
              <Activity className="h-5 w-5 text-primary" /> Gateway Webhook Logs
            </h3>
            <div className="overflow-y-auto max-h-[400px] border border-border/40 rounded-2xl bg-secondary/5 divide-y divide-border/30">
              {!webhookLogs ? (
                <div className="p-4 text-center text-xs text-muted-foreground">Loading webhook trails...</div>
              ) : webhookLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">No webhook payloads logged yet.</div>
              ) : (
                webhookLogs.map((log) => (
                  <div key={log._id} className="p-3 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-foreground font-mono">{log.event}</span>
                      <Badge variant="outline" className={`text-[9px] capitalize px-1 bg-emerald-500/10 text-emerald-600 border-0`}>
                        {log.status}
                      </Badge>
                    </div>
                    <p className="text-[10px] font-mono text-muted-foreground bg-background p-1.5 rounded-md truncate">
                      {log.payload}
                    </p>
                    <span className="text-[9px] text-muted-foreground block text-right">
                      {format(new Date(log.createdAt), "MMM d, yyyy HH:mm:ss")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* DATA TABLE (HOLDING, RELEASED, ALL) */}
      {activeTab !== "stats" && activeTab !== "webhooks" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by ID, campaign, ref..."
                className="pl-9 rounded-full bg-secondary/50 border-0 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Invoice Number</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Gross Amount</TableHead>
                  <TableHead>Platform Fee (20%)</TableHead>
                  <TableHead>Net Creator (80%)</TableHead>
                  <TableHead>Payment Status</TableHead>
                  {activeTab === "released" && <TableHead>Payout Reference</TableHead>}
                  <TableHead>Release Target</TableHead>
                  <TableHead className="text-right pr-6">Action / Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!filtered ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="pl-6"><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="text-right pr-6"><Skeleton className="h-8 w-20 ml-auto rounded-full" /></TableCell>
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="py-16 text-center">
                      <CreditCard className="mx-auto h-8 w-8 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        No payments match this view
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((p) => (
                    <TableRow key={p._id}>
                      <td className="pl-6 py-4">
                        <span className="block font-semibold text-foreground text-xs">{p.invoiceNumber}</span>
                        <span className="block font-mono text-[9px] text-muted-foreground">{p._id}</span>
                      </td>
                      <TableCell className="font-semibold max-w-[120px] truncate">
                        {p.campaign?.title || "General"}
                      </TableCell>
                      <TableCell className="max-w-[110px] truncate">{p.brand?.fullName}</TableCell>
                      <TableCell className="max-w-[110px] truncate">{p.creator?.fullName}</TableCell>
                      <TableCell className="font-bold">₹{p.grossAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground">₹{p.platformCommissionAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground">₹{p.creatorAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`rounded-full text-[9px] uppercase font-bold border-0 ${getStatusColor(
                            p.paymentStatus
                          )}`}
                        >
                          {p.paymentStatus.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      {activeTab === "released" && (
                        <TableCell className="font-mono text-xs text-emerald-600 font-semibold">
                          {p.payoutReference || "—"}
                        </TableCell>
                      )}
                      <TableCell className="text-xs text-muted-foreground">
                        {p.holdingEndsAt ? format(new Date(p.holdingEndsAt), "MMM d, yyyy HH:mm") : "—"}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        {p.paymentStatus === "disputed" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] h-7 px-3"
                              disabled={resolvingId === p._id}
                              onClick={() => handleResolve(p._id, "release")}
                            >
                              Release Payout
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full border-red-500/20 text-red-500 hover:bg-red-500/10 text-[10px] h-7 px-3"
                              disabled={resolvingId === p._id}
                              onClick={() => handleResolve(p._id, "refund")}
                            >
                              Refund Brand
                            </Button>
                          </div>
                        ) : p.paymentStatus === "holding" ? (
                          <span className="text-[10px] text-blue-500 font-semibold italic">
                            Holding Escrow
                          </span>
                        ) : p.paymentStatus === "completed" || p.paymentStatus === "released" ? (
                          <span className="text-[10px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                            <Landmark className="h-3 w-3" /> Payout Settled
                          </span>
                        ) : p.paymentStatus === "refunded" ? (
                          <span className="text-[10px] text-slate-500 font-semibold">
                            Refunded
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
