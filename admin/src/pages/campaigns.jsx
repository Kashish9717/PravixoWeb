import { useEffect, useState } from "react";
import api from "@/lib/axios";
import {
  Megaphone,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Building2,
  MapPin,
  Calendar,
  IndianRupee,
  Layers,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";

export function CampaignsPage() {
  useEffect(() => {
    document.title = "Campaigns Verification — Pravixo Admin";
  }, []);

  const [campaigns, setCampaigns] = useState(null);
  const [statusFilter, setStatusFilter] = useState("PENDING_VERIFICATION");
  const [search, setSearch] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [rejectingCampaign, setRejectingCampaign] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCampaigns = async () => {
    try {
      const res = await api.get("/admin/campaigns");
      if (res.data.success) {
        setCampaigns(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch campaigns", err);
      toast.error("Failed to load campaigns.");
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleApprove = async (campaignId) => {
    setActionLoading(true);
    try {
      const res = await api.patch(`/admin/campaigns/${campaignId}/verify`, {
        status: "APPROVED",
      });
      if (res.data.success) {
        toast.success("Campaign approved! It is now visible to Creators.");
        setSelectedCampaign(null);
        fetchCampaigns();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve campaign.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (campaignId) => {
    setActionLoading(true);
    try {
      const res = await api.patch(`/admin/campaigns/${campaignId}/verify`, {
        status: "REJECTED",
        verificationFeedback: rejectionReason.trim(),
      });
      if (res.data.success) {
        toast.success("Campaign marked as Rejected.");
        setRejectingCampaign(null);
        setSelectedCampaign(null);
        setRejectionReason("");
        fetchCampaigns();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject campaign.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredCampaigns = campaigns?.filter((c) => {
    const matchesStatus = !statusFilter || c.status === statusFilter;
    const titleLower = (c.title || "").toLowerCase();
    const brandLower = (c.brandId?.fullName || "").toLowerCase();
    const catLower = (c.category || "").toLowerCase();
    const searchLower = search.toLowerCase();

    const matchesSearch =
      !search ||
      titleLower.includes(searchLower) ||
      brandLower.includes(searchLower) ||
      catLower.includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
            <XCircle className="h-3 w-3 mr-1" /> Rejected
          </Badge>
        );
      case "PENDING_VERIFICATION":
      default:
        return (
          <Badge variant="outline" className="bg-amber/10 text-amber border-amber/20 animate-pulse">
            <Clock className="h-3 w-3 mr-1" /> Pending Verification
          </Badge>
        );
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl flex items-center gap-2">
          <Megaphone className="h-7 w-7 text-primary" /> Campaign Verification
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review campaigns submitted by Brands. Approve them to make them discoverable to Creators or reject if guidelines are not met.
        </p>
      </div>

      {/* Filter Tabs & Search */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Pending Verification", val: "PENDING_VERIFICATION" },
            { label: "Approved", val: "APPROVED" },
            { label: "Rejected", val: "REJECTED" },
            { label: "All Campaigns", val: "" },
          ].map((tab) => (
            <Button
              key={tab.val}
              size="sm"
              variant={statusFilter === tab.val ? "default" : "outline"}
              className={`rounded-full text-xs px-4 h-9 ${
                statusFilter === tab.val ? "gradient-sunset border-0 text-white shadow-glow" : ""
              }`}
              onClick={() => setStatusFilter(tab.val)}
            >
              {tab.label}
              {campaigns && (
                <span className="ml-1.5 opacity-80">
                  (
                  {tab.val
                    ? campaigns.filter((c) => c.status === tab.val).length
                    : campaigns.length}
                  )
                </span>
              )}
            </Button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns, brands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="mt-6 rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/20">
              <TableHead className="font-semibold text-xs">Campaign</TableHead>
              <TableHead className="font-semibold text-xs">Brand</TableHead>
              <TableHead className="font-semibold text-xs">Category & Location</TableHead>
              <TableHead className="font-semibold text-xs">Budget</TableHead>
              <TableHead className="font-semibold text-xs">Per Creator Budget</TableHead>
              <TableHead className="font-semibold text-xs">Status</TableHead>
              <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!filteredCampaigns ? (
              [...Array(4)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredCampaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-sm text-muted-foreground">
                  No campaigns found in this view.
                </TableCell>
              </TableRow>
            ) : (
              filteredCampaigns.map((camp) => (
                <TableRow key={camp._id} className="hover:bg-secondary/10">
                  <TableCell>
                    <div>
                      <span className="font-semibold text-sm text-foreground block">
                        {camp.title}
                      </span>
                      <span className="text-[11px] text-muted-foreground line-clamp-1 max-w-[220px]">
                        {camp.description || "No description provided"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <img
                        src={
                          camp.brandId?.avatarUrl ||
                          `https://api.dicebear.com/9.x/avataaars/svg?seed=${camp.brandId?.fullName || "Brand"}`
                        }
                        alt=""
                        className="h-7 w-7 rounded-lg object-cover border border-border shrink-0"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://api.dicebear.com/9.x/avataaars/svg?seed=Fallback";
                        }}
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-foreground truncate block">
                          {camp.brandId?.fullName || "Unknown Brand"}
                        </span>
                        {camp.brandId?.email && (
                          <span className="text-[10px] text-muted-foreground truncate block">
                            {camp.brandId.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <Badge variant="secondary" className="text-[10px] rounded-md font-medium">
                        {camp.category}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground block mt-0.5">
                        {camp.location || "Pan India"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-bold text-foreground">
                      ₹{Number(camp.totalBudget || 0).toLocaleString("en-IN")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      ₹{Number(camp.minBudgetPerCreator || 0).toLocaleString("en-IN")} - ₹{Number(camp.maxBudgetPerCreator || 0).toLocaleString("en-IN")}
                    </span>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(camp.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-lg text-xs"
                        onClick={() => setSelectedCampaign(camp)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" /> Details
                      </Button>
                      {camp.status === "PENDING_VERIFICATION" && (
                        <>
                          <Button
                            size="sm"
                            className="h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5"
                            onClick={() => handleApprove(camp._id)}
                            disabled={actionLoading}
                          >
                            <Check className="h-3.5 w-3.5 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 rounded-lg text-xs px-2.5"
                            onClick={() => setRejectingCampaign(camp)}
                            disabled={actionLoading}
                          >
                            <X className="h-3.5 w-3.5 mr-1" /> Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Campaign Details Modal */}
      <Dialog open={!!selectedCampaign} onOpenChange={(open) => !open && setSelectedCampaign(null)}>
        <DialogContent className="sm:max-w-2xl rounded-3xl border border-border bg-card p-6">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" /> Campaign Details
              </DialogTitle>
              {selectedCampaign && getStatusBadge(selectedCampaign.status)}
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Review all campaign information provided by the brand.
            </DialogDescription>
          </DialogHeader>

          {selectedCampaign && (
            <div className="space-y-4 mt-2 max-h-[70vh] overflow-y-auto pr-1">
              {/* Brand Header */}
              <div className="flex items-center gap-3 p-3 bg-secondary/15 rounded-2xl border border-border/50">
                <img
                  src={
                    selectedCampaign.brandId?.avatarUrl ||
                    `https://api.dicebear.com/9.x/avataaars/svg?seed=${selectedCampaign.brandId?.fullName || "Brand"}`
                  }
                  alt=""
                  className="h-12 w-12 rounded-xl object-cover border border-border"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-foreground">
                    {selectedCampaign.brandId?.fullName}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {selectedCampaign.brandId?.email} · {selectedCampaign.brandId?.handle || "Brand Account"}
                  </p>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Campaign Title
                </label>
                <p className="text-base font-bold text-foreground">
                  {selectedCampaign.title}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Description
                </label>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap bg-background/50 p-3 rounded-xl border border-border/40">
                  {selectedCampaign.description || "No description provided."}
                </p>
              </div>

              {/* Key Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-secondary/10 p-3 rounded-xl border border-border/40 space-y-1">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
                    <IndianRupee className="h-3 w-3 text-primary" /> Total Budget
                  </span>
                  <p className="text-sm font-bold text-foreground">
                    ₹{Number(selectedCampaign.totalBudget || 0).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="bg-secondary/10 p-3 rounded-xl border border-border/40 space-y-1">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
                    <IndianRupee className="h-3 w-3 text-primary" /> Creator Budget
                  </span>
                  <p className="text-xs font-bold text-foreground">
                    ₹{Number(selectedCampaign.minBudgetPerCreator || 0).toLocaleString("en-IN")} - ₹{Number(selectedCampaign.maxBudgetPerCreator || 0).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="bg-secondary/10 p-3 rounded-xl border border-border/40 space-y-1">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
                    <Calendar className="h-3 w-3 text-primary" /> Start Date
                  </span>
                  <p className="text-xs font-medium text-foreground">
                    {format(new Date(selectedCampaign.startDate || Date.now()), "dd MMM yyyy")}
                  </p>
                </div>
                <div className="bg-secondary/10 p-3 rounded-xl border border-border/40 space-y-1">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
                    <Calendar className="h-3 w-3 text-primary" /> End Date
                  </span>
                  <p className="text-xs font-medium text-foreground">
                    {format(new Date(selectedCampaign.endDate || Date.now()), "dd MMM yyyy")}
                  </p>
                </div>
              </div>

              {/* Deliverables */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Layers className="h-3 w-3 text-primary" /> Deliverables Breakdown
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 bg-background border border-border/50 rounded-xl text-center">
                    <span className="text-xs text-muted-foreground block">Reels</span>
                    <span className="text-sm font-bold text-foreground">{selectedCampaign.deliverables?.reels || 0}</span>
                  </div>
                  <div className="p-2.5 bg-background border border-border/50 rounded-xl text-center">
                    <span className="text-xs text-muted-foreground block">Posts</span>
                    <span className="text-sm font-bold text-foreground">{selectedCampaign.deliverables?.posts || 0}</span>
                  </div>
                  <div className="p-2.5 bg-background border border-border/50 rounded-xl text-center">
                    <span className="text-xs text-muted-foreground block">Stories</span>
                    <span className="text-sm font-bold text-foreground">{selectedCampaign.deliverables?.stories || 0}</span>
                  </div>
                  <div className="p-2.5 bg-background border border-border/50 rounded-xl text-center">
                    <span className="text-xs text-muted-foreground block">Videos</span>
                    <span className="text-sm font-bold text-foreground">{selectedCampaign.deliverables?.videos || 0}</span>
                  </div>
                </div>
                {selectedCampaign.deliverables?.notes && (
                  <p className="text-xs text-muted-foreground italic">
                    Notes: {selectedCampaign.deliverables.notes}
                  </p>
                )}
              </div>

              {selectedCampaign.verificationFeedback && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-600">
                  <strong>Rejection Feedback:</strong> {selectedCampaign.verificationFeedback}
                </div>
              )}

              <DialogFooter className="pt-3 flex gap-2">
                <Button
                  variant="outline"
                  className="rounded-full flex-1 text-xs"
                  onClick={() => setSelectedCampaign(null)}
                >
                  Close
                </Button>
                {selectedCampaign.status === "PENDING_VERIFICATION" && (
                  <>
                    <Button
                      variant="destructive"
                      className="rounded-full flex-1 text-xs"
                      onClick={() => setRejectingCampaign(selectedCampaign)}
                      disabled={actionLoading}
                    >
                      <X className="h-3.5 w-3.5 mr-1" /> Reject Campaign
                    </Button>
                    <Button
                      className="rounded-full flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-glow"
                      onClick={() => handleApprove(selectedCampaign._id)}
                      disabled={actionLoading}
                    >
                      <Check className="h-3.5 w-3.5 mr-1" /> Approve Campaign
                    </Button>
                  </>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rejection Reason Dialog */}
      <Dialog open={!!rejectingCampaign} onOpenChange={(open) => !open && setRejectingCampaign(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl border border-border bg-card p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold text-destructive flex items-center gap-1.5">
              <XCircle className="h-5 w-5" /> Reject Campaign
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Provide a reason for rejecting this campaign. The brand will be notified with this feedback.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <Textarea
              placeholder="e.g. Budget is too low for the required deliverables, or guidelines violation..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              className="text-xs rounded-xl resize-none"
            />
            <DialogFooter className="pt-2 flex gap-2">
              <Button
                variant="outline"
                className="rounded-full flex-1 text-xs"
                onClick={() => setRejectingCampaign(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="rounded-full flex-1 text-xs font-semibold"
                onClick={() => handleReject(rejectingCampaign._id)}
                disabled={actionLoading}
              >
                Confirm Rejection
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CampaignsPage;
