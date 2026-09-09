import React, { useState, useEffect } from "react";
import { Plus, Trash2, VideoIcon, CheckCircle2, XCircle, Star, MessageSquare, UserCheck } from "lucide-react";
import api from "../lib/axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "../components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ClientReviewsPage() {
  const [activeTab, setActiveTab] = useState("user_reviews"); // "user_reviews" | "video_reviews"
  const [userReviews, setUserReviews] = useState([]);
  const [videoReviews, setVideoReviews] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    reviewerName: "", reviewText: "", rating: 5, targetRole: "brand", videoUrl: "", thumbnailUrl: ""
  });

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vRes, uRes] = await Promise.all([
        api.get("/admin/content/client-reviews").catch(() => ({ data: { data: [] } })),
        api.get(`/api/reviews/admin/all?status=${statusFilter}`).catch(() => ({ data: { data: [] } })),
      ]);
      setVideoReviews(vRes.data?.data || []);
      setUserReviews(uRes.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId) => {
    try {
      const res = await api.patch(`/api/reviews/admin/${reviewId}/approve`);
      toast.success(res.data?.message || "Review approved and now visible!");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve review");
    }
  };

  const handleReject = async (reviewId) => {
    try {
      const res = await api.patch(`/api/reviews/admin/${reviewId}/reject`);
      toast.info(res.data?.message || "Review rejected");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject review");
    }
  };

  const handleSubmitVideoReview = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/content/client-reviews", formData);
      setOpen(false);
      setFormData({ reviewerName: "", reviewText: "", rating: 5, targetRole: "brand", videoUrl: "", thumbnailUrl: "" });
      toast.success("Client video review saved!");
      fetchData();
    } catch (err) {
      toast.error("Error saving review");
    }
  };

  const handleDeleteVideo = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await api.delete(`/admin/content/client-reviews/${id}`);
      fetchData();
    } catch (err) {
      toast.error("Error deleting review");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reviews & Moderation</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Approve, moderate, or reject Brand & Creator collaboration reviews before they appear on profiles.
          </p>
        </div>

        {activeTab === "video_reviews" && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full gradient-sunset border-0 text-white shadow-glow text-xs font-semibold">
                <Plus className="h-4 w-4 mr-2" /> Add Featured Video Review
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle>Add Featured Client Review</DialogTitle>
                <DialogDescription className="hidden">Add a new client review</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitVideoReview} className="space-y-4 mt-2">
                <div>
                  <Label>Reviewer Name</Label>
                  <Input value={formData.reviewerName} onChange={e => setFormData({...formData, reviewerName: e.target.value})} required className="rounded-xl" />
                </div>
                <div>
                  <Label>Review Text</Label>
                  <Textarea value={formData.reviewText} onChange={e => setFormData({...formData, reviewText: e.target.value})} required className="rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Rating (1-5)</Label>
                    <Input type="number" min="1" max="5" value={formData.rating} onChange={e => setFormData({...formData, rating: Number(e.target.value)})} required className="rounded-xl" />
                  </div>
                  <div>
                    <Label>Target Role</Label>
                    <select 
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                      value={formData.targetRole} onChange={e => setFormData({...formData, targetRole: e.target.value})}
                    >
                      <option value="brand">Brand</option>
                      <option value="creator">Creator</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label>Video URL (YouTube/Vimeo/Direct)</Label>
                  <Input value={formData.videoUrl} onChange={e => setFormData({...formData, videoUrl: e.target.value})} required placeholder="https://..." className="rounded-xl" />
                </div>
                <div>
                  <Label>Thumbnail Image URL (Optional)</Label>
                  <Input value={formData.thumbnailUrl} onChange={e => setFormData({...formData, thumbnailUrl: e.target.value})} placeholder="https://..." className="rounded-xl" />
                </div>
                <Button type="submit" className="w-full rounded-full gradient-sunset text-white font-semibold">Save Review</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("user_reviews")}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "user_reviews"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <UserCheck className="h-4 w-4" /> Brand & Creator Reviews
          {userReviews.filter(r => r.status === "pending").length > 0 && (
            <span className="ml-1.5 px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-500 rounded-full font-bold">
              {userReviews.filter(r => r.status === "pending").length} Pending
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("video_reviews")}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "video_reviews"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <VideoIcon className="h-4 w-4" /> Featured Video Reviews ({videoReviews.length})
        </button>
      </div>

      {/* TAB 1: User Reviews Moderation */}
      {activeTab === "user_reviews" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-semibold">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs rounded-full border border-border bg-background px-3 py-1.5"
              >
                <option value="all">All Reviews</option>
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved (Live on Display)</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Reviewer</TableHead>
                  <TableHead>Target User</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Feedback Title & Content</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right pr-6">Admin Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-muted-foreground text-xs">
                      Loading user reviews...
                    </TableCell>
                  </TableRow>
                ) : userReviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-16 text-center text-muted-foreground text-xs">
                      <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                      No reviews found matching filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  userReviews.map((r) => (
                    <TableRow key={r._id}>
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={r.reviewerAvatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(r.reviewerName)}`}
                            alt=""
                            className="h-8 w-8 rounded-full border object-cover"
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://api.dicebear.com/9.x/avataaars/svg?seed=User"; }}
                          />
                          <div>
                            <span className="block font-semibold text-xs text-foreground">{r.reviewerName}</span>
                            <Badge variant="outline" className="text-[9px] uppercase font-bold px-1.5 py-0">
                              {r.reviewerRole}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <img
                            src={r.targetAvatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(r.targetName)}`}
                            alt=""
                            className="h-8 w-8 rounded-full border object-cover"
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://api.dicebear.com/9.x/avataaars/svg?seed=Target"; }}
                          />
                          <div>
                            <span className="block font-semibold text-xs text-foreground">{r.targetName}</span>
                            <Badge variant="outline" className="text-[9px] uppercase font-bold px-1.5 py-0">
                              {r.targetRole}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-bold text-xs">{r.rating}/5</span>
                        </div>
                      </TableCell>

                      <TableCell className="max-w-xs">
                        <span className="block font-bold text-xs text-foreground truncate">{r.title}</span>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{r.text}</p>
                        {r.campaignRef && (
                          <span className="inline-block text-[9px] text-primary/80 font-mono mt-1">Ref: {r.campaignRef}</span>
                        )}
                      </TableCell>

                      <TableCell>
                        {r.status === "approved" ? (
                          <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px] font-bold rounded-full">
                            ✓ Approved & Visible
                          </Badge>
                        ) : r.status === "rejected" ? (
                          <Badge className="bg-red-500/15 text-red-600 border-red-500/30 text-[10px] font-bold rounded-full">
                            ✕ Rejected
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-[10px] font-bold rounded-full">
                            ⏳ Pending Admin Approval
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {r.createdAt ? format(new Date(r.createdAt), "MMM d, yyyy") : "Recent"}
                      </TableCell>

                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          {r.status !== "approved" && (
                            <Button
                              size="sm"
                              className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-8 px-3 shadow-sm flex items-center gap-1"
                              onClick={() => handleApprove(r._id)}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                            </Button>
                          )}
                          {r.status !== "rejected" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full border-red-500/30 text-red-600 hover:bg-red-500/10 text-xs font-bold h-8 px-3 flex items-center gap-1"
                              onClick={() => handleReject(r._id)}
                            >
                              <XCircle className="h-3.5 w-3.5" /> Reject
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* TAB 2: Featured Video Reviews */}
      {activeTab === "video_reviews" && (
        <div className="rounded-3xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">Reviewer</TableHead>
                <TableHead>Media</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videoReviews.map((r) => (
                <TableRow key={r._id}>
                  <TableCell className="pl-6 font-medium text-xs">{r.reviewerName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {r.thumbnailUrl && <img src={r.thumbnailUrl} alt="" className="w-8 h-8 rounded object-cover" onError={(e) => { e.target.style.display = 'none'; }} />}
                      <a href={r.videoUrl} target="_blank" rel="noreferrer" className="text-primary flex items-center gap-1 hover:underline text-xs">
                        <VideoIcon className="w-3.5 h-3.5" /> Watch Video
                      </a>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize text-xs">{r.targetRole}</TableCell>
                  <TableCell className="text-xs font-semibold">{r.rating}/5</TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteVideo(r._id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {videoReviews.length === 0 && (
                <TableRow><TableCell colSpan={5} className="py-12 text-center text-xs text-muted-foreground">No featured reviews found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
