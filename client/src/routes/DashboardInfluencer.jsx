import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, useMemo } from "react";

import {
  FaInstagram,
  FaFacebook,
  FaLinkedin,
  FaYoutube,
  FaTwitter,
} from "react-icons/fa";


import {
  Eye,
  MousePointerClick,
  TrendingUp,
  Upload,
  Plus,
  Trash2,
 
  Camera,
  ImageIcon,

  Check,
  ChevronsUpDown,
  X,
  Star,
  Lock,
  RotateCw,
  ShieldCheck,
  ExternalLink,
  Activity,
  CreditCard,
  Building2,
  Percent,
  Sparkles,
  Clock,

} from "lucide-react";



import { Button } from "@/components/ui/Button";
import { CATEGORY_OPTIONS } from "@/data/influencer";
import { Switch } from "@/components/ui/Switch";
import { SubscriptionTab } from "../components/subscription/SubscriptionTab";

const QuoraIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M16.592 16.483c.783-.984 1.258-2.228 1.258-3.585 0-3.155-2.558-5.713-5.713-5.713S6.423 9.743 6.423 12.898s2.558 5.713 5.713 5.713c1.088 0 2.106-.305 2.975-.833l3.208 3.208c.28.28.73.28 1.01 0a.715.715 0 000-1.01l-2.737-2.493zm-4.455.518c-2.099 0-3.8-1.701-3.8-3.8 0-2.099 1.701-3.8 3.8-3.8s3.8 1.701 3.8 3.8c0 2.099-1.701 3.8-3.8 3.8z" />
  </svg>
);

