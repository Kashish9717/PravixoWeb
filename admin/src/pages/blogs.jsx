import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
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

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "", content: "", category: "Marketing Strategies", targetRole: "brand", coverImageUrl: "", published: true
  });

  const categories = [
    "How to Create Effective Campaigns", "Campaign Best Practices", "Creator Selection Tips", 
    "Marketing Strategies", "How to Increase Gig Performance", "Profile Optimization", 
    "Better Content Creation", "Increase Earnings", "Personal Branding"
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/admin/content/blogs");
      setBlogs(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/content/blogs", formData);
      setOpen(false);
      setFormData({ title: "", content: "", category: "Marketing Strategies", targetRole: "brand", coverImageUrl: "", published: true });
      fetchData();
    } catch (err) {
      alert("Error saving blog");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this blog?")) return;
    try {
      await api.delete(`/admin/content/blogs/${id}`);
      fetchData();
    } catch (err) {
      alert("Error deleting blog");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Blogs</h1>
        <p className="text-muted-foreground mt-2">
          Manage blog posts for creators and brands.
        </p>
      </div>

      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Blog</Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Blog Post</DialogTitle>
              <DialogDescription className="hidden">Add a new blog post</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <Label>Title</Label>
                <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div>
                <Label>Content</Label>
                <Textarea className="min-h-[150px]" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Target Audience</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={formData.targetRole} onChange={e => setFormData({...formData, targetRole: e.target.value})}
                  >
                    <option value="brand">Brands</option>
                    <option value="creator">Creators</option>
                  </select>
                </div>
              </div>
              <div>
                <Label>Cover Image URL</Label>
                <Input value={formData.coverImageUrl} onChange={e => setFormData({...formData, coverImageUrl: e.target.value})} placeholder="https://..." />
              </div>
              <Button type="submit" className="w-full">Save Blog</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div>Loading blogs...</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blogs.map(b => (
                <TableRow key={b._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {b.coverImageUrl && <img src={b.coverImageUrl} alt="" className="w-10 h-10 rounded object-cover" onError={(e) => { e.target.style.display = 'none'; }} />}
                      {b.title}
                    </div>
                  </TableCell>
                  <TableCell>{b.category}</TableCell>
                  <TableCell className="capitalize">{b.targetRole}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(b._id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {blogs.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No blogs found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
