import React, { useState, useEffect } from "react";
import { Plus, Trash2, VideoIcon } from "lucide-react";
import api from "../lib/axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
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

export default function ClientReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    reviewerName: "", reviewText: "", rating: 5, targetRole: "brand", videoUrl: "", thumbnailUrl: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/admin/content/client-reviews");
      setReviews(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/content/client-reviews", formData);
      setOpen(false);
      setFormData({ reviewerName: "", reviewText: "", rating: 5, targetRole: "brand", videoUrl: "", thumbnailUrl: "" });
      fetchData();
    } catch (err) {
      alert("Error saving review");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await api.delete(`/admin/content/client-reviews/${id}`);
      fetchData();
    } catch (err) {
      alert("Error deleting review");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Client Reviews</h1>
        <p className="text-muted-foreground mt-2">
          Manage Video and Image reviews displayed on the client frontend.
        </p>
      </div>

      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Client Review</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Client Review</DialogTitle>
              <DialogDescription className="hidden">Add a new client review</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <Label>Reviewer Name</Label>
                <Input value={formData.reviewerName} onChange={e => setFormData({...formData, reviewerName: e.target.value})} required />
              </div>
              <div>
                <Label>Review Text</Label>
                <Textarea value={formData.reviewText} onChange={e => setFormData({...formData, reviewText: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Rating (1-5)</Label>
                  <Input type="number" min="1" max="5" value={formData.rating} onChange={e => setFormData({...formData, rating: Number(e.target.value)})} required />
                </div>
                <div>
                  <Label>Target Role</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={formData.targetRole} onChange={e => setFormData({...formData, targetRole: e.target.value})}
                  >
                    <option value="brand">Brand</option>
                    <option value="creator">Creator</option>
                  </select>
                </div>
              </div>
              <div>
                <Label>Video URL (YouTube/Vimeo/Cloud)</Label>
                <Input value={formData.videoUrl} onChange={e => setFormData({...formData, videoUrl: e.target.value})} required placeholder="https://..." />
              </div>
              <div>
                <Label>Thumbnail Image URL (Optional)</Label>
                <Input value={formData.thumbnailUrl} onChange={e => setFormData({...formData, thumbnailUrl: e.target.value})} placeholder="https://..." />
              </div>
              <Button type="submit" className="w-full">Save Review</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div>Loading reviews...</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reviewer</TableHead>
                <TableHead>Media</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map(r => (
                <TableRow key={r._id}>
                  <TableCell className="font-medium">{r.reviewerName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {r.thumbnailUrl && <img src={r.thumbnailUrl} alt="" className="w-8 h-8 rounded object-cover" onError={(e) => { e.target.style.display = 'none'; }} />}
                      <a href={r.videoUrl} target="_blank" rel="noreferrer" className="text-primary flex items-center gap-1 hover:underline">
                        <VideoIcon className="w-4 h-4" /> Link
                      </a>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{r.targetRole}</TableCell>
                  <TableCell>{r.rating}/5</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(r._id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {reviews.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No reviews found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
