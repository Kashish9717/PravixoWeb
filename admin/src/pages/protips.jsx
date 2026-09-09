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

export default function ProTipsPage() {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "", content: "", category: "", image: "", author: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/admin/content/protips");
      setTips(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/content/protips", formData);
      setOpen(false);
      setFormData({ title: "", content: "", category: "", image: "", author: "" });
      fetchData();
    } catch (err) {
      alert("Error saving tip");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this ProTip?")) return;
    try {
      await api.delete(`/admin/content/protips/${id}`);
      fetchData();
    } catch (err) {
      alert("Error deleting tip");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Pro Tips</h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
            Manage actionable pro tips displayed to users.
          </p>
        </div>

        <div className="flex justify-start sm:justify-end">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full gradient-sunset border-0 text-white shadow-glow text-xs font-semibold">
                <Plus className="h-4 w-4 mr-2" /> Add ProTip
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto rounded-3xl p-6">
              <DialogHeader>
                <DialogTitle>Add Pro Tip</DialogTitle>
                <DialogDescription className="hidden">Add a new pro tip</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <Label>Title</Label>
                  <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="rounded-xl" />
                </div>
                <div>
                  <Label>Content / Tip text</Label>
                  <Textarea value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} required className="min-h-[120px] rounded-xl" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="rounded-xl" />
                  </div>
                  <div>
                    <Label>Author</Label>
                    <Input value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} className="rounded-xl" />
                  </div>
                </div>
                <div>
                  <Label>Image URL (Optional)</Label>
                  <Input value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://..." className="rounded-xl" />
                </div>
                <Button type="submit" className="w-full rounded-full gradient-sunset text-white font-semibold">Save ProTip</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-muted-foreground">Loading tips...</div>
      ) : (
        <>
          {/* Mobile Card View (< md) */}
          <div className="space-y-3 md:hidden">
            {tips.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs rounded-2xl border border-border bg-card">
                No ProTips found.
              </div>
            ) : (
              tips.map((t) => (
                <div key={t._id} className="p-4 rounded-2xl border border-border bg-card space-y-3 shadow-xs">
                  <div className="flex items-start gap-3">
                    {t.image && (
                      <img src={t.image} alt="" className="w-12 h-12 rounded-xl object-cover border border-border shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm text-foreground leading-tight">{t.title}</h3>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {t.category && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">
                            {t.category}
                          </span>
                        )}
                        {t.author && (
                          <span className="text-[10px] text-muted-foreground">
                            by {t.author}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {t.content && (
                    <p className="text-xs text-muted-foreground bg-secondary/20 p-2.5 rounded-xl line-clamp-3">
                      {t.content}
                    </p>
                  )}

                  <div className="flex items-center justify-end pt-2 border-t border-border/40">
                    <Button variant="ghost" size="sm" className="h-8 text-xs text-destructive hover:bg-destructive/10" onClick={() => handleDelete(t._id)}>
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
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow className="bg-secondary/20 hover:bg-secondary/20">
                    <TableHead className="pl-6">Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead className="text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tips.map(t => (
                    <TableRow key={t._id}>
                      <TableCell className="pl-6 font-medium">
                        <div className="flex items-center gap-3">
                          {t.image && <img src={t.image} alt="" className="w-8 h-8 rounded-lg object-cover border border-border" onError={(e) => { e.target.style.display = 'none'; }} />}
                          <span className="text-sm font-semibold">{t.title}</span>
                        </div>
                      </TableCell>
                      <TableCell><span className="text-xs text-muted-foreground">{t.category || "—"}</span></TableCell>
                      <TableCell><span className="text-xs text-foreground font-medium">{t.author || "—"}</span></TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(t._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {tips.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center py-12 text-muted-foreground text-xs">No ProTips found.</TableCell></TableRow>
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
