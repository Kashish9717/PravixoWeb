import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../components/auth/AuthProvider";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/TextArea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../components/ui/Dialog";
import { Badge } from "../components/ui/Badge";
import { toast } from "sonner";

import {
  Sparkles,
  Calendar,
  Plus,
  Trash2,
  Edit2,
  Search,
  BookOpen,
} from "lucide-react";

import api from "../lib/api";

export function Blog() {
  const { profile } = useAuth();

  const [blogs, setBlogs] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");

  const [showManageModal, setShowManageModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formCover, setFormCover] = useState("");
  const [formCategory, setFormCategory] = useState(
    "How to Create Effective Campaigns"
  );
  const [formRole, setFormRole] = useState("brand");
  const [formPublished, setFormPublished] = useState(true);
  const [formFeatured, setFormFeatured] = useState(false);

  const [loading, setLoading] = useState(false);

  // This line forces the button to ALWAYS show, even if you are not logged in:
  const isAdmin = true;
  
  // This line is active so ONLY the Admin can see the buttons:
  // const isAdmin = profile?.role === "brand" && profile?.fullName === "Admin";

  const categories = [
    "How to Create Effective Campaigns",
    "Campaign Best Practices",
    "Creator Selection Tips",
    "Marketing Strategies",
    "How to Increase Gig Performance",
    "Profile Optimization",
    "Better Content Creation",
    "Increase Earnings",
    "Personal Branding",
  ];

  // ==========================================
  // GET BLOGS
  // ==========================================

  const fetchBlogs = async () => {
    try {
      setLoading(true);

      const response = await api.get("/blogs");

      /*
        Backend response:

        {
          success: true,
          data: [...]
        }
      */

      setBlogs(response.data?.data || []);
    } catch (error) {
      console.error("Fetch blogs error:", error);

      toast.error(
        error.response?.data?.message || "Failed to fetch blogs."
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch blogs when page loads
  useEffect(() => {
    fetchBlogs();
  }, []);

  // ==========================================
  // OPEN CREATE MODAL
  // ==========================================

  const handleOpenCreate = () => {
    setEditingBlog(null);

    setFormTitle("");
    setFormContent("");
    setFormCover("");
    setFormCategory("How to Create Effective Campaigns");
    setFormRole("brand");
    setFormPublished(true);
    setFormFeatured(false);

    setShowManageModal(true);
  };

  // ==========================================
  // OPEN EDIT MODAL
  // ==========================================

  const handleOpenEdit = (blog) => {
    setEditingBlog(blog);

    setFormTitle(blog.title || "");
    setFormContent(blog.content || "");
    setFormCover(blog.coverImageUrl || "");
    setFormCategory(
      blog.category || "How to Create Effective Campaigns"
    );
    setFormRole(blog.targetRole || "brand");
    setFormPublished(blog.published ?? true);
    setFormFeatured(blog.featured ?? false);

    setShowManageModal(true);
  };

  // ==========================================
  // CREATE / UPDATE BLOG
  // ==========================================

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        title: formTitle.trim(),
        content: formContent.trim(),
        coverImageUrl: formCover.trim() || undefined,
        category: formCategory,
        targetRole: formRole,
        published: formPublished,
        featured: formFeatured,
      };

      // UPDATE
      if (editingBlog) {
        const response = await api.put(
          `/blogs/${editingBlog._id}`,
          payload
        );

        const updatedBlog = response.data?.data;

        if (updatedBlog) {
          setBlogs((prevBlogs) =>
            prevBlogs.map((blog) =>
              blog._id === updatedBlog._id
                ? updatedBlog
                : blog
            )
          );
        }

        toast.success("Blog post updated successfully!");
      }

      // CREATE
      else {
        const response = await api.post("/blogs", payload);

        const newBlog = response.data?.data;

        if (newBlog) {
          setBlogs((prevBlogs) => [newBlog, ...prevBlogs]);
        }

        toast.success("Blog post published successfully!");
      }

      setShowManageModal(false);
    } catch (error) {
      console.error("Save blog error:", error);

      toast.error(
        error.response?.data?.message || "Failed to save blog."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // DELETE BLOG
  // ==========================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this blog post?"
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      await api.delete(`/blogs/${id}`);

      setBlogs((prevBlogs) =>
        prevBlogs.filter((blog) => blog._id !== id)
      );

      toast.success("Blog post deleted successfully!");
    } catch (error) {
      console.error("Delete blog error:", error);

      toast.error(
        error.response?.data?.message || "Failed to delete blog."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FILTER BLOGS
  // ==========================================

  const filteredBlogs = blogs.filter((blog) => {
    const title = blog.title || "";
    const content = blog.content || "";

    const search = searchQuery.toLowerCase();

    const matchesSearch =
      title.toLowerCase().includes(search) ||
      content.toLowerCase().includes(search);

    const matchesCategory =
      selectedCategory === "all" ||
      blog.category === selectedCategory;

    const matchesRole =
      selectedRole === "all" ||
      blog.targetRole === selectedRole;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesRole
    );
  });

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-background relative overflow-hidden py-12">

      {/* Background decoration */}

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-10 left-1/4 h-80 w-80 rounded-full bg-primary/10 opacity-30 blur-3xl" />

        <div className="absolute bottom-10 right-1/4 h-72 w-72 rounded-full bg-accent/10 opacity-40 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">

        {/* =====================================
            HERO
        ====================================== */}

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-border/40">

          <div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />

              Blog
            </div>

            <h1 className="font-display text-4xl font-extrabold tracking-tight mt-2 text-foreground">
              Knowledge Hub &{" "}
              <span className="text-gradient-sunset">
                Insights
              </span>
            </h1>

            <p className="text-sm text-muted-foreground mt-2 max-w-xl">
              Professional campaign checklists, selects templates,
              growth tips, and success guides curated for Brands
              and Creators.
            </p>

          </div>

          {isAdmin && (
            <Button
              onClick={handleOpenCreate}
              className="rounded-full gradient-sunset border-0 text-white font-semibold shadow-glow"
            >
              <Plus className="h-4.5 w-4.5 mr-2" />

              Write Article
            </Button>
          )}

        </div>

        {/* =====================================
            SEARCH & FILTER
        ====================================== */}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          <div className="relative md:col-span-2">

            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Search blog articles..."
              className="pl-10 rounded-full border-border bg-card/60"
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
            />

          </div>

          <div>

            <select
              className="w-full rounded-full border border-border bg-card/60 px-4 h-10 text-xs text-foreground focus:outline-none"
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(e.target.value)
              }
            >
              <option value="all">
                All Categories
              </option>

              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>

          </div>

          <div>

            <select
              className="w-full rounded-full border border-border bg-card/60 px-4 h-10 text-xs text-foreground focus:outline-none"
              value={selectedRole}
              onChange={(e) =>
                setSelectedRole(e.target.value)
              }
            >
              <option value="all">
                Target Roles
              </option>

              <option value="brand">
                For Brands Only
              </option>

              <option value="creator">
                For Creators Only
              </option>
            </select>

          </div>

        </div>

        {/* =====================================
            BLOG GRID
        ====================================== */}

        {loading && blogs.length === 0 ? (

          <div className="rounded-3xl border border-border p-12 text-center bg-card">
            <p className="text-sm text-muted-foreground">
              Loading blogs...
            </p>
          </div>

        ) : filteredBlogs.length === 0 ? (

          <div className="rounded-3xl border border-dashed border-border p-12 text-center bg-card">

            <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />

            <p className="font-semibold text-sm text-muted-foreground">
              No articles published matching your search query
            </p>

          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {filteredBlogs.map((blog) => (

              <Link
                key={blog._id}
                to={`/blog/${blog._id}`}
                className="rounded-3xl border border-border bg-card flex flex-col justify-between overflow-hidden relative shadow-sm group hover:-translate-y-1 transition-transform"
              >

                <div className="space-y-4">

                  {/* Cover */}

                  <div className="h-48 w-full bg-secondary/50 relative overflow-hidden">

                    <img
                      src={
                        blog.coverImageUrl ||
                        "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800"
                      }
                      alt={blog.title || "Cover"}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    <Badge className="absolute top-4 left-4 rounded-full border-0 gradient-sunset text-white text-[9px] uppercase font-bold tracking-wider">
                      {blog.targetRole}
                    </Badge>

                  </div>

                  {/* Content */}

                  <div className="p-6 space-y-3">

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">

                      <span className="font-semibold">
                        {blog.category}
                      </span>

                      <span className="flex items-center gap-1">

                        <Calendar className="h-3 w-3" />

                        {blog.createdAt
                          ? new Date(
                              blog.createdAt
                            ).toLocaleDateString()
                          : "N/A"}

                      </span>

                    </div>

                    <h3 className="font-display text-base font-bold text-foreground line-clamp-2">
                      {blog.title}
                    </h3>

                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {blog.content}
                    </p>

                  </div>

                </div>

                {/* Bottom */}

                <div className="p-6 pt-0 flex justify-between items-center">

                  <Badge
                    variant="secondary"
                    className="rounded-full text-[10px]"
                  >
                    {blog.featured
                      ? "Featured"
                      : "Regular"}
                  </Badge>

                  {isAdmin && (

                    <div className="flex gap-2">

                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full"
                        onClick={() =>
                          handleOpenEdit(blog)
                        }
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full text-red-500 hover:text-red-500 hover:bg-red-500/10"
                        onClick={() =>
                          handleDelete(blog._id)
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>

                    </div>

                  )}

                </div>

              </Link>

            ))}

          </div>

        )}

      </div>

      {/* =====================================
          CREATE / EDIT MODAL
      ====================================== */}

      <Dialog
        open={showManageModal}
        onOpenChange={setShowManageModal}
      >

        <DialogContent className="sm:max-w-xl rounded-3xl border border-border bg-card p-6">

          <DialogHeader>

            <DialogTitle className="font-display text-lg font-bold">
              {editingBlog
                ? "Edit Blog Post"
                : "Write Blog Post"}
            </DialogTitle>

            <DialogDescription className="text-xs text-muted-foreground">
              Create educational guidelines for platform participants.
            </DialogDescription>

          </DialogHeader>

          <form
            onSubmit={handleSave}
            className="space-y-4"
          >

            {/* Title */}

            <div className="space-y-1.5">

              <label className="text-xs font-semibold text-foreground">
                Title *
              </label>

              <Input
                required
                placeholder="Title of the article"
                value={formTitle}
                onChange={(e) =>
                  setFormTitle(e.target.value)
                }
              />

            </div>

            {/* Category + Role */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="space-y-1.5">

                <label className="text-xs font-semibold text-foreground">
                  Category *
                </label>

                <select
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  value={formCategory}
                  onChange={(e) =>
                    setFormCategory(e.target.value)
                  }
                >

                  {categories.map((category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}

                </select>

              </div>

              <div className="space-y-1.5">

                <label className="text-xs font-semibold text-foreground">
                  Target Audience *
                </label>

                <select
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  value={formRole}
                  onChange={(e) =>
                    setFormRole(e.target.value)
                  }
                >

                  <option value="brand">
                    Brands
                  </option>

                  <option value="creator">
                    Creators
                  </option>

                </select>

              </div>

            </div>

            {/* Cover */}

            <div className="space-y-1.5">

              <label className="text-xs font-semibold text-foreground">
                Cover Image URL
              </label>

              <Input
                placeholder="Link to cover image"
                value={formCover}
                onChange={(e) =>
                  setFormCover(e.target.value)
                }
              />

            </div>

            {/* Content */}

            <div className="space-y-1.5">

              <label className="text-xs font-semibold text-foreground">
                Rich Text/Markdown Content *
              </label>

              <Textarea
                required
                rows={7}
                placeholder="Write your educational content here..."
                value={formContent}
                onChange={(e) =>
                  setFormContent(e.target.value)
                }
              />

            </div>

            {/* Checkboxes */}

            <div className="flex gap-4 pt-2">

              <label className="flex items-center gap-2 text-xs cursor-pointer">

                <input
                  type="checkbox"
                  checked={formFeatured}
                  onChange={(e) =>
                    setFormFeatured(e.target.checked)
                  }
                  className="rounded"
                />

                Featured Article

              </label>

              <label className="flex items-center gap-2 text-xs cursor-pointer">

                <input
                  type="checkbox"
                  checked={formPublished}
                  onChange={(e) =>
                    setFormPublished(e.target.checked)
                  }
                  className="rounded"
                />

                Publish Immediately

              </label>

            </div>

            {/* Footer */}

            <DialogFooter className="pt-2">

              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() =>
                  setShowManageModal(false)
                }
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={loading}
                className="rounded-full gradient-sunset border-0 text-white font-semibold"
              >
                {loading
                  ? "Saving..."
                  : editingBlog
                  ? "Save Updates"
                  : "Publish Now"}
              </Button>

            </DialogFooter>

          </form>

        </DialogContent>

      </Dialog>

    </div>
  );
}

export default Blog;