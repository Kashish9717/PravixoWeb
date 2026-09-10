import { useState, useEffect } from "react";
import { Clock, Tag, ExternalLink, Sparkles, Building2, User, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/lib/api";

function formatCountdown(expiresAt) {
  if (!expiresAt) return { expired: false, text: "Active" };
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return { expired: true, text: "Expired" };

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return { expired: false, text: `${days}d ${remHours}h left` };
  }
  return {
    expired: false,
    text: `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
  };
}

export function CreatorOffersSidebarWidget({ audience = "brand" }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setTick] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchOffers = async () => {
      try {
        const res = await api.get(`/offers/active?audience=${audience}`);
        if (isMounted && res.data?.success) {
          setOffers(res.data.data || []);
        }
      } catch (err) {
        console.error("Failed to load active offers:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOffers();

    // Live countdown update every second
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [audience]);

  const activeOffers = offers.filter(
    (offer) => !offer.expiresAt || new Date(offer.expiresAt).getTime() > Date.now()
  );

  if (loading) {
    return (
      <div className="rounded-3xl border border-border/50 bg-card/60 p-4 backdrop-blur-xs space-y-3">
        <div className="h-5 w-32 bg-secondary animate-pulse rounded-md" />
        <div className="h-16 w-full bg-secondary/50 animate-pulse rounded-xl" />
      </div>
    );
  }

  if (activeOffers.length === 0) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card/80 to-background p-5 shadow-sm backdrop-blur-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-foreground">
              {audience === "brand" ? "Creator Flash Deals" : "Brand Exclusive Offers"}
            </h3>
            <p className="text-[10px] text-muted-foreground">Limited-time verified perks</p>
          </div>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
          Live
        </span>
      </div>

      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
        {activeOffers.map((offer) => {
          const countdown = formatCountdown(offer.expiresAt);
          if (countdown.expired) return null;

          const isCreatorOffer = offer.creatorOrBrandType === "creator";
          const owner = isCreatorOffer ? offer.creatorId : offer.brandId;
          const avatar =
            owner?.avatarUrl ||
            owner?.profilePicture ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${owner?.fullName || "user"}`;

          const targetLink = isCreatorOffer
            ? `/influencer/${owner?._id || owner?.id}`
            : `/browse`;

          return (
            <div
              key={offer._id}
              className="group relative flex flex-col gap-2.5 rounded-2xl border border-border/60 bg-card/90 p-3.5 transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={avatar}
                    alt={owner?.fullName || "User"}
                    className="h-8 w-8 rounded-full object-cover border border-border shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">
                      {owner?.fullName || owner?.handle || (isCreatorOffer ? "Creator" : "Brand")}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {offer.offerTitle}
                    </p>
                  </div>
                </div>

                {offer.discountPercent ? (
                  <div className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-500 border border-emerald-500/20 shrink-0">
                    <Tag className="h-3 w-3" />
                    {offer.discountPercent}% OFF
                  </div>
                ) : offer.monetaryBonus ? (
                  <div className="flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary border border-primary/20 shrink-0">
                    <Gift className="h-3 w-3" />
                    +₹{offer.monetaryBonus}
                  </div>
                ) : null}
              </div>

              <p className="text-xs text-muted-foreground/90 line-clamp-2 font-normal">
                "{offer.conditionText}"
              </p>

              <div className="flex items-center justify-between pt-1.5 border-t border-border/40 text-[11px]">
                <div className="flex items-center gap-1 font-mono font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                  <Clock className="h-3 w-3" />
                  {countdown.text}
                </div>

                <Link
                  to={targetLink}
                  className="flex items-center gap-1 font-semibold text-primary hover:underline"
                >
                  {isCreatorOffer ? "Hire Creator" : "View Details"}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CreatorOffersSidebarWidget;
