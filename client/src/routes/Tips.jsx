import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextArea";
import { toast } from "sonner";
import {
  Sparkles,
  Plus,
  Trash2,
  ArrowRight,
  Lightbulb,
  Compass,
  Award,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/Dialog";
import api from "@/lib/api";


export default function Tips() {
  const [tips, setTips] = useState([]);
  const [selectedRole, setSelectedRole] = useState("brand");

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formIcon, setFormIcon] = useState("Lightbulb");
  const [formRole, setFormRole] = useState("brand");

  // Change this according to your auth implementation
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    try {
      const response = await api.get("/pro-tips");

      setTips(response.data?.data || []);
    } catch (error) {
      console.error("Fetch pro tips error:", error);

      toast.error(
        error.response?.data?.message || "Failed to fetch professional tips."
      );
    }
  };

  // This line forces the button to ALWAYS show, even if you are not logged in:
  const isAdmin = true;
  
  // This line is active so ONLY the Admin can see the buttons:
  // const isAdmin = profile?.role === "brand" && profile?.fullName === "Admin";

  const iconsMap = {
    Lightbulb: Lightbulb,
    Compass: Compass,
    Award: Award,
  };

  const handleOpenCreate = () => {
    setFormTitle("");
    setFormDesc("");
    setFormIcon("Lightbulb");
    setFormRole(selectedRole);
    setShowCreateModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/pro-tips", {
        title: formTitle,
        content: formDesc,
        category: formRole,
        iconName: formIcon,
        author: profile?.fullName || "Admin",
        isPublished: true,
      });

      if (response.data?.success) {
        toast.success("Professional Tip added successfully!");

        setShowCreateModal(false);

        await fetchTips();
      }
    } catch (error) {
      console.error("Create pro tip error:", error);

      toast.error(
        error.response?.data?.message || "Failed to create professional tip."
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this tip?")) {
      return;
    }

    try {
      const response = await api.delete(`/pro-tips/${id}`);

      if (response.data?.success) {
        toast.success("Professional Tip deleted successfully!");

        setTips((prev) => prev.filter((tip) => tip._id !== id));
      }
    } catch (error) {
      console.error("Delete pro tip error:", error);

      toast.error(
        error.response?.data?.message || "Failed to delete professional tip."
      );
    }
  };

  const visibleTips = tips.filter(
    (tip) =>
      tip.category === selectedRole ||
      tip.targetRole === selectedRole
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-background py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute right-1/4 top-10 h-80 w-80 rounded-full bg-primary/10 opacity-30 blur-3xl" />
        <div className="absolute bottom-10 left-1/4 h-72 w-72 rounded-full bg-accent/10 opacity-40 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl space-y-12 px-4 sm:px-6 lg:px-8">
        {/* HERO SECTION */}
        <div className="flex flex-col items-center justify-between gap-6 border-b border-border/40 pb-6 md:flex-row">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Professional Tips
            </div>

            <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-foreground">
              Guiding Your{" "}
              <span className="text-gradient-sunset">
                Growth Journey
              </span>
            </h1>

            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Quick advice, templates recommendations, and collaboration
              guidelines to optimize matching campaigns.
            </p>
          </div>

          {isAdmin && (
            <Button
              onClick={handleOpenCreate}
              className="rounded-full gradient-sunset border-0 font-semibold text-white shadow-glow"
            >
              <Plus className="mr-2 h-4.5 w-4.5" />
              Add New Tip
            </Button>
          )}
        </div>

        {/* ROLE TOGGLE TABS */}
        <div className="flex justify-center">
          <div className="inline-flex rounded-full border border-border bg-card p-1 shadow-sm">
            <button
              onClick={() => setSelectedRole("brand")}
              className={`rounded-full px-6 py-2 text-xs font-semibold transition-all ${
                selectedRole === "brand"
                  ? "gradient-sunset text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Tips for Brands
            </button>

            <button
              onClick={() => setSelectedRole("creator")}
              className={`rounded-full px-6 py-2 text-xs font-semibold transition-all ${
                selectedRole === "creator"
                  ? "gradient-sunset text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Tips for Creators
            </button>
          </div>
        </div>

        {/* TIPS CARDS */}
        {visibleTips.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <Lightbulb className="mx-auto mb-2 h-8 w-8 animate-pulse text-muted-foreground/30" />

            <p className="text-sm font-semibold text-muted-foreground">
              No professional tips added yet for this category
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {visibleTips.map((tip) => {
              const IconComponent =
                iconsMap[tip.iconName] || Lightbulb;

              return (
                <div
                  key={tip._id}
                  className="flex flex-col justify-between space-y-4 rounded-3xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/50"
                >
                  <div className="space-y-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <IconComponent className="h-5 w-5" />
                    </div>

                    <h4 className="font-display text-base font-bold text-foreground">
                      {tip.title}
                    </h4>

                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {tip.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                      Read More
                      <ArrowRight className="h-3 w-3" />
                    </span>

                    {isAdmin && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full text-red-500 hover:bg-red-500/10 hover:text-red-500"
                        onClick={() => handleDelete(tip._id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      <Dialog
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      >
        <DialogContent className="rounded-3xl border border-border bg-card p-6 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold">
              Add New Professional Tip
            </DialogTitle>

            <DialogDescription className="text-xs text-muted-foreground">
              Define practical checklists and tips for target platform roles.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Tip Title *
              </label>

              <Input
                required
                placeholder="Title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Target Role *
                </label>

                <select
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                >
                  <option value="brand">Brands</option>
                  <option value="creator">Creators</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Icon *
                </label>

                <select
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  value={formIcon}
                  onChange={(e) => setFormIcon(e.target.value)}
                >
                  <option value="Lightbulb">Lightbulb</option>
                  <option value="Compass">Compass</option>
                  <option value="Award">Award</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Advice Details *
              </label>

              <Textarea
                required
                placeholder="Enter description..."
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="rounded-full gradient-sunset border-0 font-semibold text-white"
              >
                Save Tip
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}