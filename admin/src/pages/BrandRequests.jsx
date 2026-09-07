import { useEffect, useState, useMemo } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  X,
  ExternalLink,
  FileText,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Eye,
  User,
  Mail,
  MapPin,
  AlertTriangle,
  Send,
  CheckCircle2,
  XCircle,
  Building2,
} from "lucide-react";
import { toast } from "sonner";

/* ──────────────────────────────────────────────
   BRAND REVIEW MODAL
   ────────────────────────────────────────────── */
function BrandReviewModal({ brand, onClose, onApprove, onSendMessage }) {
  const [msgMode, setMsgMode] = useState(false);
  const [msgText, setMsgText] = useState("");
  const [sending, setSending] = useState(false);
  const [approving, setApproving] = useState(false);

  if (!brand) return null;

  const hasGst = !!brand.gstNumber;
  const hasGstCert = !!brand.gstCertificateUrl;
  const hasHandle = !!brand.handle;
  const hasWebsite = !!brand.website;
  const hasCategory = !!brand.category;
  const hasLocation = !!brand.location;
  const hasCompanySize = !!brand.companySize;

  const missing = [];
  if (!hasGst) missing.push("GST Number");
  if (!hasGstCert) missing.push("GST Certificate");
  if (!hasHandle) missing.push("Handle / Username");
  if (!hasCategory) missing.push("Category");
  if (!hasWebsite) missing.push("Website");
  if (!hasLocation) missing.push("Location");
  if (!hasCompanySize) missing.push("Company Size");

  const allComplete = missing.length === 0;

  const handleApprove = async () => {
    setApproving(true);
    await onApprove();
    setApproving(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!msgText.trim()) return;
    setSending(true);
    await onSendMessage(msgText);
    setSending(false);
    setMsgText("");
    setMsgMode(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-amber/10 to-primary/10 border-b border-border px-6 py-5">
          <div className="flex items-center gap-4">
            <img
              src={brand.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${brand.fullName}`}
              alt=""
              className="h-14 w-14 rounded-2xl border-2 border-border object-cover shadow-md"
              onError={(e) => { e.target.onerror = null; e.target.src = `https://api.dicebear.com/9.x/avataaars/svg?seed=Fallback`; }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-xl font-bold truncate">{brand.fullName}</h3>
              <p className="text-sm text-muted-foreground">
                {brand.handle ? `@${brand.handle}` : "No handle set"} · Brand
              </p>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Completeness Banner */}
          {allComplete ? (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="text-sm font-semibold text-emerald-600">
                All required details are complete — ready to approve!
              </span>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
              <span className="text-sm font-semibold text-amber-600">
                Missing: {missing.join(", ")}
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[50vh] overflow-y-auto">
          {/* Profile Details */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Brand Information
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoRow icon={Building2} label="Brand Name" value={brand.fullName} />
              <InfoRow icon={Mail} label="Email" value={brand.email} />
              <InfoRow icon={MapPin} label="Location" value={brand.location} missing="Not set" />
              <InfoRow icon={FileText} label="Category" value={brand.category} missing="Not set" />
              <InfoRow icon={User} label="Handle" value={brand.handle ? `@${brand.handle}` : null} missing="Not set" />
              <InfoRow icon={Building2} label="Company Size" value={brand.companySize} missing="Not set" />
              <InfoRow icon={ExternalLink} label="Website" value={brand.website} missing="Not set" />
              <InfoRow label="GST Number" icon={FileText}
                value={brand.gstNumber || null}
                missing="Not provided"
              />
            </div>
          </div>

          {/* KYC / Documents */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              KYC Documents
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DocRow label="GST Number" value={brand.gstNumber} hasDoc={hasGst} isText />
              <DocRow label="GST Certificate" url={brand.gstCertificateUrl} hasDoc={hasGstCert} />
            </div>
          </div>

          {/* Message Mode */}
          {msgMode && (
            <form onSubmit={handleSend} className="space-y-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm font-semibold text-foreground">
                📩 Send a message to {brand.fullName}
              </p>
              <p className="text-xs text-muted-foreground">
                This message will appear in the brand's in-app notification center.
              </p>
              <textarea
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                placeholder="e.g. Please upload a valid GST certificate to complete your verification."
                rows={3}
                className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                required
              />
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" className="rounded-full"
                  onClick={() => { setMsgMode(false); setMsgText(""); }}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="rounded-full bg-primary text-primary-foreground"
                  disabled={sending || !msgText.trim()}>
                  {sending ? "Sending…" : <><Send className="h-3.5 w-3.5 mr-1.5" /> Send Message</>}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 flex flex-wrap items-center gap-2 justify-between bg-card">
          <Button size="sm" variant="outline"
            className="rounded-full gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
            onClick={() => setMsgMode((v) => !v)}>
            <Send className="h-3.5 w-3.5" />
            {msgMode ? "Hide Message" : "Send Message to Brand"}
          </Button>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="rounded-full" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm"
              className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
              onClick={handleApprove} disabled={approving}>
              <ShieldCheck className="h-4 w-4" />
              {approving ? "Approving…" : (allComplete ? "Approve ✓" : "Approve Anyway")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Helper sub-components */
function InfoRow({ icon: Icon, label, value, missing = "Not provided" }) {
  const hasValue = value && value !== "" && value !== "0" && value !== 0;
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-border bg-muted/30 px-3 py-2.5">
      {Icon && <Icon className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />}
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className={`text-sm font-medium truncate ${hasValue ? "text-foreground" : "text-muted-foreground/50 italic"}`}>
          {hasValue ? value : missing}
        </p>
      </div>
    </div>
  );
}

function DocRow({ label, url, hasDoc, value, isText }) {
  return (
    <div className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 ${hasDoc ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}>
      <FileText className={`h-3.5 w-3.5 shrink-0 ${hasDoc ? "text-emerald-500" : "text-red-400"}`} />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        {hasDoc ? (
          isText ? (
            <p className="text-sm font-medium text-emerald-600 font-mono">{value}</p>
          ) : (
            <a href={url} target="_blank" rel="noreferrer"
              className="text-sm font-medium text-emerald-600 hover:underline inline-flex items-center gap-1">
              View Document <ExternalLink className="h-3 w-3" />
            </a>
          )
        ) : (
          <p className="text-sm font-medium text-red-500 italic">Not uploaded</p>
        )}
      </div>
      {hasDoc ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> : <XCircle className="h-4 w-4 text-red-400 shrink-0" />}
    </div>
  );
}

/* ──────────────────────────────────────────────
   MAIN PAGE
   ────────────────────────────────────────────── */
export default function BrandRequests() {
  useEffect(() => {
    document.title = "Brand Requests — Pravixo Admin";
  }, []);

  const [pendingBrands, setPendingBrands] = useState(null);
  const [historyBrands, setHistoryBrands] = useState(null);

  const fetchData = async () => {
    try {
      const [pendingRes, historyRes] = await Promise.all([
        api.get("/admin/verification/brands/pending"),
        api.get("/admin/verification/brands/history"),
      ]);
      if (pendingRes.data.success) setPendingBrands(pendingRes.data.data);
      if (historyRes.data.success) setHistoryBrands(historyRes.data.data);
    } catch (err) {
      console.error("Failed to fetch brand requests:", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAction = async (id, status, name, reason = "") => {
    try {
      await api.patch(`/admin/profiles/${id}/verification`, { status, rejectReason: reason });
      toast.success(`Brand ${name} verification has been ${status === "verified" ? "approved ✓" : "rejected"}.`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update verification status");
    }
  };

  const [reviewTarget, setReviewTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [historySort, setHistorySort] = useState("newest");
  const [pendingSort, setPendingSort] = useState("newest");

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectTarget) return;
    await handleAction(rejectTarget.id, "rejected", rejectTarget.name, rejectReason);
    setRejectTarget(null);
    setRejectReason("");
  };

  const handleSendMessage = async (message) => {
    try {
      await api.post(`/admin/profiles/${reviewTarget._id}/message`, { message });
      toast.success("Message sent to brand's notification center.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message");
    }
  };

  const sortedPending = useMemo(() => {
    if (!pendingBrands) return null;
    const sorted = [...pendingBrands];
    sorted.sort(pendingSort === "newest"
      ? (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
      : (a, b) => new Date(a.updatedAt || a.createdAt) - new Date(b.updatedAt || b.createdAt));
    return sorted;
  }, [pendingBrands, pendingSort]);

  const sortedHistory = useMemo(() => {
    if (!historyBrands) return null;
    const sorted = [...historyBrands];
    sorted.sort(historySort === "newest"
      ? (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
      : (a, b) => new Date(a.updatedAt || a.createdAt) - new Date(b.updatedAt || b.createdAt));
    return sorted;
  }, [historyBrands, historySort]);

  const handleReset = async (id, name) => {
    try {
      await api.patch(`/admin/profiles/${id}/verification`, { status: "unverified" });
      toast.success(`Reset status for ${name} back to Unverified.`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset status");
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-10">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Brand Verification Requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review documents submitted by brands (GST) and approve or reject verification applications.
        </p>
      </div>

      {/* PENDING */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">
            Pending Applications
            {pendingBrands && pendingBrands.length > 0 && (
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white rounded-full">{pendingBrands.length}</Badge>
            )}
          </h2>
          <select value={pendingSort} onChange={(e) => setPendingSort(e.target.value)}
            className="h-9 rounded-full border border-border bg-card px-3 py-1 text-sm text-foreground focus:border-primary focus:outline-none">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>

        <div className="rounded-3xl border border-border bg-card overflow-hidden">
          <div className="max-h-[380px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Brand</TableHead>
                  <TableHead>Handle</TableHead>
                  <TableHead>GST Number</TableHead>
                  <TableHead>GST Certificate</TableHead>
                  <TableHead className="text-right pr-6 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!sortedPending ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="pl-6"><div className="flex items-center gap-3"><Skeleton className="h-9 w-9 rounded-full" /><Skeleton className="h-4 w-24" /></div></TableCell>
                      <TableCell><Skeleton className="h-3.5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-3.5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-7 w-28 rounded-full" /></TableCell>
                      <TableCell className="text-right pr-6"><div className="flex justify-end gap-2"><Skeleton className="h-8 w-20 rounded-full" /><Skeleton className="h-8 w-16 rounded-full" /></div></TableCell>
                    </TableRow>
                  ))
                ) : sortedPending.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-16 text-center">
                      <p className="text-sm text-muted-foreground font-medium">No pending brand verification requests found.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedPending.map((b) => (
                    <TableRow key={b._id} className="group">
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <img src={b.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${b.fullName}`}
                            alt="" className="h-9 w-9 rounded-full border border-border object-cover"
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://api.dicebear.com/9.x/avataaars/svg?seed=Fallback"; }} />
                          <div>
                            <span className="text-sm font-semibold">{b.fullName}</span>
                            <div className="flex items-center gap-1 mt-0.5">
                              {b.gstNumber && b.gstCertificateUrl ? (
                                <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
                                  <CheckCircle2 className="h-2.5 w-2.5" /> Docs complete
                                </span>
                              ) : (
                                <span className="text-[10px] text-amber-600 font-medium flex items-center gap-0.5">
                                  <AlertTriangle className="h-2.5 w-2.5" /> Docs missing
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{b.handle ? `@${b.handle}` : "—"}</TableCell>
                      <TableCell className="text-sm font-medium font-mono">{b.gstNumber || <span className="text-red-400 font-sans not-italic font-normal text-xs flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> Not provided</span>}</TableCell>
                      <TableCell>
                        {b.gstCertificateUrl ? (
                          <a href={b.gstCertificateUrl} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium">
                            <FileText className="h-3.5 w-3.5" /> View Certificate <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-red-400 font-medium">
                            <XCircle className="h-3.5 w-3.5" /> No file
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-2">
                          <Button size="sm"
                            className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-8 px-4 inline-flex items-center gap-1"
                            onClick={() => setReviewTarget(b)}>
                            <Eye className="h-3.5 w-3.5" /> Review
                          </Button>
                          <Button size="sm" variant="outline"
                            className="rounded-full border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 font-semibold h-8 px-4 inline-flex items-center gap-1"
                            onClick={() => setRejectTarget({ id: b._id, name: b.fullName })}>
                            <X className="h-3.5 w-3.5" /> Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {pendingBrands && pendingBrands.length > 0 && (
            <div className="border-t border-border px-6 py-3 text-xs text-muted-foreground">
              Showing {pendingBrands.length} pending request{pendingBrands.length !== 1 && "s"}
            </div>
          )}
        </div>
      </div>

      {/* HISTORY */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Verification History</h2>
          <select value={historySort} onChange={(e) => setHistorySort(e.target.value)}
            className="h-9 rounded-full border border-border bg-card px-3 py-1 text-sm text-foreground focus:border-primary focus:outline-none">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
        <div className="rounded-3xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">Brand</TableHead>
                <TableHead>Handle</TableHead>
                <TableHead>GST Info</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6 font-semibold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!sortedHistory ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-6"><div className="flex items-center gap-3"><Skeleton className="h-9 w-9 rounded-full" /><Skeleton className="h-4 w-24" /></div></TableCell>
                    <TableCell><Skeleton className="h-3.5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell className="text-right pr-6"><Skeleton className="h-8 w-16 ml-auto rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : sortedHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground font-medium">No verification history found.</TableCell>
                </TableRow>
              ) : (
                sortedHistory.map((b) => (
                  <TableRow key={b._id}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <img src={b.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${b.fullName}`}
                          alt="" className="h-9 w-9 rounded-full border border-border object-cover"
                          onError={(e) => { e.target.onerror = null; e.target.src = "https://api.dicebear.com/9.x/avataaars/svg?seed=Fallback"; }} />
                        <span className="text-sm font-semibold text-muted-foreground">{b.fullName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{b.handle ? `@${b.handle}` : "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-muted-foreground">GST: {b.gstNumber || "—"}</span>
                        {b.gstCertificateUrl && (
                          <a href={b.gstCertificateUrl} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary hover:underline">
                            GST Certificate <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {b.verificationStatus === "verified" ? (
                        <Badge className="bg-emerald-500/10 hover:bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-semibold flex items-center gap-1 w-fit">
                          <ShieldCheck className="h-3.5 w-3.5" /> Verified
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500/10 hover:bg-red-500/10 text-red-600 border border-red-500/20 font-semibold flex items-center gap-1 w-fit">
                          <ShieldAlert className="h-3.5 w-3.5" /> Rejected
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button size="sm" variant="ghost"
                        className="rounded-full text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
                        onClick={() => handleReset(b._id, b.fullName)}>
                        <RotateCcw className="h-3.5 w-3.5" /> Reset
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {historyBrands && historyBrands.length > 0 && (
            <div className="border-t border-border px-6 py-3 text-xs text-muted-foreground">
              Total {historyBrands.length} processed request{historyBrands.length !== 1 && "s"}
            </div>
          )}
        </div>
      </div>

      {/* ── REVIEW MODAL ── */}
      {reviewTarget && (
        <BrandReviewModal
          brand={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onApprove={async () => {
            await handleAction(reviewTarget._id, "verified", reviewTarget.fullName);
            setReviewTarget(null);
          }}
          onSendMessage={handleSendMessage}
        />
      )}

      {/* ── REJECT MODAL ── */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <h3 className="font-display text-xl font-bold text-foreground mb-2">Reject {rejectTarget.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">Please provide a reason for rejection. This will be sent to the brand.</p>
            <form onSubmit={handleRejectSubmit}>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                placeholder="E.g., Document is blurry, GST does not match, etc."
                className="w-full h-24 rounded-lg border border-border bg-secondary/50 p-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 mb-4"
                required />
              <div className="flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => { setRejectTarget(null); setRejectReason(""); }}>Cancel</Button>
                <Button type="submit" variant="destructive" className="rounded-full">Reject Application</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}