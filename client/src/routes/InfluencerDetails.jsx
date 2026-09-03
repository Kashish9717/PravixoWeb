import { useEffect, useMemo, useState } from "react";
import {
  useParams,
  useNavigate,
} from "react-router-dom";


import {
  MapPin,
  Star,
  Heart,
  Share2,
  MessageCircle,
  Check,
  UserPlus,
  Users,
  Globe,
  ShieldCheck,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/TextArea";

import {
  formatFollowers,
  influencers,
  mockBrands,
} from "../data/influencer";

import { formatINR } from "@/lib/format";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import api from "@/lib/api";

// =====================================================
// CUSTOM QUORA ICON
// =====================================================

const QuoraIcon = ({ className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M16.592 16.483c.783-.984 1.258-2.228 1.258-3.585 0-3.155-2.558-5.713-5.713-5.713S6.423 9.743 6.423 12.898s2.558 5.713 5.713 5.713c1.088 0 2.106-.305 2.975-.833l3.208 3.208c.28.28.73.28 1.01 0a.715.715 0 000-1.01l-2.737-2.493zm-4.455.518c-2.099 0-3.8-1.701-3.8-3.8 0-2.099 1.701-3.8 3.8-3.8s3.8 1.701 3.8 3.8c0 2.099-1.701 3.8-3.8 3.8z" />
  </svg>
);

// =====================================================
// SOCIAL ICON
// We don't use lucide brand icons.
// =====================================================

const SocialIcon = ({ platform, className = "" }) => {
  const icons = {
    Instagram: "◎",
    Facebook: "f",
    LinkedIn: "in",
    YouTube: "▶",
    Quora: "Q",
    "X (Twitter)": "𝕏",
  };

  return (
    <span
      className={`font-bold flex items-center justify-center ${className}`}
    >
      {icons[platform] || "•"}
    </span>
  );
};

// =====================================================
// FALLBACK COVER
// =====================================================

const fallbackCover =
  "https://api.dicebear.com/7.x/shapes/svg";

// =====================================================
// API HELPERS
// =====================================================

const fetchProfileById = async (id) => {
  const res = await api.get(`/profiles/${id}`);
  return res.data?.data || res.data;
};

const fetchPortfolio = async (profileId) => {
  const res = await api.get(`/portfolio/profile/${profileId}`);
  return res.data?.data || res.data;
};


// =====================================================
// LOADER
// =====================================================

export const loader = async ({ params }) => {
  const profileId = params.id;

  let inf =
    influencers.find(
      (item) => String(item.id) === String(profileId)
    ) ||
    mockBrands.find(
      (item) => String(item.id) === String(profileId)
    );

  // ===================================================
  // FETCH FROM NODE BACKEND
  // ===================================================

  if (!inf && profileId) {
    try {
      const profileResponse =
        await fetchProfileById(profileId);

      const profile =
        profileResponse?.data ||
        profileResponse?.profile ||
        profileResponse;

      if (profile) {
        let portfolioImages = [];

        try {
          const portfolioResponse =
            await fetchPortfolio(
              profile._id || profile.id
            );

          const portfolioData =
            portfolioResponse?.data || [];

          portfolioImages = portfolioData
            .map(
              (image) =>
                image.url ||
                image.imageUrl
            )
            .filter(Boolean);
        } catch (portfolioError) {
          console.error(
            "Portfolio fetch failed:",
            portfolioError
          );
        }

        const fullName =
          profile.fullName ||
          profile.name ||
          "Creator";

        inf = {
          id: profile._id || profile.id,

          name: fullName,

          handle:
            profile.handle ||
            `@${fullName
              .toLowerCase()
              .replace(/\s/g, "")}`,

          category:
            profile.category || "General",

          followers:
            Number(
              profile.instagramFollowers || 0
            ) +
            Number(
              profile.facebookFollowers || 0
            ) +
            Number(
              profile.linkedinFollowers || 0
            ) +
            Number(
              profile.youtubeFollowers || 0
            ) +
            Number(
              profile.quoraFollowers || 0
            ) +
            Number(
              profile.twitterFollowers || 0
            ),

          startingPrice:
            Number(profile.startingPrice || 0),

          location:
            profile.location || "India",

          rating:
            profile.rating ?? 5,

          reviews:
            profile.reviewsCount ?? 0,

          available: true,

          avatar:
            (profile.avatarUrl && profile.avatarUrl !== "undefined" && profile.avatarUrl !== "null")
              ? (profile.avatarUrl.startsWith("/") ? `${import.meta.env.VITE_API_URL || "http://localhost:5000"}${profile.avatarUrl}` : profile.avatarUrl)
              : `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(
                  profile.fullName || "User"
                )}`,

          cover:
            (profile.coverUrl && profile.coverUrl !== "undefined" && profile.coverUrl !== "null")
              ? (profile.coverUrl.startsWith("/") ? `${import.meta.env.VITE_API_URL || "http://localhost:5000"}${profile.coverUrl}` : profile.coverUrl)
              : fallbackCover,

          bio:
            profile.bio ||
            (profile.role === "brand"
              ? "Brand details on Pravixo."
              : "Creator on Pravixo."),

          portfolioImages,

          instagramHandle:
            profile.instagramHandle,

          instagramFollowers:
            Number(
              profile.instagramFollowers || 0
            ),

          facebookHandle:
            profile.facebookHandle,

          facebookFollowers:
            Number(
              profile.facebookFollowers || 0
            ),

          linkedinHandle:
            profile.linkedinHandle,

          linkedinFollowers:
            Number(
              profile.linkedinFollowers || 0
            ),

          youtubeHandle:
            profile.youtubeHandle,

          youtubeFollowers:
            Number(
              profile.youtubeFollowers || 0
            ),

          quoraHandle:
            profile.quoraHandle,

          quoraFollowers:
            Number(
              profile.quoraFollowers || 0
            ),

          twitterHandle:
            profile.twitterHandle,

          twitterFollowers:
            Number(
              profile.twitterFollowers || 0
            ),

          pricingTiers:
            profile.pricingTiers || [],

          role:
            profile.role || "creator",

          verificationStatus:
            profile.verificationStatus,

          website:
            profile.website,

          companySize:
            profile.companySize,

          prefNiches:
            profile.prefNiches,

          prefBudget:
            profile.prefBudget,

          prefReach:
            profile.prefReach,

          prefRegions:
            profile.prefRegions,

          campaigns:
            profile.campaigns || [],

          campaignsCount:
            profile.campaignsCount || 0,

          hiredCount:
            profile.hiredCount || 0,
        };
      }
    } catch (error) {
      console.error(
        "Node profile fetch failed:",
        error
      );
    }
  }

  if (!inf) {
    throw new Response(
      "Creator not found",
      {
        status: 404,
        statusText: "Creator not found",
      }
    );
  }

  return { inf };
};

// =====================================================
// DEFAULT TIERS
// =====================================================

const tiers = [
  {
    name: "Story",
    price: 1,
    perks: [
      "1 story slide",
      "24h live",
      "Link in story",
      "Quick turnaround",
    ],
  },
  {
    name: "Post",
    price: 2.5,
    perks: [
      "1 in-feed post",
      "2 revisions",
      "Caption draft",
      "Performance recap",
    ],
    popular: true,
  },
  {
    name: "Reel",
    price: 4,
    perks: [
      "30–60s reel",
      "Concept call",
      "3 revisions",
      "Cross-post to TikTok",
    ],
  },
];

// =====================================================
// BRAND DETAILS
// =====================================================

const getBrandProfileDetails = (
  brandId,
  brandName
) => {
  const nameLower =
    String(brandName || "").toLowerCase();

  const isNike =
    nameLower.includes("nike");

  const isZomato =
    nameLower.includes("zomato");

  const isTata =
    nameLower.includes("tata") ||
    nameLower.includes("hawa");

  let companySize =
    "50 - 200 employees";

  let website =
    "https://www.hawai.restaurant";

  let campaignsCount = 14;
  let hiredCount = 52;
  let activeCampaignsCount = 2;
  let successRate = "95%";

  if (isNike) {
    companySize = "10,000+ employees";
    website = "https://www.nike.com/in";
    campaignsCount = 24;
    hiredCount = 180;
    activeCampaignsCount = 3;
    successRate = "98%";
  }

  if (isZomato) {
    companySize = "5,000 - 10,000 employees";
    website = "https://www.zomato.com";
    campaignsCount = 36;
    hiredCount = 320;
    activeCampaignsCount = 5;
    successRate = "96%";
  }

  if (isTata) {
    companySize = "50,000+ employees";
    website = "https://www.tatamotors.com";
    campaignsCount = 15;
    hiredCount = 95;
    activeCampaignsCount = 2;
    successRate = "99%";
  }

  const defaultGallery = [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
    "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=400&q=80",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80",
  ];

  let gallery = defaultGallery;

  if (isNike) {
    gallery = [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
      "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=400&q=80",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80",
      "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&q=80",
    ];
  }

  if (isZomato) {
    gallery = [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80",
      "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&q=80",
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
    ];
  }

  if (isTata) {
    gallery = [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&q=80",
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80",
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=80",
    ];
  }

  let campaigns = [
    {
      id: "camp_hawai_1",
      title:
        "Dine-in Experience Video Campaign",
      budget: "₹20,000 - ₹40,000",
      category: "Food & Vlogging",
      duration: "2 weeks",
      applications: 18,
    },
    {
      id: "camp_hawai_2",
      title:
        "Family Weekend Feast Reels",
      budget: "₹30,000 - ₹50,000",
      category: "Food & Family",
      duration: "3 weeks",
      applications: 27,
    },
  ];

  if (isNike) {
    campaigns = [
      {
        id: "nike_c1",
        title:
          "Air Max Day 2026 Campaign",
        budget:
          "₹1,50,000 - ₹3,00,000",
        category:
          "Fashion & Sports",
        duration: "3 weeks",
        applications: 68,
      },
      {
        id: "nike_c2",
        title:
          "Just Do It: Running Series",
        budget:
          "₹80,000 - ₹1,50,000",
        category:
          "Fitness & Athletics",
        duration: "1 month",
        applications: 112,
      },
    ];
  }

  if (isZomato) {
    campaigns = [
      {
        id: "zomato_c1",
        title:
          "Late Night Cravings Reels",
        budget:
          "₹30,000 - ₹60,000",
        category:
          "Food & Entertainment",
        duration: "2 weeks",
        applications: 145,
      },
      {
        id: "zomato_c2",
        title:
          "Healthy Options Launch Campaign",
        budget:
          "₹60,000 - ₹1,20,000",
        category:
          "Food & Health",
        duration: "3 weeks",
        applications: 89,
      },
    ];
  }

  if (isTata) {
    campaigns = [
      {
        id: "tata_c1",
        title:
          "Tata Punch EV Roadtrip Vlog",
        budget:
          "₹2,50,000 - ₹5,00,000",
        category:
          "Automobile & Travel",
        duration: "1 month",
        applications: 56,
      },
      {
        id: "tata_c2",
        title:
          "Urban EV Commuter Campaign",
        budget:
          "₹1,00,000 - ₹2,00,000",
        category:
          "Automobile & Tech",
        duration: "2 weeks",
        applications: 37,
      },
    ];
  }

  let preferences = {
    niches:
      "Food, Dining, Family Vlogs, Lifestyle",
    reach: "10K+ followers",
    region: "Delhi & NCR",
    budgetRange:
      "₹10K - ₹40K per post",
  };

  if (isNike) {
    preferences = {
      niches:
        "Sports, Fitness, Running, Lifestyle",
      reach: "50K+ followers",
      region: "India (Metros)",
      budgetRange:
        "₹25K - ₹100K per post",
    };
  }

  if (isZomato) {
    preferences = {
      niches:
        "Food, Cooking, Vlogging, Comedy, Lifestyle",
      reach: "20K+ followers",
      region:
        "India (All major cities)",
      budgetRange:
        "₹15K - ₹50K per reel",
    };
  }

  if (isTata) {
    preferences = {
      niches:
        "Automobile, Tech, Travel, Family, Sustainability",
      reach: "100K+ followers",
      region: "India",
      budgetRange:
        "₹50K - ₹200K per deliverable",
    };
  }

  return {
    companySize,
    website,
    campaignsCount,
    hiredCount,
    activeCampaignsCount,
    successRate,
    gallery,
    campaigns,
    preferences,
  };
};

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function InfluencerDetails() {
  const { id: profileId } = useParams();
  const navigate = useNavigate();

  const {
    profile: myProfile,
    user,
    loading: authLoading,
  } = useAuth();

  const fallbackCover =
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop";
  const fallbackAvatar =
    "https://ui-avatars.com/api/?background=random&name=creator";

  const resolveImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    let apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    if (apiUrl.endsWith("/api")) apiUrl = apiUrl.slice(0, -4);
    return `${apiUrl}${url}`;
  };

  const [inf, setInf] = useState(() => {
    return (
      influencers.find((item) => String(item.id) === String(profileId)) ||
      mockBrands.find((item) => String(item.id) === String(profileId)) ||
      null
    );
  });

  const [portfolioImages, setPortfolioImages] = useState(
    () => inf?.portfolioImages || []
  );
  
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      if (!profileId) return;
      try {
        const profile = await fetchProfileById(profileId);
        if (profile && isMounted) {
          let portfolio = [];
          try {
            const portRes = await fetchPortfolio(profile._id || profileId);
            portfolio = (Array.isArray(portRes) ? portRes : portRes?.data || [])
              .map((img) => img.imageUrl || img.url)
              .filter(Boolean);
          } catch (e) {
            console.error("Portfolio fetch failed:", e);
          }

          const fullName = profile.fullName || "User";
          const formatted = {
            id: profile._id,
            name: fullName,
            handle: profile.handle || `@${fullName.toLowerCase().replace(/\s/g, "")}`,
            bio: profile.bio || "",
            role: profile.role,
            category: profile.category || "General",
            followers:
              Number(profile.instagramFollowers || 0) +
              Number(profile.facebookFollowers || 0) +
              Number(profile.linkedinFollowers || 0) +
              Number(profile.youtubeFollowers || 0) +
              Number(profile.quoraFollowers || 0) +
              Number(profile.twitterFollowers || 0),
            startingPrice: Number(profile.startingPrice || 0),
            location: profile.location || "India",
            rating: profile.rating ?? 5,
            reviews: profile.reviewsCount ?? 0,
            available: true,
            avatar: resolveImageUrl(profile.avatarUrl) || profile.avatar || fallbackAvatar,
            cover: resolveImageUrl(profile.coverUrl) || profile.cover || fallbackCover,
            portfolioImages: portfolio,
            instagramHandle: profile.instagramHandle,
            instagramFollowers: Number(profile.instagramFollowers || 0),
            facebookHandle: profile.facebookHandle,
            facebookFollowers: Number(profile.facebookFollowers || 0),
            linkedinHandle: profile.linkedinHandle,
            linkedinFollowers: Number(profile.linkedinFollowers || 0),
            youtubeHandle: profile.youtubeHandle,
            youtubeFollowers: Number(profile.youtubeFollowers || 0),
            quoraHandle: profile.quoraHandle,
            quoraFollowers: Number(profile.quoraFollowers || 0),
            twitterHandle: profile.twitterHandle,
            twitterFollowers: Number(profile.twitterFollowers || 0),
            prefNiches: profile.prefNiches,
            prefBudget: profile.prefBudget,
            prefReach: profile.prefReach,
            prefRegions: profile.prefRegions,
            campaigns: profile.campaigns || [],
            campaignsCount: profile.campaignsCount || 0,
            hiredCount: profile.hiredCount || 0,
          };

          setInf(formatted);
          if (portfolio.length > 0) {
            setPortfolioImages(portfolio);
          }
        }
      } catch (err) {
        console.error("Failed to load live profile:", err);
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [profileId]);

  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const checkFav = async () => {
      if (myProfile && (inf?.id || profileId)) {
        try {
          const res = await api.get("/favorites/check", {
            params: {
              brandId: myProfile._id,
              creatorId: inf?.id || profileId
            }
          });
          setIsFavorite(res.data?.data?.isFavorite || false);
        } catch (err) {
          console.error("Failed to check favorite status", err);
        }
      }
    };
    checkFav();
  }, [myProfile, inf?.id, profileId]);


  const [
    isConnectionModalOpen,
    setIsConnectionModalOpen,
  ] = useState(false);

  const [
    selectedCampaign,
    setSelectedCampaign,
  ] = useState(null);

  const [pitchText, setPitchText] =
    useState("");

  const [
    sendingRequest,
    setSendingRequest,
  ] = useState(false);

  const [
    isReviewModalOpen,
    setIsReviewModalOpen,
  ] = useState(false);

  const [
    submitRating,
    setSubmitRating,
  ] = useState(0);

  const [
    reviewTitle,
    setReviewTitle,
  ] = useState("");

  const [
    reviewText,
    setReviewText,
  ] = useState("");

  const [
    campaignRef,
    setCampaignRef,
  ] = useState("");

  const [
    submittingReview,
    setSubmittingReview,
  ] = useState(false);

  const [sortBy, setSortBy] =
    useState("latest");

  const [
    reviewsList,
    setReviewsList,
  ] = useState([]);

  const [
    loadingReviews,
    setLoadingReviews,
  ] = useState(false);

  // ===================================================
  // LOGIN
  // ===================================================

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", {
        state: {
          from: `/influencer/${inf?.id || profileId}`,
        },
      });
    }
  }, [
    user,
    authLoading,
    navigate,
    inf?.id,
    profileId,
  ]);

  // ===================================================
  // LOAD PORTFOLIO
  // ===================================================

  useEffect(() => {
    const loadPortfolio = async () => {
      if (!inf?.id) return;

      try {
        const response =
          await fetchPortfolio(inf.id);

        const data =
          response?.data || [];

        const images = data
          .map(
            (item) =>
              item.url ||
              item.imageUrl
          )
          .filter(Boolean);

        if (images.length > 0) {
          setPortfolioImages(images);
        }
      } catch (error) {
        console.error(
          "Failed to load portfolio:",
          error
        );
      }
    };

    loadPortfolio();
  }, [inf?.id]);

  // ===================================================
  // BRAND
  // ===================================================

  const isBrand = inf?.role === "brand";

  const brandDetails = useMemo(() => {
    if (!isBrand) return null;

    const isMock =
      String(inf.id).startsWith(
        "brand_mock_"
      ) ||
      !isNaN(Number(inf.id));

    if (isMock) {
      return getBrandProfileDetails(
        inf.id,
        inf.name
      );
    }

    const activeCamps =
      (inf.campaigns || []).filter(
        (campaign) =>
          campaign.active === true
      );

    const fallback =
      getBrandProfileDetails(
        inf.id,
        inf.name
      );

    const dbGallery =
      portfolioImages.length > 0
        ? portfolioImages
        : fallback.gallery;

    return {
      companySize:
        inf.companySize ||
        "50 - 200 employees",

      website:
        inf.website ||
        "https://pravixo.co",

      campaignsCount:
        inf.campaignsCount ?? 0,

      hiredCount:
        inf.hiredCount ?? 0,

      activeCampaignsCount:
        activeCamps.length,

      successRate: "98%",

      gallery: dbGallery,

      campaigns:
        activeCamps.map(
          (campaign) => ({
            id:
              campaign._id ||
              campaign.id,

            title:
              campaign.title,

            budget:
              campaign.budget,

            category:
              campaign.category,

            duration:
              campaign.duration,

            applications: 0,
          })
        ),

      preferences: {
        niches:
          inf.prefNiches ||
          "General",

        reach:
          inf.prefReach ||
          "Any",

        region:
          inf.prefRegions ||
          "Any",

        budgetRange:
          inf.prefBudget ||
          "Any",
      },
    };
  }, [
    isBrand,
    inf,
    portfolioImages,
  ]);

  // ===================================================
  // REVIEWS
  // ===================================================

  useEffect(() => {
    const loadReviews = async () => {
      if (isBrand || !inf?.id) {
        return;
      }

      setLoadingReviews(true);

      try {
        const response =
          await api(
            `/api/reviews/creator/${inf.id}`,
            {
              method: "GET",
            }
          );

        const resData = response?.data;
        const reviews = Array.isArray(resData) 
          ? resData 
          : (Array.isArray(resData?.data) ? resData.data : []);
        setReviewsList(reviews);
      } catch (error) {
        console.error(
          "Failed to load reviews:",
          error
        );

        setReviewsList([]);
      } finally {
        setLoadingReviews(false);
      }
    };

    loadReviews();
  }, [
    inf?.id,
    isBrand,
  ]);

  // ===================================================
  // SORT REVIEWS
  // ===================================================

  const sortedReviews = useMemo(() => {
    const list = Array.isArray(reviewsList) ? reviewsList : [];
    return [...list].sort(
      (a, b) => {
        if (sortBy === "latest") {
          return (
            new Date(
              b.createdAt
            ).getTime() -
            new Date(
              a.createdAt
            ).getTime()
          );
        }

        if (sortBy === "highest") {
          return (
            Number(b.rating || 0) -
            Number(a.rating || 0)
          );
        }

        if (sortBy === "lowest") {
          return (
            Number(a.rating || 0) -
            Number(b.rating || 0)
          );
        }

        return 0;
      }
    );
  }, [
    reviewsList,
    sortBy,
  ]);

  // ===================================================
  // RATING
  // ===================================================

  const rating = inf?.rating ?? 5;
  const reviewsCount = inf?.reviews ?? reviewsList.length;

  // ===================================================
  // FAVORITE
  // ===================================================

  const handleToggleFavorite = async () => {
    if (!myProfile) {
      toast.error("Please log in to save creators");
      return;
    }

    if (myProfile.role !== "brand") {
      toast.error("Only brands can save creators");
      return;
    }

    try {
      if (isFavorite) {
        await api.delete("/favorites", {
          data: {
            brandId: myProfile._id,
            creatorId: inf?.id || profileId,
          },
        });
        setIsFavorite(false);
        toast.success("Removed from favorites");
      } else {
        await api.post("/favorites", {
          brandId: myProfile._id,
          creatorId: inf?.id || profileId,
        });
        setIsFavorite(true);
        toast.success("Saved to favorites");
      }
    } catch (error) {
      console.error("Favorite toggle error:", error);
      toast.error("Failed to update favorites");
    }
  };


  // ===================================================
  // HIRE
  // ===================================================

  const handleHire = async () => {
    if (!myProfile) {
      toast.error("Please log in to hire creators");
      return;
    }

    if (myProfile.role !== "brand") {
      toast.error("Only brands can hire creators");
      return;
    }

    setIsConnectionModalOpen(true);
  };

  // ===================================================
  // CONNECTION
  // ===================================================

  const handleSendConnection =
    async (event) => {
      event.preventDefault();

      if (!myProfile) return;

      if (!pitchText.trim()) {
        toast.error(
          "Please enter a personalized pitch"
        );
        return;
      }

      setSendingRequest(true);

      try {
        await api.post(
          "/connections/request",
          {
            creatorId:
              myProfile.role === "creator" ? (myProfile._id || myProfile.id) : inf.id,

            brandId:
              myProfile.role === "brand" ? (myProfile._id || myProfile.id) : inf.id,

            senderId:
              myProfile._id || myProfile.id,

            campaignId:
              selectedCampaign?.id,

            pitch:
              pitchText,
          }
        );

        toast.success(
          "Connection request sent! Redirecting to messages..."
        );

        setIsConnectionModalOpen(
          false
        );

        setPitchText("");
        setSelectedCampaign(null);
        
        navigate("/messages");
      } catch (error) {
        console.error(error);

        toast.error(
          error?.message ||
          "Failed to send request"
        );
      } finally {
        setSendingRequest(false);
      }
    };

  // ===================================================
  // REVIEW
  // ===================================================

  const handleSubmitReview =
    async (event) => {
      event.preventDefault();

      if (!myProfile) return;

      if (submitRating === 0) {
        toast.error(
          "Please select a star rating"
        );
        return;
      }

      setSubmittingReview(true);

      try {
        await api.post(
          "/reviews",
          {
            creatorId: inf.id,

            brandId:
              myProfile._id ||
              myProfile.id,

            rating:
              submitRating,

            title:
              reviewTitle,

            text:
              reviewText,

            campaignRef:
              campaignRef ||
              undefined,
          }
        );

        toast.success(
          "Review submitted successfully!"
        );

        setIsReviewModalOpen(
          false
        );

        setSubmitRating(0);
        setReviewTitle("");
        setReviewText("");
        setCampaignRef("");
      } catch (error) {
        console.error(error);

        toast.error(
          error?.message ||
          "Failed to submit review"
        );
      } finally {
        setSubmittingReview(false);
      }
    };

  // ===================================================
  // TITLE
  // ===================================================

  useEffect(() => {
    if (inf) {
      document.title =
        `${inf.name} — Pravixo`;
    }
  }, [inf]);

  // ===================================================
  // PROFILE LOADING GUARD
  // ===================================================

  // The profile is loaded asynchronously. Until it arrives, `inf` can be null.
  // Stop rendering before any direct `inf.*` access happens.
  if (!inf) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading profile...
        </p>
      </div>
    );
  }

  // ===================================================
  // PRICING
  // ===================================================

  const activeTiers =
    inf.pricingTiers &&
      inf.pricingTiers.length > 0
      ? [...inf.pricingTiers].sort(
        (a, b) =>
          (a.sortOrder || 0) -
          (b.sortOrder || 0)
      )
      : null;

  const displayTiers =
    activeTiers
      ? activeTiers.map(
        (tier) => {
          const name =
            String(
              tier.name || ""
            ).toLowerCase();

          let perks = [];
          let popular = false;

          if (name === "story") {
            perks = [
              "1 story slide",
              "24h live",
              "Link in story",
              "Quick turnaround",
            ];
          } else if (
            name === "post"
          ) {
            perks = [
              "1 in-feed post",
              "2 revisions",
              "Caption draft",
              "Performance recap",
            ];

            popular = true;
          } else if (
            name === "reel"
          ) {
            perks = [
              "30–60s reel",
              "Concept call",
              "3 revisions",
              "Cross-post to TikTok",
            ];
          } else {
            perks = [
              `1 ${tier.name} deliverable`,
              "Professional content",
              "1 revision included",
              "Fast delivery",
            ];
          }

          return {
            name: tier.name,
            price: tier.price,
            perks,
            popular,
          };
        }
      )
      : tiers.map(
        (tier) => ({
          name: tier.name,

          price:
            Math.round(
              (inf.startingPrice || 0) *
              tier.price
            ),

          perks: tier.perks,

          popular:
            tier.popular,
        })
      );

  // ===================================================
  // PORTFOLIO
  // ===================================================

  const portfolio =
    portfolioImages.length
      ? portfolioImages
      : [
        inf.cover,
        ...influencers
          .slice(0, 5)
          .map(
            (item) =>
              item.cover
          ),
      ].filter(Boolean);

  // ===================================================
  // SOCIAL PLATFORMS
  // ===================================================

  const socialCards = [
    {
      label: "Instagram",

      handle:
        inf.instagramHandle,

      followers:
        inf.instagramFollowers,

      href:
        inf.instagramHandle
          ? `https://instagram.com/${inf.instagramHandle.replace(
            "@",
            ""
          )}`
          : "",

      iconClass:
        "text-pink-600",

      hoverClass:
        "hover:border-pink-200 hover:bg-pink-50/30",
    },

    {
      label: "Facebook",

      handle:
        inf.facebookHandle,

      followers:
        inf.facebookFollowers,

      href:
        inf.facebookHandle
          ? `https://facebook.com/${inf.facebookHandle.replace(
            "@",
            ""
          )}`
          : "",

      iconClass:
        "text-blue-600",

      hoverClass:
        "hover:border-blue-200 hover:bg-blue-50/30",
    },

    {
      label: "LinkedIn",

      handle:
        inf.linkedinHandle,

      followers:
        inf.linkedinFollowers,

      href:
        inf.linkedinHandle
          ? `https://linkedin.com/in/${inf.linkedinHandle.replace(
            "in/",
            ""
          ).replace("@", "")}`
          : "",

      iconClass:
        "text-blue-800",

      hoverClass:
        "hover:border-blue-300 hover:bg-blue-50/30",
    },

    {
      label: "YouTube",

      handle:
        inf.youtubeHandle,

      followers:
        inf.youtubeFollowers,

      href:
        inf.youtubeHandle
          ? `https://youtube.com/@${inf.youtubeHandle.replace(
            "@",
            ""
          )}`
          : "",

      iconClass:
        "text-red-600",

      hoverClass:
        "hover:border-red-200 hover:bg-red-50/30",
    },

    {
      label: "Quora",

      handle:
        inf.quoraHandle,

      followers:
        inf.quoraFollowers,

      href:
        inf.quoraHandle
          ? `https://quora.com/profile/${inf.quoraHandle.replace(
            "@",
            ""
          )}`
          : "",

      iconClass:
        "text-red-700",

      hoverClass:
        "hover:border-red-200 hover:bg-red-50/30",
    },

    {
      label: "X (Twitter)",

      handle:
        inf.twitterHandle,

      followers:
        inf.twitterFollowers,

      href:
        inf.twitterHandle
          ? `https://x.com/${inf.twitterHandle.replace(
            "@",
            ""
          )}`
          : "",

      iconClass:
        "text-sky-500",

      hoverClass:
        "hover:border-sky-200 hover:bg-sky-50/30",
    },
  ].filter(
    (item) => item.handle
  );

  // ===================================================
  // STATS
  // ===================================================

  const numConnected =
    socialCards.length;

  const avgFollowersValue =
    numConnected > 0
      ? Math.round(
        (inf.followers || 0) /
        numConnected
      )
      : 0;

  const totalReach =
    socialCards.reduce(
      (total, platform) =>
        total +
        (platform.followers || 0) *
        0.35,
      0
    );

  const avgReachValue =
    numConnected > 0
      ? Math.round(
        totalReach /
        numConnected
      )
      : 0;

  const totalViews =
    socialCards.reduce(
      (total, platform) =>
        total +
        (platform.followers || 0) *
        0.12,
      0
    );

  const avgViewsValue =
    numConnected > 0
      ? Math.round(
        totalViews /
        numConnected
      )
      : 0;

  const statCards =
    isBrand && brandDetails
      ? [
        {
          label:
            "Campaigns Posted",
          value: String(
            brandDetails.campaignsCount
          ),
        },
        {
          label:
            "Creators Hired",
          value: String(
            brandDetails.hiredCount
          ),
        },
        {
          label:
            "Active Campaigns",
          value: String(
            brandDetails.activeCampaignsCount
          ),
        },
        {
          label:
            "Success Rate",
          value:
            brandDetails.successRate,
        },
      ]
      : [
        {
          label:
            "Average Followers",
          value:
            formatFollowers(
              avgFollowersValue
            ),
        },
        {
          label:
            "Average Reach",
          value:
            formatFollowers(
              avgReachValue
            ),
        },
        {
          label:
            "Average Views",
          value:
            formatFollowers(
              avgViewsValue
            ),
        },
        {
          label:
            "Total Posts",
          value: String(
            portfolioImages.length
          ),
        },
      ];

  // ===================================================
  // AUTH LOADING
  // ===================================================

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading details...
        </p>
      </div>
    );
  }

  // ===================================================
  // UI
  // ===================================================

  return (
    <div>

      {/* COVER */}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative aspect-[1361/450] overflow-hidden w-full rounded-b-2xl sm:rounded-b-3xl rounded-t-none shadow-sm border border-border/50">
          <img
            src={inf.cover}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* PROFILE HEADER */}

        <div className="relative pb-8 border-b border-border/60 z-20">

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">

            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">

              <div className="-mt-14 sm:-mt-20 relative z-30 flex-shrink-0">
                <img src={inf.avatar}
                  alt={inf.name}
                  className="h-28 w-28 sm:h-36 sm:w-36 rounded-full border-4 border-background object-cover shadow-elevated bg-background"
                 onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?background=random&name=Fallback"; }} />
              </div>

              <div className="pb-2 space-y-2">

                <div className="flex items-center justify-center sm:justify-start gap-2.5">

                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    {inf.name}
                  </h1>

                  {inf.verificationStatus ===
                    "verified" && (
                      <span className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full gradient-sunset shadow-md">
                        <Check className="h-3.5 w-3.5 text-white" />
                      </span>
                    )}

                </div>

                <p className="text-sm font-semibold text-muted-foreground tracking-wide">
                  {inf.handle}
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2.5 gap-y-1.5 text-sm text-muted-foreground">

                  <Badge
                    variant="secondary"
                    className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  >
                    {inf.category}
                  </Badge>

                  <span className="text-border hidden sm:inline">
                    •
                  </span>

                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {inf.location}
                  </span>

                  <span className="text-border">
                    •
                  </span>

                  <span className="flex items-center gap-1.5 font-bold text-amber-500">
                    <Star className="h-4 w-4 fill-current" />

                    {rating}

                    <span className="text-muted-foreground font-medium text-xs">
                      ({reviewsCount} reviews)
                    </span>
                  </span>

                </div>

              </div>

            </div>

            {/* ACTIONS */}

            <div className="flex flex-wrap justify-center sm:justify-end gap-2.5 self-center sm:self-end">

              {myProfile?.role ===
                "brand" && (
                  <Button
                    variant="outline"
                    size="icon"
                    className={`rounded-full h-9 w-9 ${isFavorite
                      ? "border-red-500 bg-red-50 text-red-500"
                      : ""
                      }`}
                    onClick={
                      handleToggleFavorite
                    }
                  >
                    <Heart
                      className={`h-4 w-4 ${isFavorite
                        ? "fill-current text-red-500"
                        : ""
                        }`}
                    />
                  </Button>
                )}

              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-9 w-9"
                onClick={() => {
                  navigator.clipboard?.writeText(
                    window.location.href
                  );

                  toast(
                    "Link copied"
                  );
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>

              {myProfile?.role ===
                "brand" && (
                  <Button
                    className="rounded-full gradient-sunset border-0 text-white shadow-glow px-5 h-9 flex items-center gap-1.5 text-xs font-semibold"
                    onClick={
                      handleHire
                    }
                  >
                    <MessageCircle className="h-4 w-4" />
                    Hire{" "}
                    {inf.name.split(
                      " "
                    )[0]}
                  </Button>
                )}

              {myProfile?.role ===
                "creator" &&
                inf.role ===
                "brand" && (
                  <>
                    <Button
                      className="rounded-full gradient-sunset border-0 text-white shadow-glow px-5 h-9 flex items-center gap-1.5 text-xs font-semibold"
                      onClick={() => {
                        setSelectedCampaign(
                          null
                        );

                        setIsConnectionModalOpen(
                          true
                        );
                      }}
                    >
                      <UserPlus className="h-4 w-4" />
                      Connect With Brand
                    </Button>

                    <Button
                      variant="outline"
                      className="rounded-full px-5 h-9 text-xs font-semibold"
                      onClick={() => {
                        document
                          .getElementById(
                            "open-campaigns"
                          )
                          ?.scrollIntoView({
                            behavior:
                              "smooth",
                          });
                      }}
                    >
                      Apply for Campaign
                    </Button>
                  </>
                )}

            </div>
          </div>
        </div>

        {/* MAIN */}

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">

          {/* LEFT */}

          <div className="space-y-10">

            {/* STATS */}

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">

              {statCards.map(
                (stat) => (
                  <div
                    key={stat.label}
                    className="flex h-28 flex-col items-center justify-center rounded-2xl border border-border bg-card p-4 text-center shadow-sm"
                  >
                    <div className="font-display text-xl font-bold">
                      {stat.value}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                )
              )}

            </div>

            {/* BRAND INFO / SOCIAL */}

            {isBrand &&
              brandDetails ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="flex h-24 items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Users className="h-6 w-6" />
                  </div>

                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">
                      Company Size
                    </div>

                    <div className="font-display text-base font-bold mt-0.5">
                      {brandDetails.companySize}
                    </div>
                  </div>

                </div>

                <div className="flex h-24 items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Globe className="h-6 w-6" />
                  </div>

                  <div>

                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">
                      Website
                    </div>

                    <a
                      href={
                        brandDetails.website
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="font-display text-sm font-bold text-primary hover:underline block truncate max-w-[200px]"
                    >
                      {brandDetails.website.replace(
                        /^https?:\/\//,
                        ""
                      )}
                    </a>

                  </div>

                </div>

              </div>
            ) : (
              socialCards.length > 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">

                  {socialCards.map(
                    (social) => (
                      <a
                        key={
                          social.label
                        }
                        href={
                          social.href
                        }
                        target="_blank"
                        rel="noreferrer"
                        className={`flex h-28 flex-col items-center justify-center rounded-2xl border border-border bg-card p-4 text-center shadow-sm transition-all group ${social.hoverClass}`}
                      >

                        <div className="flex items-center gap-1.5 justify-center mb-1">

                          <SocialIcon
                            platform={
                              social.label
                            }
                            className={`h-6 w-6 group-hover:scale-110 transition-transform ${social.iconClass}`}
                          />

                          {social.isVerified && (
                            <ShieldCheck className="h-4 w-4 text-primary" />
                          )}

                        </div>

                        <div className="font-display text-xl font-bold">
                          {formatFollowers(
                            social.followers ||
                            0
                          )}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {social.label}
                        </div>

                      </a>
                    )
                  )}

                </div>
              )
            )}

            {/* ABOUT + PORTFOLIO */}

            <div className="grid gap-8 lg:grid-cols-2">

              {/* ABOUT */}

              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">

                <h2 className="font-display text-xl font-semibold">
                  {isBrand
                    ? "About Brand"
                    : "About"}
                </h2>

                <div className="mt-3 max-h-48 overflow-y-auto">

                  <p className="text-muted-foreground">
                    {inf.bio ||
                      (isBrand
                        ? "Brand details on Pravixo."
                        : "Creator on Pravixo.")}
                  </p>

                </div>

              </div>

              {/* PORTFOLIO */}

              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">

                <h2 className="font-display text-xl font-semibold">
                  {isBrand
                    ? "Brand Gallery"
                    : "Portfolio"}
                </h2>

                <div className="mt-4 grid grid-cols-2 gap-3">

                  {portfolio.map(
                    (item, index) => (
                      <div
                        key={index}
                        className="group relative aspect-square overflow-hidden rounded-2xl cursor-pointer"
                        onClick={() => setLightboxImage(resolveImageUrl(item.url || item))}
                      >
                        <img
                          src={resolveImageUrl(item.url || item)}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                    )
                  )}

                </div>

              </div>

            </div>

            {/* OPEN CAMPAIGNS */}

            {isBrand &&
              brandDetails && (
                <div
                  id="open-campaigns"
                  className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6"
                >

                  <div>

                    <h2 className="font-display text-xl font-semibold">
                      Open Campaigns
                    </h2>

                    <p className="text-xs text-muted-foreground mt-0.5">
                      Explore active collaboration opportunities and send proposals directly.
                    </p>

                  </div>

                  <div className="space-y-4">

                    {brandDetails.campaigns.length ===
                      0 ? (
                      <div className="text-sm text-muted-foreground text-center py-6">
                        No active campaigns.
                      </div>
                    ) : (
                      brandDetails.campaigns.map(
                        (campaign) => (
                          <div
                            key={
                              campaign.id
                            }
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border p-4 bg-secondary/20"
                          >

                            <div className="space-y-1">

                              <h3 className="font-display text-sm font-bold">
                                {campaign.title}
                              </h3>

                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">

                                <span className="font-medium text-gradient-sunset">
                                  {campaign.budget}
                                </span>

                                <span>
                                  ·
                                </span>

                                <span>
                                  {campaign.category}
                                </span>

                                <span>
                                  ·
                                </span>

                                <span>
                                  {campaign.duration}
                                </span>

                              </div>

                            </div>

                            <Button
                              size="sm"
                              className="rounded-full gradient-sunset border-0 text-white px-4 text-xs font-semibold"
                              onClick={() => {
                                setSelectedCampaign(
                                  campaign
                                );

                                setIsConnectionModalOpen(
                                  true
                                );
                              }}
                            >
                              Request to Connect
                            </Button>

                          </div>
                        )
                      )
                    )}

                  </div>
                </div>
              )}

            {/* REVIEWS */}

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

                <div>

                  <h2 className="font-display text-xl font-semibold">
                    Reviews & Feedback
                  </h2>

                  <p className="text-xs text-muted-foreground mt-0.5">
                    What brands are saying about collaborating with{" "}
                    {inf.name}
                  </p>

                </div>

                <div className="flex items-center gap-2">

                  <span className="text-xs font-medium text-muted-foreground">
                    Sort by:
                  </span>

                  <select
                    value={sortBy}
                    onChange={(event) =>
                      setSortBy(
                        event.target.value
                      )
                    }
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs"
                  >
                    <option value="latest">
                      Latest
                    </option>

                    <option value="highest">
                      Highest Rated
                    </option>

                    <option value="lowest">
                      Lowest Rated
                    </option>
                  </select>

                </div>

              </div>

              {loadingReviews ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Loading reviews...
                </div>
              ) : sortedReviews.length ===
                0 ? (
                <div className="py-12 text-center border border-dashed border-border rounded-xl">

                  <Star className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />

                  <p className="font-semibold text-sm text-muted-foreground">
                    No reviews yet
                  </p>

                  <p className="text-xs text-muted-foreground mt-1">
                    Completed collaborations will appear here once reviewed.
                  </p>

                </div>
              ) : (
                <div className="space-y-4">

                  {sortedReviews.map(
                    (review) => (
                      <div
                        key={
                          review._id ||
                          review.id
                        }
                        className="border border-border rounded-xl p-4"
                      >

                        <div className="flex items-center gap-3">

                          <img src={
                              review.brandAvatar ||
                              `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(
                                review.brandName ||
                                "Brand"
                              )}`
                            }
                            alt=""
                            className="h-10 w-10 rounded-full object-cover border"
                           onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?background=random&name=Fallback"; }} />

                          <div>

                            <h4 className="font-display text-sm font-semibold">
                              {review.brandName ||
                                "Brand"}
                            </h4>

                            <div className="flex items-center gap-1.5 mt-0.5">

                              <div className="flex">

                                {[1, 2, 3, 4, 5].map(
                                  (star) => (
                                    <Star
                                      key={star}
                                      className={`h-3 w-3 ${star <=
                                        review.rating
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-muted-foreground/30"
                                        }`}
                                    />
                                  )
                                )}

                              </div>

                              <span className="text-[10px] text-muted-foreground">
                                {review.createdAt
                                  ? new Date(
                                    review.createdAt
                                  ).toLocaleDateString()
                                  : ""}
                              </span>

                            </div>

                          </div>

                        </div>

                        {review.campaignRef && (
                          <Badge
                            variant="secondary"
                            className="mt-3 text-[10px] rounded-full"
                          >
                            Campaign:{" "}
                            {
                              review.campaignRef
                            }
                          </Badge>
                        )}

                        <div className="mt-3">

                          <h5 className="text-sm font-semibold">
                            {review.title}
                          </h5>

                          <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap leading-relaxed">
                            {review.text}
                          </p>

                        </div>

                      </div>
                    )
                  )}

                </div>
              )}

            </div>

          </div>

          {/* SIDEBAR */}

          <aside className="space-y-4">

            {isBrand &&
              brandDetails ? (
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">

                <h3 className="font-display text-lg font-bold mb-4">
                  Hiring Preferences
                </h3>

                <div className="space-y-4">

                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">
                      Preferred Niches
                    </div>

                    <div className="text-sm font-semibold mt-0.5">
                      {
                        brandDetails
                          .preferences
                          .niches
                      }
                    </div>
                  </div>

                  <hr />

                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">
                      Target Creator Reach
                    </div>

                    <div className="text-sm font-semibold mt-0.5">
                      {
                        brandDetails
                          .preferences
                          .reach
                      }
                    </div>
                  </div>

                  <hr />

                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">
                      Preferred Region
                    </div>

                    <div className="text-sm font-semibold mt-0.5">
                      {
                        brandDetails
                          .preferences
                          .region
                      }
                    </div>
                  </div>

                  <hr />

                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">
                      Campaign Budget Range
                    </div>

                    <div className="text-sm font-semibold text-gradient-sunset mt-0.5">
                      {
                        brandDetails
                          .preferences
                          .budgetRange
                      }
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">

                <h3 className="font-display text-lg font-bold mb-4">
                  Pricing Packages
                </h3>

                <div className="space-y-4">

                  {displayTiers.map(
                    (tier) => (
                      <div
                        key={
                          tier.name
                        }
                        onClick={() => {
                          if (!user) {
                            toast.error("Please login to send proposals");
                            navigate("/login");
                            return;
                          }
                          setIsConnectionModalOpen(true);
                        }}
                        className={`rounded-2xl border p-4 relative cursor-pointer hover:border-primary/50 transition-colors ${tier.popular
                          ? "border-primary/50 bg-primary/5"
                          : "border-border bg-background"
                          }`}
                      >

                        {tier.popular && (
                          <span className="absolute -top-2.5 right-4 rounded-full gradient-sunset px-2 py-0.5 text-[9px] font-semibold text-white">
                            Popular
                          </span>
                        )}

                        <div className="flex items-center justify-between">

                          <h4 className="font-display text-xs font-bold">
                            {tier.name}
                          </h4>

                          <span className="font-display text-sm font-bold text-gradient-sunset">
                            {formatINR(
                              tier.price
                            )}
                          </span>

                        </div>

                        <ul className="mt-3 space-y-1.5">

                          {tier.perks.map(
                            (
                              perk,
                              index
                            ) => (
                              <li
                                key={
                                  index
                                }
                                className="flex items-start gap-1.5 text-[11px] text-muted-foreground"
                              >
                                <Check className="h-3 w-3 text-primary shrink-0 mt-0.5" />

                                <span>
                                  {perk}
                                </span>
                              </li>
                            )
                          )}

                        </ul>

                      </div>
                    )
                  )}

                </div>
              </div>
            )}

          </aside>

        </div>

        <div className="h-20" />

      </div>

      {/* REVIEW MODAL */}

      <Dialog
        open={isReviewModalOpen}
        onOpenChange={
          setIsReviewModalOpen
        }
      >

        <DialogContent className="sm:max-w-[480px] rounded-3xl">

          <DialogHeader>

            <DialogTitle className="font-display text-xl font-bold">
              Rate {inf.name}
            </DialogTitle>

            <DialogDescription className="text-xs">
              Share your collaboration experience.
            </DialogDescription>

          </DialogHeader>

          <form
            onSubmit={
              handleSubmitReview
            }
            className="space-y-4 mt-2"
          >

            <div className="space-y-2">

              <Label>
                Overall Rating
              </Label>

              <div className="flex items-center gap-1.5">

                {[1, 2, 3, 4, 5].map(
                  (star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setSubmitRating(
                          star
                        )
                      }
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${star <=
                          submitRating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30"
                          }`}
                      />
                    </button>
                  )
                )}

              </div>

            </div>

            <div className="space-y-1.5">

              <Label htmlFor="review-title">
                Review Title
              </Label>

              <Input
                id="review-title"
                required
                value={reviewTitle}
                onChange={(event) =>
                  setReviewTitle(
                    event.target.value
                  )
                }
                placeholder="Exceptional content quality & communication!"
                className="rounded-xl"
              />

            </div>

            <div className="space-y-1.5">

              <Label htmlFor="review-text">
                Detailed Feedback
              </Label>

              <Textarea
                id="review-text"
                required
                rows={4}
                value={reviewText}
                onChange={(event) =>
                  setReviewText(
                    event.target.value
                  )
                }
                placeholder="Describe your experience..."
                className="rounded-xl resize-none"
              />

            </div>

            <div className="space-y-1.5">

              <Label htmlFor="campaign-ref">
                Campaign Reference
              </Label>

              <Input
                id="campaign-ref"
                value={campaignRef}
                onChange={(event) =>
                  setCampaignRef(
                    event.target.value
                  )
                }
                placeholder="Summer Launch 2026"
                className="rounded-xl"
              />

            </div>

            <DialogFooter className="pt-2 flex gap-2">

              <Button
                type="button"
                variant="outline"
                className="rounded-full flex-1"
                onClick={() =>
                  setIsReviewModalOpen(
                    false
                  )
                }
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={
                  submittingReview
                }
                className="rounded-full flex-1 gradient-sunset border-0 text-white"
              >
                {submittingReview
                  ? "Submitting..."
                  : "Submit Review"}
              </Button>

            </DialogFooter>

          </form>

        </DialogContent>

      </Dialog>

      {/* CONNECTION MODAL */}

      <Dialog
        open={
          isConnectionModalOpen
        }
        onOpenChange={
          setIsConnectionModalOpen
        }
      >

        <DialogContent className="sm:max-w-[480px] rounded-3xl">

          <DialogHeader>

            <DialogTitle className="font-display text-xl font-bold">
              Connect with{" "}
              {inf.name}
            </DialogTitle>

            <DialogDescription className="text-xs">
              Send a personalized pitch message to introduce yourself and propose a collaboration.
            </DialogDescription>

          </DialogHeader>

          <form
            onSubmit={
              handleSendConnection
            }
            className="space-y-4 mt-2"
          >

            <div className="space-y-1.5">

              <Label htmlFor="pitch-text">
                Your Pitch / Collaboration Message
              </Label>

              <Textarea
                id="pitch-text"
                required
                rows={5}
                value={pitchText}
                onChange={(event) =>
                  setPitchText(
                    event.target.value
                  )
                }
                placeholder="Hi! I love your brand and would love to collaborate..."
                className="rounded-xl resize-none"
              />

            </div>

            <DialogFooter className="pt-2 flex gap-2">

              <Button
                type="button"
                variant="outline"
                className="rounded-full flex-1"
                onClick={() =>
                  setIsConnectionModalOpen(
                    false
                  )
                }
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={
                  sendingRequest
                }
                className="rounded-full flex-1 gradient-sunset border-0 text-white"
              >
                {sendingRequest
                  ? "Sending..."
                  : "Send Request"}
              </Button>

            </DialogFooter>

          </form>

        </DialogContent>

      </Dialog>

      {/* LIGHTBOX OVERLAY */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-5xl max-h-full">
            <button 
              className="absolute -top-12 right-0 text-white hover:text-gray-300 p-2 transition-colors rounded-full hover:bg-white/10"
              onClick={() => setLightboxImage(null)}
            >
              <X className="h-8 w-8" />
            </button>
            <img 
              src={lightboxImage} 
              alt="Portfolio full view" 
              className="max-h-[85vh] w-auto rounded-md shadow-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}