import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Calendar, ArrowLeft, Share2, Copy } from "lucide-react";
import { FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

import api from "../lib/api";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

export default function BlogDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/blogs/${id}`);
        setBlog(response.data?.data);
      } catch (error) {
        console.error("Fetch blog details error:", error);
        toast.error("Failed to load the article.");
        navigate("/blog");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlog();
    }
  }, [id, navigate]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-20 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading article...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-background py-20 flex flex-col items-center justify-center">
        <h2 className="font-display text-2xl font-bold text-foreground">Article Not Found</h2>
        <p className="text-muted-foreground mt-2 mb-6">The article you are looking for does not exist.</p>
        <Button onClick={() => navigate("/blog")} className="rounded-full">
          Back to Blog
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-full max-w-4xl rounded-full bg-primary/5 opacity-50 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        
        {/* Navigation */}
        <Link 
          to="/blog" 
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Articles
        </Link>

        {/* Header Section */}
        <header className="space-y-6 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <Badge className="rounded-full border-0 gradient-sunset text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm">
              {blog.category}
            </Badge>
            {blog.targetRole && (
              <Badge variant="outline" className="rounded-full text-[10px] uppercase font-semibold">
                For {blog.targetRole}s
              </Badge>
            )}
            <span className="flex items-center text-xs text-muted-foreground font-medium">
              <Calendar className="mr-1.5 h-3.5 w-3.5" />
              {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : "Just now"}
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            {blog.title}
          </h1>
        </header>

        {/* Cover Image */}
        <div className="relative aspect-video w-full overflow-hidden rounded-[2rem] shadow-elevated border border-border">
          <img
            src={blog.coverImageUrl || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200"}
            alt={blog.title}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Layout for Content and Sidebar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          
          {/* Main Content */}
          <div className="md:col-span-8 lg:col-span-9">
            <article className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-bold prose-h2:text-3xl prose-p:leading-relaxed prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-2xl">
              <ReactMarkdown>{blog.content}</ReactMarkdown>
            </article>
          </div>

          {/* Sidebar */}
          <aside className="md:col-span-4 lg:col-span-3 space-y-8">
            <div className="sticky top-24 rounded-3xl border border-border bg-card p-6 shadow-card space-y-6">
              <div>
                <h4 className="font-display font-semibold text-foreground mb-3 text-sm">Share this article</h4>
                <div className="flex flex-wrap gap-2">
                  <Button size="icon" variant="outline" className="h-9 w-9 rounded-full text-[#1DA1F2] border-border hover:bg-[#1DA1F2]/10" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}>
                    <FaTwitter className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline" className="h-9 w-9 rounded-full text-[#0A66C2] border-border hover:bg-[#0A66C2]/10" onClick={() => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(blog.title)}`, '_blank')}>
                    <FaLinkedin className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline" className="h-9 w-9 rounded-full text-[#1877F2] border-border hover:bg-[#1877F2]/10" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}>
                    <FaFacebook className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline" className="h-9 w-9 rounded-full text-muted-foreground border-border" onClick={handleCopyLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="pt-6 border-t border-border">
                <h4 className="font-display font-semibold text-foreground mb-2 text-sm">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="rounded-full">{blog.category}</Badge>
                  <Badge variant="secondary" className="rounded-full">{blog.targetRole === 'brand' ? 'Brands' : 'Creators'}</Badge>
                  {blog.featured && <Badge variant="secondary" className="rounded-full bg-amber-500/10 text-amber-500">Featured</Badge>}
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
