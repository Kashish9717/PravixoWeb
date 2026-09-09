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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Blogs</h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
            Manage blog posts for creators and brands.
          </p>
        </div>

        <div className="flex justify-start sm:justify-end">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full gradient-sunset border-0 text-white shadow-glow text-xs font-semibold">
                <Plus className="h-4 w-4 mr-2" /> Add Blog
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl p-6">
              <DialogHeader>
                <DialogTitle>Add Blog Post</DialogTitle>
                <DialogDescription className="hidden">Add a new blog post</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <Label>Title</Label>
                  <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="rounded-xl" />
                </div>
                <div>
                  <Label>Content</Label>
                  <Textarea className="min-h-[150px] rounded-xl" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <select 
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Target Audience</Label>
                    <select 
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={formData.targetRole} onChange={e => setFormData({...formData, targetRole: e.target.value})}
                    >
                      <option value="brand">Brands</option>
                      <option value="creator">Creators</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label>Cover Image URL</Label>
                  <Input value={formData.coverImageUrl} onChange={e => setFormData({...formData, coverImageUrl: e.target.value})} placeholder="https://..." className="rounded-xl" />
                </div>
                <Button type="submit" className="w-full rounded-full gradient-sunset text-white font-semibold">Save Blog</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-muted-foreground">Loading blogs...</div>
      ) : (
        <>
          {/* Mobile Card View (< md) */}
          <div className="space-y-3 md:hidden">
            {blogs.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs rounded-2xl border border-border bg-card">
                No blogs found.
              </div>
            ) : (
              blogs.map((b) => (
                <div key={b._id} className="p-4 rounded-2xl border border-border bg-card space-y-3 shadow-xs">
                  <div className="flex items-start gap-3">
                    {b.coverImageUrl && (
                      <img src={b.coverImageUrl} alt="" className="w-14 h-14 rounded-xl object-cover border border-border shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm text-foreground leading-tight">{b.title}</h3>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">
                          {b.category}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase">
                          {b.targetRole}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-2 border-t border-border/40">
                    <Button variant="ghost" size="sm" className="h-8 text-xs text-destructive hover:bg-destructive/10" onClick={() => handleDelete(b._id)}>
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View (md+) */}
          <div className="hidden md:block rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <Table className="min-w-[650px]">
                <TableHeader>
                  <TableRow className="bg-secondary/20 hover:bg-secondary/20">
                    <TableHead className="pl-6">Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Target Audience</TableHead>
                    <TableHead className="text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blogs.map(b => (
                    <TableRow key={b._id}>
                      <TableCell className="pl-6 font-medium">
                        <div className="flex items-center gap-3">
                          {b.coverImageUrl && <img src={b.coverImageUrl} alt="" className="w-10 h-10 rounded-xl object-cover border border-border" onError={(e) => { e.target.style.display = 'none'; }} />}
                          <span className="text-sm font-semibold">{b.title}</span>
                        </div>
                      </TableCell>
                      <TableCell><span className="text-xs text-muted-foreground">{b.category}</span></TableCell>
                      <TableCell className="capitalize"><span className="text-xs font-semibold">{b.targetRole}</span></TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(b._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {blogs.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center py-12 text-muted-foreground text-xs">No blogs found.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
