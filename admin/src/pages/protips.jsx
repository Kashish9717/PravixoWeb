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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pro Tips</h1>
        <p className="text-muted-foreground mt-2">
          Manage actionable pro tips displayed to users.
        </p>
      </div>

      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add ProTip</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Pro Tip</DialogTitle>
              <DialogDescription className="hidden">Add a new pro tip</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <Label>Title</Label>
                <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div>
                <Label>Content / Tip text</Label>
                <Textarea value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                </div>
                <div>
                  <Label>Author</Label>
                  <Input value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
                </div>
              </div>
              <div>
                <Label>Image URL (Optional)</Label>
                <Input value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://..." />
              </div>
              <Button type="submit" className="w-full">Save ProTip</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div>Loading tips...</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tips.map(t => (
                <TableRow key={t._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {t.image && <img src={t.image} alt="" className="w-8 h-8 rounded object-cover" onError={(e) => { e.target.style.display = 'none'; }} />}
                      {t.title}
                    </div>
                  </TableCell>
                  <TableCell>{t.category || "-"}</TableCell>
                  <TableCell>{t.author || "-"}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(t._id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {tips.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No ProTips found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