function getCountdown(dueDateTimestamp) {
  const diff = dueDateTimestamp - Date.now();
  if (diff <= 0) {
    return { overdue: true, text: "Task Overdue" };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  let text = "";
  if (days > 0) text += `${days}d `;
  if (hours > 0 || days > 0) text += `${hours}h `;
  text += `${minutes}m remaining`;
  return { overdue: false, text };
}

function CountdownTimer({ dueDate }) {
  const [timeLeft, setTimeLeft] = useState(getCountdown(dueDate));

  useEffect(() => {
    setTimeLeft(getCountdown(dueDate));
    const timer = setInterval(() => {
      setTimeLeft(getCountdown(dueDate));
    }, 15000);

    return () => clearInterval(timer);
  }, [dueDate]);

  if (timeLeft.overdue) {
    return (
      <span className="inline-flex items-center gap-1 text-red-500 bg-red-500/10 px-2 py-0.5 rounded-md text-[11px] font-semibold border border-red-500/20">
        Task Overdue
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-primary bg-primary/10 px-2 py-0.5 rounded-md text-[11px] font-semibold border border-primary/20 animate-pulse">
      {timeLeft.text}
    </span>
  );
}

const LOCATION_OPTIONS = [
  "Pan India",
  "Delhi NCR",
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Surat",
  "Jaipur",
  "Lucknow",
  "Kanpur",
  "Noida",
  "Greater Noida",
  "Ghaziabad",
  "Gurugram",
  "Faridabad",
  "Indore",
  "Bhopal",
  "Nagpur",
  "Nashik",
  "Patna",
  "Ranchi",
  "Chandigarh",
  "Ludhiana",
  "Amritsar",
  "Jalandhar",
  "Dehradun",
  "Haridwar",
  "Varanasi",
  "Agra",
  "Prayagraj",
  "Meerut",
  "Gorakhpur",
  "Kochi",
  "Thiruvananthapuram",
  "Kozhikode",
  "Coimbatore",
  "Madurai",
  "Visakhapatnam",
  "Vijayawada",
  "Bhubaneswar",
  "Cuttack",
  "Guwahati",
  "Siliguri",
  "Jodhpur",
  "Udaipur",
  "Kota",
  "Mysore",
  "Mangalore",
  "Other Location",
];

import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/TextArea";
import { Badge } from "@/components/ui/Badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/Command";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/format";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import api from "@/lib/api";

export function DashboardInfluencer() {
  const navigate = useNavigate();
  const { profile, user, loading, updateProfile: updateLocalProfile, fetchProfile } = useAuth();

  const fileRef = useRef(null);
  const avatarFileRef = useRef(null);
  const coverFileRef = useRef(null);

  const resolveImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    let apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    if (apiUrl.endsWith("/api")) apiUrl = apiUrl.slice(0, -4);
    return `${apiUrl}${url}`;
  };

  // ================= REST API =================
  const apiGet = async (url, params = {}) => {
    const res = await api.get(url, { params });
    return res.data?.data ?? res.data;
  };
  const apiPost = async (url, data, config = {}) => {
    const res = await api.post(url, data, config);
    return res.data?.data ?? res.data;
  };
  const apiPut = async (url, data, config = {}) => {
    const res = await api.put(url, data, config);
    return res.data?.data ?? res.data;
  };
  const apiPatch = async (url, data, config = {}) => {
    const res = await api.patch(url, data, config);
    return res.data?.data ?? res.data;
  };
  const apiDelete = async (url, config = {}) => {
    const res = await api.delete(url, config);
    return res.data?.data ?? res.data;
  };

  const useRestQuery = (key, getter, enabled = true) => {
    const [data, setData] = useState(undefined);
    const [error, setError] = useState(null);

    useEffect(() => {
      let alive = true;

      if (!enabled) {
        setData(undefined);
        setError(null);
        return () => { alive = false; };
      }

      getter()
        .then((v) => {
          if (alive) {
            setData(v);
            setError(null);
          }
        })
        .catch((e) => {
          if (alive) {
            console.error(`REST query failed [${key}]`, e);
            setError(e);
            setData([]);
          }
        });

      return () => { alive = false; };
    }, [key, enabled]);

    return data;
  };

  // =====================================================
  // SAFE MONGO PROFILE ID
  // =====================================================
  // The pricing API expects Mongo Profile._id, NOT the custom userId
  // such as user_bmFAZ21haWwuY29t.
  const mongoProfileId =
    profile?._id ||
    profile?.id ||
    profile?.profileId ||
    null;

  const hasValidMongoProfileId =
    typeof mongoProfileId === "string" &&
    /^[a-fA-F0-9]{24}$/.test(mongoProfileId);

  const profileKey = mongoProfileId || "none";

  console.log("DASHBOARD PROFILE:", profile);
  console.log("DASHBOARD MONGO PROFILE ID:", mongoProfileId);

  // =====================================================
  // PROFILE-DEPENDENT QUERIES
  // =====================================================
  const pricingTiers = useRestQuery(
    `pricing-${profileKey}`,
    () => apiGet(`/pricing/profile/${mongoProfileId}`),
    hasValidMongoProfileId
  );

  const portfolioImages = useRestQuery(
    `portfolio-${profileKey}`,
    () => apiGet(`/portfolio/profile/${mongoProfileId}`),
    hasValidMongoProfileId
  );

  const connections = useRestQuery(
    `social-${profileKey}`,
    () => apiGet(`/social/profile/${mongoProfileId}`),
    hasValidMongoProfileId
  );

  const clientIds = useRestQuery(
    "oauth-client-ids",
    () => apiGet("/social/oauth/client-ids"),
    true
  );

  const syncConnection = async ({ connectionId }) => apiPost(`/social/oauth/exchange`, { connectionId });
  const disconnectPlatform = ({ connectionId }) => apiDelete(`/social/${connectionId}`);
  const updateProfile = ({ id, ...data }) => apiPut(`/profiles/${id}`, data);
  const upsertPricing = ({ profileId, tiers }) => apiPut(`/pricing`, { profileId, tiers });
  const removeTierMutation = ({ id }) => apiDelete(`/pricing/${id}`);

  const addPortfolioImage = async ({ profileId, imageFile, sortOrder }) => {
    const form = new FormData();
    form.append("image", imageFile);
    form.append("profileId", profileId);
    form.append("sortOrder", String(sortOrder ?? 0));
    return apiPost(`/portfolio`, form, { headers: { "Content-Type": "multipart/form-data" } });
  };
  const removePortfolioImage = ({ id }) => apiDelete(`/portfolio/${id}`);

  const setAvatarImage = async ({ file, profileId }) => {
    const form = new FormData();
    form.append("image", file);
    return apiPost(`/profiles/${profileId || mongoProfileId}/avatar`, form, { headers: { "Content-Type": "multipart/form-data" } });
  };
  const setCoverImage = async ({ file, profileId }) => {
    const form = new FormData();
    form.append("image", file);
    return apiPost(`/profiles/${profileId || mongoProfileId}/cover`, form, { headers: { "Content-Type": "multipart/form-data" } });
  };


  const popupSettings = null;
  const offers = useRestQuery("offers", () => apiGet(`/subscriptions/offers`), true) || [];
  const packages = useRestQuery("packages", () => apiGet(`/subscriptions/packages`), true) || [];
  const currentSub = useRestQuery(
    `subscription-${profileKey}`,
    () => apiGet(`/subscriptions/user/${mongoProfileId}`),
    hasValidMongoProfileId
  );
  const trackAnalytics = async () => {};
  const checkSubscriptionStatus = async () => {};
  const upgradeSubscription = ({ profileId, packageId, offerId }) =>
    apiPost(`/subscriptions`, { profileId, packageId, offerId });

  const reviews = useRestQuery(
    `reviews-${profileKey}`,
    () => apiGet(`/reviews/creator/${mongoProfileId}`, { visibleOnly: false }),
    hasValidMongoProfileId
  );
  const toggleVisibility = ({ reviewId }) => apiPatch(`/reviews/${reviewId}/visibility`, {});
  const myRequests = useRestQuery(
    `requests-${profileKey}`,
    () => apiGet(`/connections/creator/${mongoProfileId}/my-requests`),
    hasValidMongoProfileId
  );
  const myTasks = useRestQuery(
    `tasks-${profileKey}`,
    () => apiGet(`/tasks/creator/${mongoProfileId}`),
    hasValidMongoProfileId
  );
  const creatorPayments = useRestQuery(
    `payments-${profileKey}`,
    () => apiGet(`/payments/creator/${mongoProfileId}`),
    hasValidMongoProfileId
  );
  const notifications = useRestQuery(
    `notifications-${profileKey}`,
    () => apiGet(`/tasks/notifications/${mongoProfileId}`),
    hasValidMongoProfileId
  );
  const startTask = ({ taskId }) => apiPatch(`/tasks/${taskId}/start`, {});
  const submitTask = ({ taskId, submissionLink, notes, attachmentLink }) =>
    apiPatch(`/tasks/${taskId}/submit`, { submissionLink, notes, attachmentLink });
  const markRead = ({ notificationId }) => apiPatch(`/tasks/notifications/${notificationId}/read`, {});
  const saveBankDetails = (data) =>
    apiPost(`/payments/bank-details`, { ...data, creatorId: mongoProfileId });
  const bankDetails = useRestQuery(
    `bank-${profileKey}`,
    () => apiGet(`/payments/bank-details/${mongoProfileId}`),
    hasValidMongoProfileId
  );
  const submitVerification = (data) => apiPost(`/profiles/verification`, data);

  // Tab State
  const [activeTab, setActiveTab] = useState("dashboard");

  // Popup & Banner State
  const [showOfferPopup, setShowOfferPopup] = useState(false);
  const [activeOffer, setActiveOffer] = useState(null);
  const [dismissedBanner, setDismissedBanner] = useState(false);


  const [upgradingId, setUpgradingId] = useState(null);

  const handleUpgradeFromPopup = async (packageId, offerId) => {
    if (!profile) return;
    setUpgradingId(packageId);
    try {
      await upgradeSubscription({
        profileId: mongoProfileId,
        packageId,
        offerId,
      });
      toast.success("Package upgraded successfully! Enjoy your new features.");
      setShowOfferPopup(false);
    } catch (err) {
      console.error(err);
      toast.error((err).message || "Failed to upgrade package");
    } finally {
      setUpgradingId(null);
    }
  };

  useEffect(() => {
    if (profile) {
      checkSubscriptionStatus({ profileId: mongoProfileId }).catch(console.error);
    }
  }, [profile]);

  useEffect(() => {
    if (!popupSettings || !offers || !profile || !user) return;
    if (!popupSettings.showPopup) return;

    // Check target users
    const matchesTarget =
      popupSettings.targetUsers === "both" ||
      (popupSettings.targetUsers === "brands" && profile.role === "brand") ||
      (popupSettings.targetUsers === "creators" && profile.role === "creator");
    if (!matchesTarget) return;

    // Find active offer (optional)
    const activeOfferRecord = offers.find(
      (o) => o.active && o._id === popupSettings.activeOfferId && o.expiryDate > Date.now()
    );
    setActiveOffer(activeOfferRecord || null);

    const hasSeenKey = `popup_seen_${mongoProfileId}_${activeOfferRecord?._id || "no_offer"}`;
    const lastSeenTimeKey = `popup_last_seen_${mongoProfileId}`;
    const dontShowUntilKey = `popup_dont_show_until_${mongoProfileId}`;

    const now = Date.now();

    // Check "Don't Show Again for 7 Days"
    const dontShowUntil = localStorage.getItem(dontShowUntilKey);
    if (dontShowUntil && parseInt(dontShowUntil, 10) > now) {
      return;
    }

    let shouldDisplay = false;
    const frequency = popupSettings.popupFrequency;

    if (frequency === "every_login") {
      const seenThisSession = sessionStorage.getItem(hasSeenKey);
      if (!seenThisSession) {
        shouldDisplay = true;
      }
    } else if (frequency === "first_login" || frequency === "only_once") {
      const hasSeen = localStorage.getItem(hasSeenKey);
      if (!hasSeen) {
        shouldDisplay = true;
      }
    } else if (frequency === "every_7_days") {
      const lastSeen = localStorage.getItem(lastSeenTimeKey);
      if (!lastSeen || now - parseInt(lastSeen, 10) > 7 * 24 * 60 * 60 * 1000) {
        shouldDisplay = true;
      }
    }

    if (shouldDisplay) {
      setShowOfferPopup(true);
      sessionStorage.setItem(hasSeenKey, "true");
      localStorage.setItem(hasSeenKey, "true");
      localStorage.setItem(lastSeenTimeKey, now.toString());
      if (activeOfferRecord) {
        trackAnalytics({ offerId: activeOfferRecord._id, type: "view" });
      }
    }
  }, [popupSettings, offers, profile, user]);


  const [selectedAuditLogPayment, setSelectedAuditLogPayment] = useState(null);

  // Bank Account Form State
  const [bankFullName, setBankFullName] = useState("");
  const [bankPhone, setBankPhone] = useState("");
  const [bankEmail, setBankEmail] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankHolderName, setBankHolderName] = useState("");
  const [bankNumber, setBankNumber] = useState("");
  const [bankNumberConfirm, setBankNumberConfirm] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [bankUpi, setBankUpi] = useState("");
  const [bankPan, setBankPan] = useState("");
  const [savingBank, setSavingBank] = useState(false);

  useEffect(() => {
    if (bankDetails) {
      setBankFullName(bankDetails.fullName || "");
      setBankPhone(bankDetails.phone || "");
      setBankEmail(bankDetails.email || "");
      setBankName(bankDetails.bankName || "");
      setBankHolderName(bankDetails.accountHolderName || "");
      setBankNumber(bankDetails.accountNumber || "");
      setBankNumberConfirm(bankDetails.accountNumber || "");
      setBankIfsc(bankDetails.ifsc || "");
      setBankUpi(bankDetails.upiId || "");
      setBankPan(bankDetails.panNumber || "");
    }
  }, [bankDetails]);

  // Task Submission States
  const [submitTargetTask, setSubmitTargetTask] = useState(null);
  const [submissionLink, setSubmissionLink] = useState("");
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [submissionAttachment, setSubmissionAttachment] = useState("");
  const [submittingTask, setSubmittingTask] = useState(false);

  const [fullName, setFullName] = useState("");
  const [handle, setHandle] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [startingPrice, setStartingPrice] = useState(0);
  const [tiers, setTiers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [aadharStorageId, setAadharStorageId] = useState("");
  const [aadharFileName, setAadharFileName] = useState("");
  const [uploadingAadhar, setUploadingAadhar] = useState(false);
  const [panStorageId, setPanStorageId] = useState("");
  const [panFileName, setPanFileName] = useState("");
  const [uploadingPan, setUploadingPan] = useState(false);
  const [submittingVerification, setSubmittingVerification] = useState(false);

  // Social states
  const [instaHandle, setInstaHandle] = useState("");
  const [instaFollowers, setInstaFollowers] = useState(0);
  const [fbHandle, setFbHandle] = useState("");
  const [fbFollowers, setFbFollowers] = useState(0);
  const [liHandle, setLiHandle] = useState("");
  const [liFollowers, setLiFollowers] = useState(0);
  const [ytHandle, setYtHandle] = useState("");
  const [ytFollowers, setYtFollowers] = useState(0);
  const [quoraHandle, setQuoraHandle] = useState("");
  const [quoraFollowers, setQuoraFollowers] = useState(0);
  const [twHandle, setTwHandle] = useState("");
  const [twFollowers, setTwFollowers] = useState(0);
  const [showVerificationDialog, setShowVerificationDialog] =
  useState(false);

const [aadharFile, setAadharFile] =
  useState(null);

const [panFile, setPanFile] =
  useState(null);

const [verificationUploading, setVerificationUploading] =
  useState(false);

  // Social Verification States & Methods
  const [syncingPlatform, setSyncingPlatform] = useState(null);
  const [selectedChartPlatform, setSelectedChartPlatform] = useState("instagram");
  const activeChartConnection = connections?.find((c) => c.platform === selectedChartPlatform);
  const history = useRestQuery(
    `history-${activeChartConnection?._id || "none"}`,
    () => apiGet(`/social/${activeChartConnection._id}/history`),
    !!activeChartConnection
  );


  const chartData = useMemo(() => {
    if (!history) return [];
    return [...history]
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((item) => ({
        date: new Date(item.timestamp).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        followers: item.followers,
        views: item.views,
        engagement: item.engagementRate,
      }));
  }, [history]);

  const handleConnectPlatform = (platform) => {
    if (!profile || !clientIds) return;
    const redirectUri = encodeURIComponent(`${window.location.origin}/oauth/callback`);
    const state = `${platform}:${mongoProfileId}:${profile.role}`;

    let url = "";
    if (platform === "youtube") {
      const clientId = clientIds.googleClientId;
      if (!clientId) {
        toast.error("Google OAuth is not configured on the backend yet.");
        return;
      }
      url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=https://www.googleapis.com/auth/youtube.readonly&state=${state}&access_type=offline&prompt=consent`;
    } else if (platform === "instagram" || platform === "facebook") {
      const clientId = clientIds.metaClientId;
      if (!clientId) {
        toast.error("Meta OAuth is not configured on the backend yet.");
        return;
      }
      const scope = "pages_show_list,instagram_basic,instagram_manage_insights,pages_read_engagement";
      url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;
    } else if (platform === "linkedin") {
      const clientId = clientIds.linkedinClientId;
      if (!clientId) {
        toast.error("LinkedIn OAuth is not configured on the backend yet.");
        return;
      }
      url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=openid%20profile%20w_member_social`;
    } else if (platform === "twitter") {
      const clientId = clientIds.twitterClientId;
      if (!clientId) {
        toast.error("Twitter OAuth is not configured on the backend yet.");
        return;
      }
      sessionStorage.setItem("twitter_code_verifier", "challenge");
      url = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=users.read%20tweet.read%20offline.access&state=${state}&code_challenge=challenge&code_challenge_method=plain`;
    }

    if (url) {
      window.location.href = url;
    }
  };

  const handleManualSync = async (connectionId, platform) => {
    setSyncingPlatform(platform);
    const toastId = toast.loading(`Synchronizing ${platform.toUpperCase()} analytics...`);
    try {
      const res = await syncConnection({ connectionId });
      if (res.success) {
        toast.success(`${platform.toUpperCase()} metrics updated successfully!`, { id: toastId });
      } else {
        toast.error(`Sync failed: ${res.error}`, { id: toastId });
      }
    } catch (err) {
      const e = err ;
      toast.error(e.message || "Failed to trigger sync", { id: toastId });
    } finally {
      setSyncingPlatform(null);
    }
  };

  const handleDisconnect = async (connectionId, platform) => {
    if (!confirm(`Are you sure you want to disconnect your verified ${platform.toUpperCase()} account?`)) return;
    try {
      await disconnectPlatform({ connectionId });
      toast.success(`Disconnected verified ${platform.toUpperCase()} account.`);
    } catch (err) {
      const e = err ;
      toast.error(e.message || "Failed to disconnect account.");
    }
  };

  const selectedCategories = category
    ? category
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  const handleSelectCategory = (val) => {
    let updated;
    if (selectedCategories.includes(val)) {
      updated = selectedCategories.filter((c) => c !== val);
    } else {
      updated = [...selectedCategories, val];
    }
    setCategory(updated.join(", "));
  };

  const selectedLocations = location
    ? location
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  const handleSelectLocation = (val) => {
    let updated;
    if (selectedLocations.includes(val)) {
      updated = selectedLocations.filter((c) => c !== val);
    } else {
      updated = [...selectedLocations, val];
    }
    setLocation(updated.join(", "));
  };

  useEffect(() => {
    document.title = "Creator dashboard —  Pravixo";
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setHandle(profile.handle || "");
      setCategory(profile.category || "");
      setLocation(profile.location || "");
      setBio(profile.bio || "");
      setStartingPrice(Number(profile.startingPrice ?? 0));
      // Socials
      setInstaHandle(profile.instagramHandle || "");
      setInstaFollowers(profile.instagramFollowers || 0);
      setFbHandle(profile.facebookHandle || "");
      setFbFollowers(profile.facebookFollowers || 0);
      setLiHandle(profile.linkedinHandle || "");
      setLiFollowers(profile.linkedinFollowers || 0);
      setYtHandle(profile.youtubeHandle || "");
      setYtFollowers(profile.youtubeFollowers || 0);
      setQuoraHandle(profile.quoraHandle || "");
      setQuoraFollowers(profile.quoraFollowers || 0);
      setTwHandle(profile.twitterHandle || "");
      setTwFollowers(profile.twitterFollowers || 0);
    }
  }, [profile]);

  useEffect(() => {
    if (pricingTiers && pricingTiers.length) {
      setTiers(
        pricingTiers.map((t) => ({
          id: t._id,
          name: t.name,
          price: t.price,
          sortOrder: t.sortOrder,
        })),
      );
    } else if (pricingTiers && pricingTiers.length === 0) {
      setTiers([
        { name: "Story", price: 0, sortOrder: 0 },
        { name: "Post", price: 0, sortOrder: 1 },
        { name: "Reel", price: 0, sortOrder: 2 },
      ]);
    }
  }, [pricingTiers]);

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const res = await updateProfile({
        id: mongoProfileId,
        fullName,
        handle: handle || undefined,
        category: category || undefined,
        location: location || undefined,
        bio: bio || undefined,
        startingPrice,
        // Socials
        instagramHandle: instaHandle || undefined,
        instagramFollowers: instaFollowers,
        facebookHandle: fbHandle || undefined,
        facebookFollowers: fbFollowers,
        linkedinHandle: liHandle || undefined,
        linkedinFollowers: liFollowers,
        youtubeHandle: ytHandle || undefined,
        youtubeFollowers: ytFollowers,
        quoraHandle: quoraHandle || undefined,
        quoraFollowers: quoraFollowers,
        twitterHandle: twHandle || undefined,
        twitterFollowers: twFollowers,
      });
      const updated = res?.data || res?.profile || res;
      if (updated && updateLocalProfile) {
        updateLocalProfile(updated);
      }
      toast.success("Profile saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };


  const savePricing = async () => {
    if (!profile) return;
    try {
      await upsertPricing({
        profileId: mongoProfileId,
        tiers: tiers.map((t, idx) => ({
          id: t.id,
          name: t.name,
          price: t.price,
          sortOrder: idx,
        })),
      });
      toast.success("Pricing updated");
    } catch (err) {
      const e = err ;
      toast.error(e.message);
    }
  };

  const removeTier = async (idx) => {
    const t = tiers[idx];
    if (t.id) {
      try {
        await removeTierMutation({ id: t.id });
      } catch (err) {
        const e = err ;
        toast.error(e.message);
        return;
      }
    }
    setTiers(tiers.filter((_, i) => i !== idx));
  };

  const onUpload = async (e) => {
    if (!profile || !e.target.files?.length) return;
    const file = e.target.files[0];
    setUploading(true);
    try {
      await addPortfolioImage({
        profileId: mongoProfileId,
        imageFile: file,
        sortOrder: portfolioImages?.length || 0,
      });

      toast.success("Image uploaded");
    } catch (err) {
      const e = err ;
      toast.error(e.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onAvatarUpload = async (e) => {
    if (!profile || !e.target.files?.length) return;
    const file = e.target.files[0];
    setUploadingAvatar(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await apiPost(`/profiles/${mongoProfileId}/avatar`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updatedProfile = res?.data || res?.profile || res;
      if (updatedProfile && updateLocalProfile) {
        updateLocalProfile(updatedProfile);
      }
      toast.success("Profile photo updated successfully!");
    } catch (err) {
      console.error("Avatar upload error:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to update profile photo");
    } finally {
      setUploadingAvatar(false);
      if (avatarFileRef.current) avatarFileRef.current.value = "";
    }
  };

  const onCoverUpload = async (e) => {
    if (!profile || !e.target.files?.length) return;
    const file = e.target.files[0];

    // Validate image dimensions (1361x450 max)
    const isImageValid = await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        if (img.width > 1361 || img.height > 450) {
          resolve(false);
        } else {
          resolve(true);
        }
      };
      img.onerror = () => resolve(false);
      img.src = URL.createObjectURL(file);
    });

    if (!isImageValid) {
      toast.error("Banner size must be 1361x450 pixels or smaller.");
      if (coverFileRef.current) coverFileRef.current.value = "";
      return;
    }

    setUploadingCover(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await apiPost(`/profiles/${mongoProfileId}/cover`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updatedProfile = res?.data || res?.profile || res;
      if (updatedProfile && updateLocalProfile) {
        updateLocalProfile(updatedProfile);
      }
      toast.success("Banner updated successfully!");
    } catch (err) {
      console.error("Cover upload error:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to update cover banner");
    } finally {
      setUploadingCover(false);
      if (coverFileRef.current) coverFileRef.current.value = "";
    }
  };

  const onAadharUpload = (e) => {
    if (!profile || !e.target.files?.length) return;
    const file = e.target.files[0];
    setAadharFile(file);
    setAadharFileName(file.name);
    setAadharStorageId("selected");
    toast.success(`Aadhar Card selected: ${file.name}`);
  };

  const onPanUpload = (e) => {
    if (!profile || !e.target.files?.length) return;
    const file = e.target.files[0];
    setPanFile(file);
    setPanFileName(file.name);
    setPanStorageId("selected");
    toast.success(`PAN Card selected: ${file.name}`);
  };

  const handleVerificationSubmit = async () => {
    if (!profile || (!aadharFile && !panFile)) {
      toast.error("Please upload at least Aadhar or PAN card.");
      return;
    }
    setSubmittingVerification(true);
    try {
      const form = new FormData();
      if (aadharFile) form.append("aadhar", aadharFile);
      if (panFile) form.append("pan", panFile);

      const res = await apiPost(`/profiles/${mongoProfileId}/kyc-documents`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updatedProfile = res?.data || res?.profile || res;
      if (updatedProfile && updateLocalProfile) {
        updateLocalProfile(updatedProfile);
      }
      toast.success("Verification documents submitted! Under review.");
      setShowVerificationDialog(false);
      setAadharFile(null);
      setAadharFileName("");
      setAadharStorageId("");
      setPanFile(null);
      setPanFileName("");
      setPanStorageId("");
    } catch (err) {
      console.error("KYC submit error:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to submit verification request");
    } finally {
      setSubmittingVerification(false);
    }
  };


  const removeImage = async (id) => {
    try {
      await removePortfolioImage({ id });
      toast.success("Image removed");
    } catch (err) {
      const e = err ;
      toast.error(e.message);
    }
  };

  const handleToggleVisibility = async (reviewId) => {
    if (!profile) return;
    try {
      const res = await toggleVisibility({
        reviewId,
        creatorId: mongoProfileId,
      });
      if (res.visible) {
        toast.success("Review is now visible on your public profile");
      } else {
        toast.info("Review is now hidden from your public profile");
      }
    } catch (err) {
      const e = err ;
      toast.error(e.message || "Failed to update review visibility");
    }
  };

  const displayName =
    fullName?.split(" ")[0] ||
    profile?.fullName?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "there";
   console.log("PROFILE FROM API:", profile);
console.log("Verification Status:", profile?.verificationStatus);

  return (
    <div>
      {/* Sticky Top Promo Banner */}
      {activeOffer && !dismissedBanner && (
        <div className="bg-gradient-to-r from-red-600 via-amber-500 to-red-600 text-white py-2 px-4 shadow-md sticky top-[64px] z-40">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-[9px] uppercase font-bold animate-pulse">Limited Deal</span>
              <span>🔥 Upgrade Account: Get special discounts on premium packages!</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="link"
                className="text-white hover:text-white/80 p-0 h-auto font-bold underline text-xs"
                onClick={() => {
                  setActiveTab("subscription");
                  trackAnalytics({ offerId: activeOffer._id, type: "click" });
                }}
              >
                Upgrade Now
              </Button>
              <button
                className="hover:opacity-80 p-1"
                onClick={() => setDismissedBanner(true)}
                aria-label="Dismiss banner"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COVER BANNER PREVIEW */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="relative aspect-[1361/450] overflow-hidden bg-muted w-full rounded-b-2xl sm:rounded-b-3xl rounded-t-none shadow-sm border border-border/50">
          {resolveImageUrl(profile?.coverUrl) ? (
            <img
              src={resolveImageUrl(profile.coverUrl)}
              alt="Cover"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              Banner preview
            </div>
          )}
        </section>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-4">
  <div className="flex flex-col gap-2">
    <p className="text-sm text-muted-foreground">
      Creator dashboard
    </p>

    <h1 className="font-display text-3xl font-bold sm:text-4xl">
      Hello, {displayName} 👋
    </h1>
  </div>

  {/* Real-time Notifications Banner */}
  {notifications && notifications.filter(n => !n.read).length > 0 && (
    <div className="mt-4 space-y-2 col-span-full">
      {notifications.filter(n => !n.read).map((notif) => (
        <div
          key={notif._id}
          className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-primary/20 bg-primary/5 text-primary shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <Activity className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-sm font-medium">{notif.text}</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="rounded-full h-8 text-xs hover:bg-primary/10 text-primary font-semibold"
            onClick={async () => {
              try {
                await markRead({ notificationId: notif._id });
              } catch (e) {
                console.error(e);
              }
            }}
          >
            Mark as Read
          </Button>
        </div>
      ))}
    </div>
  )}

  {(() => {
    const status = profile?.verificationStatus;
    if (status === "verified") {
      return (
        <Button className="rounded-full bg-emerald-600 hover:bg-emerald-600 text-white px-6 cursor-default flex items-center gap-1.5 font-semibold">
          <Check className="h-4 w-4" /> Verified
        </Button>
      );
    }
    if (status === "pending") {
      return (
        <Button disabled className="rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 px-6 font-semibold opacity-70">
          Verification Pending
        </Button>
      );
    }
    if (status === "rejected") {
      return (
        <Button
          onClick={() => setShowVerificationDialog(true)}
          className="rounded-full bg-red-600 hover:bg-red-700 text-white px-6 font-semibold shadow-sm"
        >
          Verification Failed (Try Again)
        </Button>
      );
    }
    // Default: unverified
    return (
      <Button
        onClick={() => setShowVerificationDialog(true)}
        className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-6 font-semibold"
      >
        Get Verified
      </Button>
    );
  })()}

  <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
    <DialogContent className="sm:max-w-md rounded-3xl">
      <DialogHeader>
        <DialogTitle className="font-display text-xl font-bold">Verify Your Profile</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          Upload your Aadhar Card and PAN Card to request creator verification. Files will be stored securely.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-6 py-4">
        {/* Aadhar Upload */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Aadhar Card (PDF, JPG, PNG)</Label>
          <div className="flex items-center gap-3">
            <label className="flex-1 inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/20 hover:bg-secondary/40 px-4 py-6 text-sm font-medium transition-colors">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">
                  {uploadingAadhar ? "Uploading..." : aadharFileName ? aadharFileName : "Upload Aadhar"}
                </p>
                <p className="text-xs text-muted-foreground">Max size 5MB</p>
              </div>
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={onAadharUpload}
                disabled={uploadingAadhar || submittingVerification}
              />
            </label>
            {aadharStorageId && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <Check className="h-5 w-5" />
              </div>
            )}
          </div>
        </div>

        {/* PAN Upload */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">PAN Card (PDF, JPG, PNG)</Label>
          <div className="flex items-center gap-3">
            <label className="flex-1 inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/20 hover:bg-secondary/40 px-4 py-6 text-sm font-medium transition-colors">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">
                  {uploadingPan ? "Uploading..." : panFileName ? panFileName : "Upload PAN"}
                </p>
                <p className="text-xs text-muted-foreground">Max size 5MB</p>
              </div>
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={onPanUpload}
                disabled={uploadingPan || submittingVerification}
              />
            </label>
            {panStorageId && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <Check className="h-5 w-5" />
              </div>
            )}
          </div>
        </div>
      </div>

      <DialogFooter className="flex sm:justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setShowVerificationDialog(false);
            setAadharStorageId("");
            setAadharFileName("");
            setPanStorageId("");
            setPanFileName("");
          }}
          disabled={submittingVerification}
          className="rounded-full"
        >
          Cancel
        </Button>
        <Button
          onClick={handleVerificationSubmit}
          disabled={!aadharStorageId || !panStorageId || submittingVerification}
          className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-glow px-5"
        >
          {submittingVerification ? "Submitting..." : "Submit Documents"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</div>

        <div className="mt-8 grid gap-4 grid-cols-2 md:grid-cols-3">
          {[
            {
              icon: Eye,
              label: "Profile views",
              value: profile?.profileViews?.toLocaleString() || "0",
              // delta: "+18%",
            },
            {
              icon: MousePointerClick,
              label: "Clicks",
              value: profile?.clicks?.toLocaleString() || "0",
              // delta: "+9%",
            },
            {
              icon: TrendingUp,
              label: "Bookings",
              value: profile?.bookings?.toLocaleString() || "0",
              // delta: "+4",
            },
          ].map(
              (s, idx) => (
              <div
                key={s.label}
                className={cn(
                  "rounded-3xl border border-border bg-card p-6",
                  idx === 2 && "col-span-2 md:col-span-1",
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <s.icon className="h-5 w-5" />
                  </div>
                  {s.delta && (
                    <Badge
                      variant="secondary"
                      className="rounded-full text-xs text-emerald-600"
                    >
                      {s.delta}
                    </Badge>
                  )}
                </div>
                <div className="mt-4 font-display text-3xl font-bold">
                  {s.value}
                </div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ),
          )}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[200px_1fr] items-start">
          {/* Left Navigation Sidebar */}
          <div className="space-y-1.5 rounded-3xl border border-border bg-card p-4 shadow-sm">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2.5 w-full rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                activeTab === "dashboard"
                  ? "gradient-sunset text-white shadow-glow"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              }`}
            >
              <Building2 className="h-4 w-4" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("subscription")}
              className={`flex items-center gap-2.5 w-full rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                activeTab === "subscription"
                  ? "gradient-sunset text-white shadow-glow"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              }`}
            >
              <Star className="h-4 w-4" />
              ⭐ Packages
            </button>
          </div>

          <div className="flex-1">
            {activeTab === "dashboard" ? (
              <>
                <div className="grid gap-6 lg:grid-cols-3 items-start">
          <div className="rounded-3xl border border-border bg-card p-6 lg:col-span-2">
            <h2 className="font-display text-lg font-semibold">Edit profile</h2>
            <div className="mt-5">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <img src={
                    resolveImageUrl(profile?.avatarUrl) ||
                    profile?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      profile?.fullName || user?.email || "User"
                    )}&background=random`
                  }
                  alt=""
                  className="h-20 w-20 rounded-full border border-border object-cover bg-muted"
                 onError={(e) => { e.target.onerror = null; e.target.src = "https://avatar.iran.liara.run/public?username=Fallback"; }} />
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-secondary">
                    <Camera className="h-4 w-4" />
                    {uploadingAvatar ? "Uploading..." : "Upload profile photo"}
                    <input
                      ref={avatarFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onAvatarUpload}
                      disabled={uploadingAvatar}
                    />
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-secondary">
                    <ImageIcon className="h-4 w-4" />
                    {uploadingCover ? "Uploading..." : "Upload banner"}
                    <input
                      ref={coverFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onCoverUpload}
                      disabled={uploadingCover}
                    />
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Display name</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Handle</Label>
                <Input
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="@yourname"
                  className="mt-1.5"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Category</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex min-h-[2.5rem] w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-left mt-1.5 cursor-pointer"
                    >
                      <div className="flex flex-wrap gap-1">
                        {selectedCategories.length === 0 ? (
                          <span className="text-muted-foreground">
                            Select categories...
                          </span>
                        ) : (
                          selectedCategories.map((cat) => (
                            <Badge
                              key={cat}
                              variant="secondary"
                              className="rounded-sm px-1.5 py-0.5 font-normal text-xs flex items-center gap-1"
                            >
                              {cat}
                              <span
                                role="button"
                                tabIndex={0}
                                className="rounded-full outline-none hover:bg-muted p-0.5 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectCategory(cat);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.stopPropagation();
                                    handleSelectCategory(cat);
                                  }
                                }}
                              >
                                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                              </span>
                            </Badge>
                          ))
                        )}
                      </div>
                      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0"
                    align="start"
                  >
                    <Command className="w-full">
                      <CommandInput
                        placeholder="Search categories..."
                        className="h-9"
                      />
                      <CommandList className="max-h-[300px] overflow-y-auto">
                        <CommandEmpty>No category found.</CommandEmpty>
                        <CommandGroup>
                          {CATEGORY_OPTIONS.map((cat) => {
                            const isSelected = selectedCategories.includes(cat);
                            return (
                              <CommandItem
                                key={cat}
                                value={cat}
                                onSelect={() => handleSelectCategory(cat)}
                                className="flex items-center justify-between cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className={cn(
                                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                      isSelected
                                        ? "bg-primary text-primary-foreground"
                                        : "opacity-50 [&_svg]:invisible",
                                    )}
                                  >
                                    <Check className="h-3 w-3" />
                                  </div>
                                  <span>{cat}</span>
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Location</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex min-h-[2.5rem] w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-left mt-1.5 cursor-pointer"
                    >
                      <div className="flex flex-wrap gap-1">
                        {selectedLocations.length === 0 ? (
                          <span className="text-muted-foreground">
                            Select locations...
                          </span>
                        ) : (
                          selectedLocations.map((loc) => (
                            <Badge
                              key={loc}
                              variant="secondary"
                              className="rounded-sm px-1.5 py-0.5 font-normal text-xs flex items-center gap-1"
                            >
                              {loc}
                              <span
                                role="button"
                                tabIndex={0}
                                className="rounded-full outline-none hover:bg-muted p-0.5 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectLocation(loc);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.stopPropagation();
                                    handleSelectLocation(loc);
                                  }
                                }}
                              >
                                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                              </span>
                            </Badge>
                          ))
                        )}
                      </div>
                      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0"
                    align="start"
                  >
                    <Command className="w-full">
                      <CommandInput
                        placeholder="Search locations..."
                        className="h-9"
                      />
                      <CommandList className="max-h-[300px] overflow-y-auto">
                        <CommandEmpty>No location found.</CommandEmpty>
                        <CommandGroup>
                          {LOCATION_OPTIONS.map((loc) => {
                            const isSelected = selectedLocations.includes(loc);
                            return (
                              <CommandItem
                                key={loc}
                                value={loc}
                                onSelect={() => handleSelectLocation(loc)}
                                className="flex items-center justify-between cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className={cn(
                                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                      isSelected
                                        ? "bg-primary text-primary-foreground"
                                        : "opacity-50 [&_svg]:invisible",
                                    )}
                                  >
                                    <Check className="h-3 w-3" />
                                  </div>
                                  <span>{loc}</span>
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Starting price (₹)</Label>
                <Input
                  type="number"
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(Number(e.target.value))}
                  className="mt-1.5"
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Bio</Label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="mt-1.5"
                  rows={3}
                />
              </div>
            </div>

            <h3 className="mt-8 font-display text-base font-semibold">
              Social presence
            </h3>
            <p className="mb-4 text-xs text-muted-foreground">
              Verify your accounts using official OAuth platforms or update them manually.
            </p>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  id: "instagram",
                  name: "Instagram",
                  icon: FaInstagram,
                  iconClass: "text-pink-600",
                  handle: instaHandle,
                  setHandle: setInstaHandle,
                  followers: instaFollowers,
                  setFollowers: setInstaFollowers,
                  oauth: true,
                },
                {
                  id: "facebook",
                  name: "Facebook",
                  icon: FaFacebook,
                  iconClass: "text-blue-600",
                  handle: fbHandle,
                  setHandle: setFbHandle,
                  followers: fbFollowers,
                  setFollowers: setFbFollowers,
                  oauth: true,
                },
                {
                  id: "linkedin",
                  name: "LinkedIn",
                  icon: FaLinkedin,
                  iconClass: "text-blue-800",
                  handle: liHandle,
                  setHandle: setLiHandle,
                  followers: liFollowers,
                  setFollowers: setLiFollowers,
                  oauth: true,
                },
                {
                  id: "youtube",
                  name: "YouTube",
                  icon: FaYoutube,
                  iconClass: "text-red-600",
                  handle: ytHandle,
                  setHandle: setYtHandle,
                  followers: ytFollowers,
                  setFollowers: setYtFollowers,
                  oauth: true,
                },
                {
                  id: "quora",
                  name: "Quora",
                  icon: QuoraIcon,
                  iconClass: "text-red-700",
                  handle: quoraHandle,
                  setHandle: setQuoraHandle,
                  followers: quoraFollowers,
                  setFollowers: setQuoraFollowers,
                  oauth: false,
                },
                {
                  id: "twitter",
                  name: "X (Twitter)",
                  icon: FaTwitter,
                  iconClass: "text-sky-500",
                  handle: twHandle,
                  setHandle: setTwHandle,
                  followers: twFollowers,
                  setFollowers: setTwFollowers,
                  oauth: true,
                },
              ].map((plat) => {
                const conn = connections?.find((c) => c.platform === plat.id);
                const isVerified = conn?.verified;
                const Icon = plat.icon;

                return (
                  <div
                    key={plat.id}
                    className={cn(
                      "space-y-3 rounded-2xl border p-3 sm:p-4 bg-muted/20 relative transition-all duration-200",
                      isVerified ? "border-primary/40 bg-primary/5 shadow-sm" : "border-border"
                    )}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Icon className={cn("h-4 w-4 shrink-0", plat.iconClass)} />
                        <span className="text-sm font-semibold truncate">
                          {plat.name}
                        </span>
                        {isVerified && (
                          <span title="OAuth Verified">
                            <ShieldCheck className="h-4 w-4 text-primary fill-primary/10 shrink-0" />
                          </span>
                        )}
                      </div>
                      {plat.oauth && (
                        <div className="flex items-center gap-1.5">
                          {isVerified ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleManualSync(conn._id, plat.id)}
                                disabled={syncingPlatform !== null}
                                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-secondary cursor-pointer"
                                title="Force sync now"
                              >
                                <RotateCw className={cn("h-3.5 w-3.5", syncingPlatform === plat.id && "animate-spin")} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDisconnect(conn._id, plat.id)}
                                className="text-xs text-destructive hover:underline font-medium cursor-pointer"
                              >
                                Disconnect
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleConnectPlatform(plat.id)}
                              className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline cursor-pointer"
                            >
                              Verify OAuth
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {isVerified ? (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-xs border-b border-border/40 pb-1.5">
                          <span className="text-muted-foreground">Handle:</span>
                          <span className="font-semibold text-foreground truncate max-w-[120px]">
                            {conn.handle}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs border-b border-border/40 pb-1.5">
                          <span className="text-muted-foreground">Followers:</span>
                          <span className="font-semibold text-foreground flex items-center gap-1">
                            <Lock className="h-3 w-3 text-muted-foreground/60" />
                            {conn.followers?.toLocaleString() || "0"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Sync Status:</span>
                          <span className="flex items-center gap-1.5 font-medium">
                            <span
                              className={cn(
                                "h-2 w-2 rounded-full",
                                conn.syncStatus === "success" && "bg-emerald-500",
                                conn.syncStatus === "syncing" && "bg-amber-500 animate-pulse",
                                conn.syncStatus === "failed" && "bg-destructive"
                              )}
                            />
                            <span className="text-[10px] capitalize text-muted-foreground">
                              {conn.syncStatus}
                            </span>
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Handle
                          </Label>
                          <Input
                            size={1}
                            value={plat.handle}
                            onChange={(e) => plat.setHandle(e.target.value)}
                            placeholder={plat.id === "linkedin" ? "in/username" : plat.id === "quora" ? "username" : "@username"}
                            className="h-8 text-xs mt-0.5"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Followers
                          </Label>
                          <Input
                            type="number"
                            value={plat.followers}
                            onChange={(e) => plat.setFollowers(Number(e.target.value))}
                            className="h-8 text-xs mt-0.5"
                          />
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Growth trends charts if verified accounts exist */}
            {connections && connections.some((c) => c.verified) && (
              <div className="mt-6 border border-border rounded-2xl p-4 bg-muted/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold flex items-center gap-1.5">
                      <Activity className="h-4 w-4 text-primary" /> Verified Analytics Trends
                    </h4>
                    <p className="text-[10px] text-muted-foreground">
                      Growth analytics fetched from official platform endpoints.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">Platform:</span>
                    <select
                      value={selectedChartPlatform}
                      onChange={(e) => setSelectedChartPlatform(e.target.value)}
                      className="rounded-full border border-border bg-background px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      {connections
                        .filter((c) => c.verified)
                        .map((c) => (
                          <option key={c._id} value={c.platform}>
                            {c.platform.toUpperCase()}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {chartData.length > 0 ? (
                  <div className="h-48 w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} />
                        <YAxis stroke="#94a3b8" fontSize={9} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "12px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="followers"
                          stroke="#f43f5e"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorFollowers)"
                          name="Followers"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center border border-dashed border-border rounded-xl text-xs text-muted-foreground">
                    No historical sync metrics logged for this account yet. Sync runs automatically every 12 hours.
                  </div>
                )}
              </div>
            )}

            <h3 className="mt-8 font-display text-base font-semibold">
              Portfolio
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {portfolioImages?.map((img) => (
                <div
                  key={img._id}
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-border"
                >
                  {img.url && (
                    <img
                      src={resolveImageUrl(img.url)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                  <button
                    onClick={() => removeImage(img._id)}
                    className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 opacity-0 shadow-soft transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </button>
                </div>
              ))}
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-border text-xs text-muted-foreground hover:bg-secondary">
                <Upload className="h-5 w-5" />
                {uploading ? "Uploading…" : "Upload"}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onUpload}
                  disabled={uploading}
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={saveProfile}
                disabled={saving}
                className="rounded-full gradient-sunset border-0 text-white shadow-glow"
              >
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-1">
            {/* ASSIGNED TASKS */}
            <div className="rounded-3xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-semibold">Assigned Tasks</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage your active campaign deliverables.
              </p>
              <div className="mt-5 space-y-4">
                {!myTasks ? (
                  <p className="text-xs text-muted-foreground">Loading tasks...</p>
                ) : myTasks.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No tasks assigned yet.</p>
                ) : (
                  myTasks.map((task) => (
                    <div
                      key={task._id}
                      className="rounded-2xl border border-border p-4 space-y-3 bg-secondary/10 hover:bg-secondary/20 transition-all duration-200"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-foreground truncate">
                            {task.title}
                          </h4>
                          <p className="text-[10px] text-muted-foreground truncate">
                            Campaign: {task.campaign?.title || "General"}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            Brand: {task.brand?.fullName}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "rounded-full text-[9px] uppercase px-1.5 py-0.5 font-semibold shrink-0",
                            task.status === "approved" && "bg-emerald-500/10 text-emerald-600",
                            task.status === "completed" && "bg-blue-500/10 text-blue-500",
                            task.status === "in_progress" && "bg-primary/10 text-primary",
                            task.status === "revision_requested" && "bg-red-500/10 text-red-500",
                            task.status === "assigned" && "bg-amber/10 text-amber"
                          )}
                        >
                          {task.status.replace("_", " ")}
                        </Badge>
                      </div>

                      <div className="text-xs space-y-1 bg-background/50 border border-border/40 rounded-xl p-2.5">
                        <p className="text-muted-foreground">
                          <strong>Deliverables:</strong> {task.deliverables}
                        </p>
                        <p className="text-muted-foreground">
                          <strong>Due:</strong> {new Date(task.dueDate).toLocaleString()}
                        </p>
                        <p className="text-muted-foreground capitalize">
                          <strong>Priority:</strong> {task.priority}
                        </p>
                      </div>

                      {/* Live Countdown for In Progress / Revision Requested */}
                      {(task.status === "in_progress" || task.status === "revision_requested") && (
                        <div className="flex items-center justify-between text-xs border-t border-border/40 pt-2.5">
                          <span className="text-muted-foreground">Time Left:</span>
                          <CountdownTimer dueDate={task.dueDate} />
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        {task.status === "assigned" ? (
                          <Button
                            size="sm"
                            className="flex-1 rounded-full gradient-sunset border-0 text-white text-[11px] font-semibold h-8"
                            onClick={async () => {
                              try {
                                await startTask({ taskId: task._id });
                                toast.success("Task started! Countdown active.");
                              } catch (e) {
                                toast.error((e).message);
                              }
                            }}
                          >
                            Start Task
                          </Button>
                        ) : (task.status === "in_progress" || task.status === "revision_requested") ? (
                          <Button
                            size="sm"
                            className="flex-1 rounded-full gradient-sunset border-0 text-white text-[11px] font-semibold h-8"
                            onClick={() => {
                              setSubmitTargetTask(task);
                              setSubmissionLink("");
                              setSubmissionNotes("");
                              setSubmissionAttachment("");
                            }}
                          >
                            Submit Task
                          </Button>
                        ) : null}

                        <Link
                          to={`/messages?conversationId=${task.conversationId}`}
                          className="flex-1"
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full rounded-full border-border hover:bg-secondary text-[11px] font-semibold h-8"
                          >
                            Open Chat
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* MY REQUESTS */}
            <div className="rounded-3xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-semibold">My Requests</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Track your active collaboration requests.
              </p>
              <div className="mt-5 space-y-3">
                {!myRequests ? (
                  <p className="text-xs text-muted-foreground">Loading requests...</p>
                ) : myRequests.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No connection requests sent yet.</p>
                ) : (
                  myRequests.map((req) => (
                    <div
                      key={req._id}
                      className="rounded-2xl border border-border p-3 space-y-2 bg-secondary/10 hover:bg-secondary/20 transition-all duration-200"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-foreground truncate">
                            {req.campaign?.title || "General Connection"}
                          </h4>
                          <p className="text-[10px] text-muted-foreground truncate">
                            Brand: {req.brandProfile?.fullName || "Unknown"}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "rounded-full text-[9px] uppercase px-1.5 py-0.5 font-semibold",
                            req.status === "accepted" && "bg-emerald-500/10 text-emerald-600",
                            req.status === "pending" && "bg-amber/10 text-amber",
                            req.status === "rejected" && "bg-red-500/10 text-red-500"
                          )}
                        >
                          {req.status}
                        </Badge>
                      </div>

                      {req.status === "accepted" && req.conversationId ? (
                        <Link
                          to={`/messages?conversationId=${req.conversationId}`}
                          className="block w-full"
                        >
                          <Button
                            size="sm"
                            className="w-full h-8 rounded-full gradient-sunset border-0 text-white text-[10px] font-semibold cursor-pointer"
                          >
                            Open Chat
                          </Button>
                        </Link>
                      ) : req.status === "pending" ? (
                        <div className="text-[10px] text-center text-amber bg-amber/5 rounded-full py-1 font-semibold border border-amber/10">
                          Waiting for Brand Approval
                        </div>
                      ) : (
                        <div className="text-[10px] text-center text-red-500 bg-red-500/5 rounded-full py-1 font-semibold border border-red-500/10">
                          Request Rejected
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* PRICING */}
            <div className="rounded-3xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">Pricing</h2>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() =>
                    setTiers([
                      ...tiers,
                      { name: "New tier", price: 0, sortOrder: tiers.length },
                    ])
                  }
                >
                  <Plus className="mr-1 h-3 w-3" /> Add
                </Button>
              </div>
              <div className="mt-5 space-y-3">
                {tiers.map((t, idx) => (
                  <div key={idx} className="rounded-2xl border border-border p-4">
                    <div className="flex items-center justify-between gap-2">
                      <Input
                        value={t.name}
                        onChange={(e) => {
                          const next = [...tiers];
                          next[idx] = { ...t, name: e.target.value };
                          setTiers(next);
                        }}
                        className="h-8 max-w-[60%] font-display font-semibold"
                      />
                      <span className="font-display font-bold">
                        {formatINR(t.price)}
                      </span>
                      <button
                        onClick={() => removeTier(idx)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <Input
                      type="number"
                      value={t.price}
                      onChange={(e) => {
                        const next = [...tiers];
                        next[idx] = { ...t, price: Number(e.target.value) };
                        setTiers(next);
                      }}
                      className="mt-3"
                    />
                  </div>
                ))}
              </div>
              <Button
                onClick={savePricing}
                variant="secondary"
                className="mt-5 w-full rounded-full"
              >
                Update pricing
              </Button>
            </div>
          </div>
        </div>

        {/* Payments Section */}
        <div className="mt-8 rounded-3xl border border-border bg-card p-6">
          <div className="mb-6">
            <h2 className="font-display text-lg font-semibold">
              My Escrow Payments
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Track your earnings, secure holdings, and escrow release status.
            </p>
          </div>

          {!creatorPayments ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Loading payments...
            </div>
          ) : creatorPayments.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-border rounded-2xl bg-secondary/5">
              <CreditCard className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="font-semibold text-sm text-muted-foreground">
                No payment payouts tracked yet
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[280px] mx-auto">
                Once a brand approves your task and pays, the held funds will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-border/40 text-muted-foreground font-semibold">
                    <th className="pb-3 pr-2">Campaign</th>
                    <th className="pb-3 px-2">Brand</th>
                    <th className="pb-3 px-2">Gross Amount</th>
                    <th className="pb-3 px-2">Platform Fee (20%)</th>
                    <th className="pb-3 px-2">Your Earnings (80%)</th>
                    <th className="pb-3 px-2">Payment Status</th>
                    <th className="pb-3 px-2">Hold / Release Status</th>
                    <th className="pb-3 pl-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {creatorPayments.map((pay) => (
                    <tr key={pay._id} className="hover:bg-secondary/10">
                      <td className="py-3 pr-2 font-medium max-w-[150px] truncate">
                        {pay.campaign?.title || "General"}
                      </td>
                      <td className="py-3 px-2 max-w-[120px] truncate">
                        {pay.brand?.fullName || "Brand"}
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">
                        ₹{pay.grossAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">
                        ₹{pay.platformCommissionAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 font-bold text-foreground">
                        ₹{pay.creatorAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-2">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "rounded-full text-[9px] uppercase px-2 py-0.5 font-bold shrink-0",
                            pay.paymentStatus === "completed" && "bg-emerald-500/10 text-emerald-600",
                            pay.paymentStatus === "holding" && "bg-blue-500/10 text-blue-500",
                            pay.paymentStatus === "invoice_generated" && "bg-amber/10 text-amber",
                            pay.paymentStatus === "disputed" && "bg-red-500/10 text-red-500",
                            pay.paymentStatus === "refunded" && "bg-slate-500/10 text-slate-500",
                            pay.paymentStatus === "pending" && "bg-amber/10 text-amber"
                          )}
                        >
                          {pay.paymentStatus.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        {pay.paymentStatus === "invoice_generated" ? (
                          <span className="text-amber text-[10px] font-semibold italic">
                            Awaiting Brand Payment
                          </span>
                        ) : pay.paymentStatus === "holding" && pay.holdingEndsAt ? (
                          <div className="flex flex-col items-start gap-0.5">
                            <span className="inline-flex items-center gap-1 text-primary bg-primary/10 px-2 py-0.5 rounded-md text-[10px] font-bold border border-primary/20 animate-pulse">
                              Payment Secured
                            </span>
                            <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                              Releasing in: <CountdownTimer dueDate={pay.holdingEndsAt} />
                            </span>
                          </div>
                        ) : pay.paymentStatus === "disputed" ? (
                          <span className="inline-flex items-center gap-1 text-red-500 bg-red-500/10 px-2 py-0.5 rounded-md text-[10px] font-bold border border-red-500/20">
                            Payment On Hold (Disputed)
                          </span>
                        ) : pay.paymentStatus === "completed" ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md text-[10px] font-bold border border-emerald-500/20">
                            Released
                          </span>
                        ) : pay.paymentStatus === "refunded" ? (
                          <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-500/10 px-2 py-0.5 rounded-md text-[10px] font-bold border border-slate-500/20">
                            Refunded to Brand
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-[10px]">
                            —
                          </span>
                        )}
                      </td>
                      <td className="py-3 pl-2 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 rounded-full text-[10px] px-2.5"
                          onClick={() => setSelectedAuditLogPayment(pay)}
                        >
                          View Logs
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment Settings Card */}
        <div className="mt-8 rounded-3xl border border-border bg-card p-6">
          <div className="mb-6">
            <h2 className="font-display text-lg font-semibold flex items-center gap-1.5">
              <CreditCard className="h-5 w-5 text-primary" /> Payment Settings
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage your bank details and payout preferences securely. (Only you can edit)
            </p>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (bankNumber !== bankNumberConfirm) {
                toast.error("Bank account numbers do not match");
                return;
              }
              if (bankIfsc.length !== 11) {
                toast.error("IFSC must be exactly 11 characters");
                return;
              }
              if (bankPan.length !== 10) {
                toast.error("PAN number must be exactly 10 characters");
                return;
              }

              setSavingBank(true);
              try {
                await saveBankDetails({
                  fullName: bankFullName,
                  phone: bankPhone,
                  email: bankEmail,
                  bankName,
                  accountHolderName: bankHolderName,
                  accountNumber: bankNumber,
                  confirmAccountNumber: bankNumberConfirm,
                  ifsc: bankIfsc,
                  upiId: bankUpi,
                  panNumber: bankPan,
                });
                toast.success("Payment details saved securely!");
              } catch (err) {
                toast.error((err).message);
              } finally {
                setSavingBank(false);
              }
            }}
            className="space-y-4 max-w-2xl"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="bankFullName" className="text-xs font-semibold">Full Name *</Label>
                <Input
                  id="bankFullName"
                  placeholder="Your legal full name"
                  required
                  value={bankFullName}
                  onChange={(e) => setBankFullName(e.target.value)}
                  className="rounded-xl border-border bg-background text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="bankPhone" className="text-xs font-semibold">Phone *</Label>
                  <Input
                    id="bankPhone"
                    placeholder="10 digit phone number"
                    required
                    value={bankPhone}
                    onChange={(e) => setBankPhone(e.target.value)}
                    className="rounded-xl border-border bg-background text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bankEmail" className="text-xs font-semibold">Email *</Label>
                  <Input
                    id="bankEmail"
                    type="email"
                    placeholder="name@domain.com"
                    required
                    value={bankEmail}
                    onChange={(e) => setBankEmail(e.target.value)}
                    className="rounded-xl border-border bg-background text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="bankName" className="text-xs font-semibold">Bank Name *</Label>
                <Input
                  id="bankName"
                  placeholder="e.g. HDFC Bank"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="rounded-xl border-border bg-background text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bankHolderName" className="text-xs font-semibold">Account Holder Name *</Label>
                <Input
                  id="bankHolderName"
                  placeholder="Name as on bank passbook"
                  required
                  value={bankHolderName}
                  onChange={(e) => setBankHolderName(e.target.value)}
                  className="rounded-xl border-border bg-background text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="bankNumber" className="text-xs font-semibold">Account Number *</Label>
                <Input
                  id="bankNumber"
                  type="password"
                  placeholder="Enter bank account number"
                  required
                  value={bankNumber}
                  onChange={(e) => setBankNumber(e.target.value)}
                  className="rounded-xl border-border bg-background text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bankNumberConfirm" className="text-xs font-semibold">Confirm Account Number *</Label>
                <Input
                  id="bankNumberConfirm"
                  placeholder="Re-enter bank account number"
                  required
                  value={bankNumberConfirm}
                  onChange={(e) => setBankNumberConfirm(e.target.value)}
                  className="rounded-xl border-border bg-background text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="bankIfsc" className="text-xs font-semibold">IFSC Code *</Label>
                <Input
                  id="bankIfsc"
                  placeholder="11 characters IFSC (e.g. HDFC0001234)"
                  required
                  value={bankIfsc}
                  onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                  className="rounded-xl border-border bg-background text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bankPan" className="text-xs font-semibold">PAN Card Number *</Label>
                <Input
                  id="bankPan"
                  placeholder="10 character PAN"
                  required
                  value={bankPan}
                  onChange={(e) => setBankPan(e.target.value.toUpperCase())}
                  className="rounded-xl border-border bg-background text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bankUpi" className="text-xs font-semibold">UPI ID (Optional)</Label>
                <Input
                  id="bankUpi"
                  placeholder="username@bank"
                  value={bankUpi}
                  onChange={(e) => setBankUpi(e.target.value)}
                  className="rounded-xl border-border bg-background text-xs"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={savingBank}
              className="rounded-full px-8 gradient-sunset border-0 text-white shadow-glow text-xs h-9 font-semibold"
            >
              {savingBank ? "Saving Settings..." : "Save Payment Details"}
            </Button>
          </form>
        </div>

        {/* Reviews Section */}
        <div className="mt-8 rounded-3xl border border-border bg-card p-6">
          <div className="mb-6">
            <h2 className="font-display text-lg font-semibold">
              Reviews & Feedback
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage reviews displayed on your public profile page.
            </p>
          </div>

          {!reviews ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Loading reviews...
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-border rounded-2xl">
              <Star className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="font-semibold text-sm text-muted-foreground">
                No reviews received yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Reviews left by brands you collaborate with will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-border rounded-2xl p-4 transition-colors hover:bg-accent/10"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <img src={
                          review.brandAvatar ||
                          `https://avatar.iran.liara.run/public?username=${review.brandName}`
                        }
                        alt=""
                        className="h-10 w-10 rounded-full object-cover border border-border/50 shadow-sm aspect-square"
                       onError={(e) => { e.target.onerror = null; e.target.src = "https://avatar.iran.liara.run/public?username=Fallback"; }} />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-display text-sm font-semibold text-foreground">
                            {review.brandName}
                          </h4>
                          {review.campaignRef && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] rounded-full"
                            >
                              Campaign: {review.campaignRef}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${
                                  star <= review.rating
                                    ? "fill-amber text-amber"
                                    : "text-muted-foreground/30"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pl-0 md:pl-13">
                      <h5 className="text-sm font-semibold text-foreground">
                        {review.title}
                      </h5>
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap leading-relaxed">
                        {review.text}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-center border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto justify-between md:justify-start">
                    <div className="text-right">
                      <span className="block text-xs font-semibold text-foreground">
                        Public Display
                      </span>
                      <span className="block text-[10px] text-muted-foreground">
                        {review.visible
                          ? "Shown on public profile"
                          : "Hidden from public"}
                      </span>
                    </div>
                    <Switch
                      checked={review.visible}
                      onCheckedChange={() => handleToggleVisibility(review._id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
          ) : (
            <SubscriptionTab role="creator" profile={profile} />
          )}
        </div>
      </div>
    </div>

      {/* Submit Task Dialog */}
      <Dialog
        open={!!submitTargetTask}
        onOpenChange={(open) => !open && setSubmitTargetTask(null)}
      >
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              Submit Task Deliverables
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Provide your submission link and optional notes for the brand.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!submissionLink.trim()) {
                toast.error("Please provide a submission link");
                return;
              }
              setSubmittingTask(true);
              try {
                await submitTask({
                  taskId: submitTargetTask._id,
                  submissionLink: submissionLink.trim(),
                  notes: submissionNotes.trim(),
                  attachmentLink: submissionAttachment.trim(),
                });
                toast.success("Task submitted successfully! Brand notified.");
                setSubmitTargetTask(null);
              } catch (err) {
                toast.error((err).message);
              } finally {
                setSubmittingTask(false);
              }
            }}
            className="space-y-4 py-2"
          >
            <div className="space-y-1">
              <Label htmlFor="sub-link" className="text-xs font-semibold">
                Submission Link *
              </Label>
              <Input
                id="sub-link"
                placeholder="https://instagram.com/... or Google Drive URL"
                required
                value={submissionLink}
                onChange={(e) => setSubmissionLink(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sub-notes" className="text-xs font-semibold">
                Submission Notes (Optional)
              </Label>
              <Textarea
                id="sub-notes"
                placeholder="Add any extra notes or explanations..."
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sub-attachment" className="text-xs font-semibold">
                Optional Attachment Link
              </Label>
              <Input
                id="sub-attachment"
                placeholder="Additional assets link (e.g. Dropbox, Figma)"
                value={submissionAttachment}
                onChange={(e) => setSubmissionAttachment(e.target.value)}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setSubmitTargetTask(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submittingTask}
                className="rounded-full gradient-sunset border-0 text-white shadow-glow"
              >
                {submittingTask ? "Submitting..." : "Submit Deliverable"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Audit Logs Timeline Modal */}
      <Dialog
        open={!!selectedAuditLogPayment}
        onOpenChange={(open) => !open && setSelectedAuditLogPayment(null)}
      >
        <DialogContent className="sm:max-w-md rounded-3xl border border-border bg-card p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold">
              Escrow Payout Timeline
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Review transaction audit log trail events.
            </DialogDescription>
          </DialogHeader>

          {selectedAuditLogPayment && (
            <div className="space-y-4 mt-3">
              <div className="text-xs space-y-1 bg-secondary/10 border border-border/40 rounded-xl p-3">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase">Payment ID</p>
                <p className="font-mono">{selectedAuditLogPayment._id}</p>
                {selectedAuditLogPayment.gatewayOrderId && (
                  <>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase mt-1">Razorpay Order ID</p>
                    <p className="font-mono">{selectedAuditLogPayment.gatewayOrderId}</p>
                  </>
                )}
                {selectedAuditLogPayment.gatewayPaymentId && (
                  <>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase mt-1">Razorpay Payment ID</p>
                    <p className="font-mono">{selectedAuditLogPayment.gatewayPaymentId}</p>
                  </>
                )}
              </div>

              <div className="relative border-l-2 border-border ml-2 pl-4 space-y-4 py-2">
                {!selectedAuditLogPayment.auditLogs || selectedAuditLogPayment.auditLogs.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No events logged yet.</p>
                ) : (
                  [...selectedAuditLogPayment.auditLogs]
                    .sort((a, b) => a.createdAt - b.createdAt)
                    .map((log, idx) => (
                      <div key={log._id || idx} className="relative">
                        <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-primary" />
                        <h4 className="text-xs font-bold text-foreground">
                          {log.action}
                        </h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {log.details}
                        </p>
                        <span className="text-[9px] text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))
                )}
              </div>

              <DialogFooter className="pt-2">
                <Button
                  variant="secondary"
                  className="rounded-full w-full"
                  onClick={() => setSelectedAuditLogPayment(null)}
                >
                  Close Timeline
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Premium Subscription Offer Popup */}
      <Dialog open={showOfferPopup} onOpenChange={setShowOfferPopup}>
        <DialogContent className="sm:max-w-[720px] rounded-3xl border border-border bg-card p-0 overflow-hidden shadow-elevated">
          <div className="flex flex-col">
            {/* Offer Banner */}
            {activeOffer && activeOffer.bannerImageUrl ? (
              <div className="h-32 w-full relative">
                <img
                  src={activeOffer.bannerImageUrl}
                  alt="Offer Banner"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              </div>
            ) : (
              <div className="h-20 w-full bg-gradient-to-r from-primary/20 via-accent/15 to-background flex items-center justify-center relative">
                <Sparkles className="h-7 w-7 text-primary animate-pulse" />
              </div>
            )}

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 text-primary px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider animate-pulse">
                    {activeOffer ? "Limited Time Offer" : "Special Package Plan"}
                  </span>
                  {activeOffer && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-primary" /> Expires: {new Date(activeOffer.expiryDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <DialogTitle className="font-display text-xl font-bold text-foreground">
                  {activeOffer ? activeOffer.name : "Premium Packages"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {activeOffer ? activeOffer.description : "Unlock premium search matches, unlimited campaign listings, and verify your account status today."}
                </DialogDescription>
              </div>

              {/* Subscription cards render */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
                {(packages || []).map((pkg) => {
                  const isActive = currentSub && currentSub.packageId === pkg._id;
                  const isPromoPkg = activeOffer && activeOffer.packageId === pkg._id;
                  const isRecommended = pkg.name === "Pro";

                  let finalPrice = pkg.price;
                  if (isPromoPkg && activeOffer) {
                    if (activeOffer.discountPercentage) {
                      finalPrice = pkg.price * (1 - activeOffer.discountPercentage / 100);
                    } else if (activeOffer.discountAmount) {
                      finalPrice = Math.max(0, pkg.price - activeOffer.discountAmount);
                    }
                  }

                  return (
                    <div
                      key={pkg._id}
                      className={`rounded-2xl border p-4 flex flex-col justify-between relative bg-background/40 backdrop-blur-md transition-all duration-200 ${
                        isRecommended ? "border-primary shadow-elevated bg-secondary/5" : "border-border"
                      }`}
                    >
                      {pkg.badge && (
                        <span className="absolute -top-2 left-4 text-[8px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                          {pkg.badge}
                        </span>
                      )}

                      <div className="space-y-2">
                        <h4 className="font-display text-sm font-bold text-foreground">{pkg.name}</h4>
                        <div className="flex items-baseline gap-1">
                          {isPromoPkg ? (
                            <>
                              <span className="text-xl font-bold text-foreground">₹{finalPrice}</span>
                              <span className="text-[10px] text-muted-foreground line-through">₹{pkg.price}</span>
                            </>
                          ) : (
                            <span className="text-xl font-bold text-foreground">₹{pkg.price}</span>
                          )}
                          <span className="text-[10px] text-muted-foreground">/{pkg.billingPeriod}</span>
                        </div>

                        <ul className="space-y-1 text-[10px] text-muted-foreground">
                          {pkg.features.slice(0, 4).map((f, i) => (
                            <li key={i} className="flex items-center gap-1">
                              <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                              <span className="truncate">{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-4">
                        {isActive ? (
                          <Button size="sm" className="w-full rounded-full text-[10px]" variant="secondary" disabled>
                            Current Plan
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className={`w-full rounded-full text-[10px] font-semibold ${
                              isRecommended ? "gradient-sunset border-0 text-white shadow-glow" : ""
                            }`}
                            variant={isRecommended ? "default" : "outline"}
                            onClick={() => {
                              handleUpgradeFromPopup(pkg._id, isPromoPkg ? activeOffer?._id : undefined);
                            }}
                            disabled={upgradingId !== null}
                          >
                            {upgradingId === pkg._id ? "Processing..." : `Buy ${pkg.name}`}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs"
                  onClick={() => setShowOfferPopup(false)}
                >
                  Maybe Later
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-[10px] text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setShowOfferPopup(false);
                    const dontShowUntilKey = `popup_dont_show_until_${profile?._id || ""}`;
                    localStorage.setItem(
                      dontShowUntilKey,
                      (Date.now() + 7 * 24 * 60 * 60 * 1000).toString()
                    );
                    toast.success("We will not show this offer again for 7 days.");
                  }}
                >
                  Dismiss for 7 Days
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


export default DashboardInfluencer;