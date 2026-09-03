import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextArea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/Dialog";
import { toast } from "sonner";
import { Sparkles, Plus, Trash2, Play, Star } from "lucide-react";
import api from "@/lib/api";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [selectedRole, setSelectedRole] = useState("brand");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState(null);

  const [formName, setFormName] = useState("");
  const [formText, setFormText] = useState("");
  const [formVideo, setFormVideo] = useState("");
  const [formThumb, setFormThumb] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [formRole, setFormRole] = useState("brand");

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await api.get("/video-reviews");

      setReviews(response.data?.data || []);
    } catch (error) {
      console.error("Fetch video reviews error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to fetch video reviews."
      );
    }
  };

  const isAdmin =
    profile?.role === "brand" && profile?.fullName === "Admin";

  const handleOpenCreate = () => {
    setFormName("");
    setFormText("");
    setFormVideo("");
    setFormThumb("");
    setFormRating(5);
    setFormRole(selectedRole);
    setShowCreateModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/video-reviews", {
        reviewerName: formName,
        reviewText: formText,
        videoUrl: formVideo,
        thumbnailUrl: formThumb || undefined,
        rating: formRating,
        targetRole: formRole,
      });

      if (response.data?.success) {
        toast.success("Video Review added successfully!");

        setShowCreateModal(false);

        await fetchReviews();
      }
    } catch (error) {
      console.error("Create video review error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to create video review."
      );
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this review?"
      )
    ) {
      return;
    }

    try {
      const response = await api.delete(
        `/video-reviews/${id}`
      );

      if (response.data?.success) {
        toast.success(
          "Video Review deleted successfully!"
        );

        setReviews((prev) =>
          prev.filter((review) => review._id !== id)
        );
      }
    } catch (error) {
      console.error("Delete video review error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to delete video review."
      );
    }
  };

  const visibleReviews = reviews.filter(
    (review) => review.targetRole === selectedRole
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-background py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/3 top-10 h-80 w-80 rounded-full bg-primary/10 opacity-30 blur-3xl" />

        <div className="absolute bottom-10 right-1/3 h-72 w-72 rounded-full bg-accent/10 opacity-40 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl space-y-12 px-4 sm:px-6 lg:px-8">

        {/* HERO SECTION */}

        <div className="flex flex-col items-center justify-between gap-6 border-b border-border/40 pb-6 md:flex-row">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Video Reviews
            </div>

            <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-foreground">
              What Our{" "}
              <span className="text-gradient-sunset">
                Partners Say
              </span>
            </h1>

            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Listen to success stories, platform walkthroughs,
              and collaboration results from brands and creators
              using Pravixo.
            </p>
          </div>

          {isAdmin && (
            <Button
              onClick={handleOpenCreate}
              className="rounded-full gradient-sunset border-0 font-semibold text-white shadow-glow"
            >
              <Plus className="mr-2 h-4.5 w-4.5" />
              Add Video Review
            </Button>
          )}
        </div>

        {/* ROLE TOGGLE */}

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
              Brand Reviews
            </button>

            <button
              onClick={() => setSelectedRole("creator")}
              className={`rounded-full px-6 py-2 text-xs font-semibold transition-all ${
                selectedRole === "creator"
                  ? "gradient-sunset text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Creator Reviews
            </button>

          </div>
        </div>

        {/* REVIEWS */}

        {visibleReviews.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <Play className="mx-auto mb-2 h-8 w-8 animate-pulse text-muted-foreground/30" />

            <p className="text-sm font-semibold text-muted-foreground">
              No video reviews posted yet for this role
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

            {visibleReviews.map((rev) => (
              <div
                key={rev._id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card transition-all duration-200 hover:shadow-elevated"
              >

                <div className="space-y-4">

                  {/* VIDEO THUMBNAIL */}

                  <div
                    className="relative h-48 w-full cursor-pointer overflow-hidden bg-secondary/50"
                    onClick={() =>
                      setActiveVideoUrl(rev.videoUrl)
                    }
                  >
                    <img
                      src={
                        rev.thumbnailUrl ||
                        "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800"
                      }
                      alt={rev.reviewerName}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/95 text-white shadow-lg transition-transform group-hover:scale-110">
                        <Play className="ml-0.5 h-5 w-5 fill-current" />
                      </div>
                    </div>
                  </div>

                  {/* REVIEW INFO */}

                  <div className="space-y-2 p-6">

                    <div className="flex items-center gap-1">
                      {Array.from({
                        length: rev.rating,
                      }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-3.5 w-3.5 fill-current text-amber"
                        />
                      ))}
                    </div>

                    <h4 className="font-display text-sm font-bold text-foreground">
                      {rev.reviewerName}
                    </h4>

                    <p className="text-xs leading-relaxed text-muted-foreground italic">
                      "{rev.reviewText}"
                    </p>

                  </div>
                </div>

                {/* DELETE */}

                {isAdmin && (
                  <div className="flex justify-end p-6 pt-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full text-red-500 hover:bg-red-500/10 hover:text-red-500"
                      onClick={() =>
                        handleDelete(rev._id)
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}

              </div>
            ))}

          </div>
        )}
      </div>

      {/* VIDEO PLAYER */}

      <Dialog
        open={!!activeVideoUrl}
        onOpenChange={(open) => {
          if (!open) {
            setActiveVideoUrl(null);
          }
        }}
      >
        <DialogContent className="overflow-hidden rounded-3xl border border-border bg-black p-0 sm:max-w-2xl">

          {activeVideoUrl && (
            <div className="aspect-video w-full">
              <iframe
                src={activeVideoUrl.replace(
                  "watch?v=",
                  "embed/"
                )}
                title="Video Review Player"
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

        </DialogContent>
      </Dialog>

      {/* CREATE REVIEW MODAL */}

      <Dialog
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      >
        <DialogContent className="rounded-3xl border border-border bg-card p-6 sm:max-w-md">

          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold">
              Add Video Review
            </DialogTitle>

            <DialogDescription className="text-xs text-muted-foreground">
              Submit YouTube links and rating points for
              partnership reviews.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSave}
            className="space-y-4"
          >

            {/* REVIEWER NAME */}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Reviewer Name *
              </label>

              <Input
                required
                placeholder="e.g. Kushal (Brand Executive)"
                value={formName}
                onChange={(e) =>
                  setFormName(e.target.value)
                }
              />
            </div>

            {/* RATING + ROLE */}

            <div className="grid grid-cols-2 gap-4">

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Rating *
                </label>

                <select
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  value={formRating}
                  onChange={(e) =>
                    setFormRating(
                      Number(e.target.value)
                    )
                  }
                >
                  <option value={5}>
                    5 Stars
                  </option>

                  <option value={4}>
                    4 Stars
                  </option>

                  <option value={3}>
                    3 Stars
                  </option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Reviewer Role *
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

            {/* VIDEO URL */}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Video Embed/YouTube Link *
              </label>

              <Input
                required
                placeholder="https://www.youtube.com/watch?v=..."
                value={formVideo}
                onChange={(e) =>
                  setFormVideo(e.target.value)
                }
              />
            </div>

            {/* THUMBNAIL */}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Thumbnail Image URL
              </label>

              <Input
                placeholder="Image link"
                value={formThumb}
                onChange={(e) =>
                  setFormThumb(e.target.value)
                }
              />
            </div>

            {/* REVIEW TEXT */}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Review Comments *
              </label>

              <Textarea
                required
                placeholder="Write comments..."
                value={formText}
                onChange={(e) =>
                  setFormText(e.target.value)
                }
              />
            </div>

            {/* FOOTER */}

            <DialogFooter className="pt-2">

              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() =>
                  setShowCreateModal(false)
                }
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="rounded-full gradient-sunset border-0 font-semibold text-white"
              >
                Save Review
              </Button>

            </DialogFooter>

          </form>

        </DialogContent>
      </Dialog>
    </div>
  );
}