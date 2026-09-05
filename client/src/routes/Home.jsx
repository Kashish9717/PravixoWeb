import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  Search,
  Star,
  TrendingUp,
  Users,
  Zap,
  CheckCircle2,
  MapPin,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/Carousel";

import { useAuth } from "@/components/auth/AuthProvider";
import {
  categories,
  formatFollowers,
  influencers,
  mockBrands,
} from "../data/influencer";
import { formatINR } from "@/lib/format";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

import heroBanner from "@/assets/hero-banner.jpg";
import pravixoFlow from "@/assets/pravixo-flow.jpeg";

function FeaturedProfileCard({ inf, user, handleCardClick }) {
  const isBrand = inf.role === "brand";
  const targetUrl = isBrand ? `/brand/${inf.id}` : `/influencer/${inf.id}`;

  const handleClick = (e) => {
    if (!user) {
      e.preventDefault();
      handleCardClick(inf.id, isBrand ? "brand" : "creator");
    }
  };

  return (
    <Link
      to={targetUrl}
      onClick={handleClick}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
    >
      {/* COVER */}
      <div className="relative aspect-[1361/450] w-full overflow-hidden bg-muted">
        <img
          src={inf.cover}
          alt={inf.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=80";
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
        <Badge
          className="
            absolute right-2 top-2
            rounded-full border-0
            bg-white/90 text-black
            dark:bg-zinc-800/90 dark:text-white
            backdrop-blur
            px-2 py-0.5 sm:px-3 sm:py-1
            text-[10px] sm:text-xs
            transition-colors duration-300
            hover:bg-yellow-400 hover:text-black
            dark:hover:bg-yellow-400 dark:hover:text-black
          "
        >
          {inf.category}
        </Badge>
      </div>

      {/* PROFILE CONTENT */}
      <div className="-mt-7 flex flex-1 flex-col px-3 pb-3 sm:-mt-10 sm:px-5 sm:pb-5">
        <img src={inf.avatar}
          alt={inf.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="relative z-10 h-14 w-14 rounded-full border-4 border-card bg-muted object-cover shadow-elevated sm:h-20 sm:w-20"
         onError={(e) => { e.target.onerror = null; e.target.src = "https://api.dicebear.com/9.x/avataaars/svg?seed=Fallback"; }} />

        <div className="mt-2.5 flex items-start justify-between gap-2 sm:mt-3">
          <div className="min-w-0">
            <h3 className="truncate font-display text-xs font-semibold sm:text-base">
              {inf.name}
            </h3>
            <p className="truncate text-[10px] text-muted-foreground sm:text-xs">
              {inf.handle}
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-0.5 text-xs font-medium text-amber-500 sm:text-sm">
            <Star className="h-3 w-3 fill-current sm:h-4 sm:w-4" />
            {inf.rating || 5.0}
          </span>
        </div>

        <div className="mt-auto pt-3">
          {/* LOCATION + FOLLOWERS */}
          <div className="mt-3 flex flex-col justify-between gap-1 border-t border-border pt-3 text-[10px] sm:mt-4 sm:flex-row sm:items-center sm:text-sm">
            <span className="flex items-center gap-0.5 truncate text-muted-foreground">
              <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              {inf.location?.split(",")[0] || "India"}
            </span>
            <span>
              <strong>{formatFollowers(inf.followers || 0)}</strong>{" "}
              <span className="text-muted-foreground">followers</span>
            </span>
          </div>

          {/* PRICE */}
          <div className="mt-1.5 flex items-center justify-between text-[10px] sm:mt-2 sm:text-sm">
            <span className="text-muted-foreground">From</span>
            <span className="font-display text-xs font-bold text-gradient-sunset sm:text-lg">
              {formatINR(inf.startingPrice || 0)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingRedirectUrl, setPendingRedirectUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [liveCreators, setLiveCreators] = useState([]);
  const [liveBrands, setLiveBrands] = useState([]);

  const [creatorsApi, setCreatorsApi] = useState(null);
  const [brandsApi, setBrandsApi] = useState(null);

  const [creatorsHovered, setCreatorsHovered] = useState(false);
  const [brandsHovered, setBrandsHovered] = useState(false);

  const [creatorsIndex, setCreatorsIndex] = useState(0);
  const [brandsIndex, setBrandsIndex] = useState(0);

  const [creatorsSnaps, setCreatorsSnaps] = useState([]);
  const [brandsSnaps, setBrandsSnaps] = useState([]);

  useEffect(() => {
    document.title = "Pravixo — Hire creators that move the needle";

    const fetchLiveProfiles = async () => {
      try {
        const [creatorsRes, brandsRes] = await Promise.all([
          api.get("/profiles", { params: { role: "creator" } }),
          api.get("/profiles", { params: { role: "brand" } }),
        ]);

        const creatorsData =
          creatorsRes.data?.data ||
          creatorsRes.data?.profiles ||
          creatorsRes.data ||
          [];

        const brandsData =
          brandsRes.data?.data ||
          brandsRes.data?.profiles ||
          brandsRes.data ||
          [];

        if (Array.isArray(creatorsData)) {
          setLiveCreators(creatorsData);
        }
        if (Array.isArray(brandsData)) {
          setLiveBrands(brandsData);
        }
      } catch (error) {
        console.error("Failed to load profiles for home:", error);
      }
    };

    fetchLiveProfiles();
  }, []);

  const featuredCreators = useMemo(() => {
    const live = (liveCreators || []).map((p) => ({
      id: p._id || p.id,
      name: p.fullName || p.name || "Creator",
      handle:
        p.handle ||
        `@${(p.fullName || p.name || "creator")
          .toLowerCase()
          .replace(/\s/g, "")}`,
      category: p.category || "General",
      followers:
        (p.instagramFollowers || 0) +
        (p.facebookFollowers || 0) +
        (p.linkedinFollowers || 0) +
        (p.youtubeFollowers || 0) +
        (p.quoraFollowers || 0) +
        (p.twitterFollowers || 0),
      startingPrice: p.startingPrice || 0,
      location: p.location || "India",
      rating: p.rating ?? 5.0,
      reviews: p.reviewsCount ?? 0,
      available: true,
      avatar:
        (p.avatarUrl && p.avatarUrl !== "undefined" && p.avatarUrl !== "null")
          ? (p.avatarUrl.startsWith("/") ? `${(import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\\/api$/, "")}${p.avatarUrl}` : p.avatarUrl)
          : `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(
              p.fullName || p.name || "creator"
            )}`,
      cover:
        (p.coverUrl && p.coverUrl !== "undefined" && p.coverUrl !== "null")
          ? (p.coverUrl.startsWith("/") ? `${(import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\\/api$/, "")}${p.coverUrl}` : p.coverUrl)
          : `https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=80`,
      bio: p.bio || "",
      role: p.role || "creator",
    }));

    const orderedLive = [...live].sort((a, b) => {
      if (profile?.role === "creator") {
        if (a.id === profile?._id) return -1;
        if (b.id === profile?._id) return 1;
      }
      return 0;
    });

    return [...orderedLive, ...influencers].slice(0, 6);
  }, [liveCreators, profile]);

  const featuredBrands = useMemo(() => {
    const live = (liveBrands || []).map((p) => ({
      id: p._id || p.id,
      name: p.fullName || p.name || "Brand",
      handle:
        p.handle ||
        `@${(p.fullName || p.name || "brand")
          .toLowerCase()
          .replace(/\s/g, "")}`,
      category: p.category || "General",
      followers: 0,
      startingPrice: p.startingPrice || 0,
      location: p.location || "India",
      rating: p.rating ?? 5.0,
      reviews: p.reviewsCount ?? 0,
      available: true,
      avatar:
        (p.avatarUrl && p.avatarUrl !== "undefined" && p.avatarUrl !== "null")
          ? (p.avatarUrl.startsWith("/") ? `${(import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\\/api$/, "")}${p.avatarUrl}` : p.avatarUrl)
          : `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(
              p.fullName || p.name || "brand"
            )}`,
      cover:
        (p.coverUrl && p.coverUrl !== "undefined" && p.coverUrl !== "null")
          ? (p.coverUrl.startsWith("/") ? `${(import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\\/api$/, "")}${p.coverUrl}` : p.coverUrl)
          : `https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=80`,
      bio: p.bio || "",
      role: p.role || "brand",
    }));

    return [...live, ...mockBrands].slice(0, 6);
  }, [liveBrands]);

  const handleProfileCardClick = (profileId, role) => {
    const targetUrl =
      role === "brand" ? `/brand/${profileId}` : `/influencer/${profileId}`;
    setPendingRedirectUrl(targetUrl);
    setShowAuthModal(true);
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/browse");
    }
  };

  const isSuspended =
    profile?.isSuspended &&
    profile?.suspendedUntil &&
    new Date(profile.suspendedUntil) > new Date();

  // Autoplay for creators
  useEffect(() => {
    if (!creatorsApi || creatorsHovered) return;
    const interval = setInterval(() => {
      creatorsApi.scrollNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [creatorsApi, creatorsHovered]);

  // Autoplay for brands
  useEffect(() => {
    if (!brandsApi || brandsHovered) return;
    const interval = setInterval(() => {
      brandsApi.scrollNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [brandsApi, brandsHovered]);

  // Creators snaps & select listener
  useEffect(() => {
    if (!creatorsApi) return;
    const updateCreators = () => {
      setCreatorsSnaps(creatorsApi.scrollSnapList?.() || []);
      setCreatorsIndex(creatorsApi.selectedScrollSnap?.() || 0);
    };
    updateCreators();
    creatorsApi.on?.("select", updateCreators);
    return () => {
      creatorsApi.off?.("select", updateCreators);
    };
  }, [creatorsApi]);

  // Brands snaps & select listener
  useEffect(() => {
    if (!brandsApi) return;
    const updateBrands = () => {
      setBrandsSnaps(brandsApi.scrollSnapList?.() || []);
      setBrandsIndex(brandsApi.selectedScrollSnap?.() || 0);
    };
    updateBrands();
    brandsApi.on?.("select", updateBrands);
    return () => {
      brandsApi.off?.("select", updateBrands);
    };
  }, [brandsApi]);

  return (
    <div className="overflow-hidden">
      {/* SUSPENSION ALERT */}
      {isSuspended && (
        <div className="border-b border-destructive/30 bg-destructive/15 px-4 py-3 text-center text-sm font-medium text-destructive">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              Your account is temporarily suspended until{" "}
              {new Date(profile.suspendedUntil).toLocaleDateString()}. Reason:{" "}
              {profile.suspensionReason || "Guideline violation"}
            </span>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* Background Banner Image */}
        <div className="absolute inset-0 -z-10">
          <img
            src={heroBanner}
            alt="Featured creators across fashion, fitness, tech, beauty, travel and food"
            className="h-full w-full scale-110 object-cover blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/75 to-background" />
          <div className="absolute inset-0 bg-background/40" />
        </div>

        {/* Gradient Blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-32 -top-40 h-96 w-96 rounded-full gradient-warm opacity-20 blur-3xl animate-blob" />
          <div
            className="absolute right-0 top-20 h-[28rem] w-[28rem] rounded-full gradient-pink opacity-20 blur-3xl animate-blob"
            style={{ animationDelay: "4s" }}
          />
        </div>

        <div className="mx-auto max-w-7xl px-6 pt-24 pb-8 sm:px-8 sm:pt-28 lg:px-8">
          <div className="mx-auto max-w-5xl text-center">

            {/* Heading */}
            <h1 className="mt-4 text-center font-display font-bold leading-[1.05] tracking-tight">
              <span className="block text-[clamp(2.5rem,5.5vw,5rem)] text-foreground">
                Find the right influencers
              </span>
              <span className="block text-[clamp(2.5rem,5.5vw,5rem)] text-gradient-sunset">
                for your Brand in Minutes.
              </span>
            </h1>

            {/* Description */}
            <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
              Discover vetted influencers across every niche. Launch campaigns
              in days, not weeks. Get measurable results.
            </p>

            {/* Search Input */}
            <form
              onSubmit={handleSearch}
              className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-full border border-border bg-card/90 p-2 shadow-soft backdrop-blur focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20"
            >
              <Search className="ml-3 h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                type="text"
                placeholder="Try 'fashion creator in Paris'"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
              />
              <Button
                type="submit"
                size="sm"
                className="rounded-full gradient-sunset border-0 px-5 text-white shadow-glow"
              >
                Search <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </form>

            {/* Payment info buttons right under search */}
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-xs font-medium"
                onClick={() =>
                  navigate("/protection-info", {
                    state: { type: "creator" },
                  })
                }
              >
                How do I get paid? (Creators)
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-xs font-medium"
                onClick={() =>
                  navigate("/protection-info", {
                    state: { type: "brand" },
                  })
                }
              >
                How is my money protected? (Brands)
              </Button>
            </div>

            {/* If logged out CTA Buttons */}
            {!user && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link to="/register?role=brand">
                  <Button
                    size="lg"
                    className="min-w-[210px] justify-center rounded-full gradient-sunset border-0 text-white shadow-glow transition-transform hover:scale-105 hover:opacity-95"
                  >
                    I'm a brand
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/register?role=creator">
                  <Button
                    size="lg"
                    className="min-w-[210px] justify-center rounded-full gradient-sunset border-0 text-white shadow-glow transition-transform hover:scale-105 hover:opacity-95"
                  >
                    I'm an influencer
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================
          BROWSE BY CATEGORY
      ========================= */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Browse by category
            </h2>
            <p className="mt-2 text-muted-foreground">
              Find the perfect voice for your brand.
            </p>
          </div>
          <Link
            to="/browse"
            className="text-sm font-medium text-amber-500 hover:text-amber-400 transition-colors"
          >
            All categories →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.name}
              to={`/browse?category=${encodeURIComponent(c.name)}`}
              className="group rounded-3xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-elevated"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-2xl transition-transform duration-300 group-hover:scale-110">
                {c.emoji}
              </div>
              <h3 className="font-display font-semibold text-foreground">
                {c.name}
              </h3>
              {c.count && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {c.count.toLocaleString()} creators
                </p>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* =========================
          FEATURED CREATORS
      ========================= */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Featured creators
            </h2>
            <p className="mt-2 text-muted-foreground">
              Hand-picked by our team this week.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/browse?role=creator"
              className="hidden text-sm font-medium text-primary hover:underline sm:block"
            >
              View all →
            </Link>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-border bg-card hover:bg-accent"
                onClick={() => creatorsApi?.scrollPrev()}
                aria-label="Previous slide"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-border bg-card hover:bg-accent"
                onClick={() => creatorsApi?.scrollNext()}
                aria-label="Next slide"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div
          onMouseEnter={() => setCreatorsHovered(true)}
          onMouseLeave={() => setCreatorsHovered(false)}
        >
          <Carousel
            setApi={setCreatorsApi}
            opts={{ loop: true, align: "start" }}
            className="w-full"
          >
            <CarouselContent className="-ml-3 sm:-ml-6">
              {featuredCreators.map((inf) => (
                <CarouselItem
                  key={inf.id}
                  className="basis-full pl-3 sm:basis-1/2 sm:pl-6 lg:basis-1/3"
                >
                  <FeaturedProfileCard
                    inf={inf}
                    user={user}
                    handleCardClick={handleProfileCardClick}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* Creator Dots */}
        {creatorsSnaps.length > 1 && (
          <div className="mt-6 flex justify-center gap-1.5">
            {creatorsSnaps.map((_, index) => (
              <button
                key={index}
                type="button"
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === creatorsIndex
                    ? "w-5 bg-primary"
                    : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                onClick={() => creatorsApi?.scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* =========================
          FEATURED BRANDS
      ========================= */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Featured brands
            </h2>
            <p className="mt-2 text-muted-foreground">
              Vetted brands hiring creators today.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/browse?role=brand"
              className="hidden text-sm font-medium text-primary hover:underline sm:block"
            >
              View all →
            </Link>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-border bg-card hover:bg-accent"
                onClick={() => brandsApi?.scrollPrev()}
                aria-label="Previous slide"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-border bg-card hover:bg-accent"
                onClick={() => brandsApi?.scrollNext()}
                aria-label="Next slide"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div
          onMouseEnter={() => setBrandsHovered(true)}
          onMouseLeave={() => setBrandsHovered(false)}
        >
          <Carousel
            setApi={setBrandsApi}
            opts={{ loop: true, align: "start" }}
            className="w-full"
          >
            <CarouselContent className="-ml-3 sm:-ml-6">
              {featuredBrands.map((brand) => (
                <CarouselItem
                  key={brand.id}
                  className="basis-full pl-3 sm:basis-1/2 sm:pl-6 lg:basis-1/3"
                >
                  <FeaturedProfileCard
                    inf={brand}
                    user={user}
                    handleCardClick={handleProfileCardClick}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* Brand Dots */}
        {brandsSnaps.length > 1 && (
          <div className="mt-6 flex justify-center gap-1.5">
            {brandsSnaps.map((_, index) => (
              <button
                key={index}
                type="button"
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === brandsIndex
                    ? "w-5 bg-primary"
                    : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                onClick={() => brandsApi?.scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* =========================
          PRAVIXO FLOW
      ========================= */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            How Pravixo Works
          </h2>
          <p className="mt-2 text-muted-foreground">
            Secure. Transparent. Trusted.
          </p>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-elevated">
          <img
            src={pravixoFlow}
            alt="Pravixo Flow"
            className="w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
          />
        </div>
      </section>

      {/* =========================
          CTA
      ========================= */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] gradient-sunset p-10 text-center text-white shadow-glow sm:p-16">
          <div
            className="absolute inset-0 opacity-30 mix-blend-overlay"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, white, transparent 40%), radial-gradient(circle at 80% 60%, white, transparent 40%)",
            }}
          />

          <div className="relative">
            <h2 className="font-display text-3xl font-bold sm:text-5xl">
              Ready to launch your next campaign?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/80">
              Join thousands of brands and creators using Pravixo to grow together.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {!user ? (
                <Link to="/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20"
                  >
                    Start free
                  </Button>
                </Link>
              ) : (
                <Link
                  to={
                    profile?.role === "creator"
                      ? "/dashboard/influencer"
                      : "/dashboard/customer"
                  }
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20"
                  >
                    Go to Dashboard
                  </Button>
                </Link>
              )}

              <Link to="/browse">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20"
                >
                  Explore creators
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          STATS
      ========================= */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { icon: Users, label: "Active creators", value: "52K+" },
            { icon: TrendingUp, label: "Campaigns run", value: "184K" },
            { icon: Zap, label: "Avg. launch time", value: "3.2 days" },
            { icon: CheckCircle2, label: "Success rate", value: "96%" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="font-display text-3xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================
          AUTH REQUIRED MODAL
      ========================= */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowAuthModal(false)}
          />

          <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-elevated animate-in fade-in zoom-in duration-200">
            <h3 className="font-display text-lg font-bold text-foreground">
              Sign In Required
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Please sign in or create an account to view full profile details and pricing tiers.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAuthModal(false)}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowAuthModal(false);
                  navigate("/login", {
                    state: { from: pendingRedirectUrl },
                  });
                }}
                className="rounded-full gradient-sunset border-0 text-white shadow-glow"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}