import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  Trash2,
  RefreshCw,
  Megaphone,
  CreditCard,
  FileCheck,
  UserPlus,
  Handshake,
  UserX,
  UserMinus,
  CheckCircle,
  Wallet,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";

function getEventIcon(type) {
  switch (type) {
    case "signup":
      return UserPlus;
    case "collaboration":
      return Handshake;
    case "payment":
      return CreditCard;
    case "withdrawal":
      return Wallet;
    case "agreement":
      return FileCheck;
    case "campaign":
      return Megaphone;
    case "deleted":
      return UserX;
    case "suspended":
      return UserMinus;
    default:
      return CheckCircle;
  }
}

function getEventColor(type) {
  switch (type) {
    case "signup":
      return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    case "collaboration":
      return "text-violet-500 bg-violet-500/10 border-violet-500/20";
    case "payment":
      return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    case "deleted":
      return "text-red-500 bg-red-500/10 border-red-500/20";
    case "suspended":
      return "text-orange-500 bg-orange-500/10 border-orange-500/20";
    default:
      return "text-primary bg-primary/10 border-primary/20";
  }
}

function timeAgo(timestamp) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${days}d ago`;
}

export function NotificationsPage() {
  const navigate = useNavigate();

  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const [readIds, setReadIds] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("admin_notif_read") || "[]"));
    } catch {
      return new Set();
    }
  });

  const [deletedIds, setDeletedIds] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("admin_notif_deleted") || "[]"));
    } catch {
      return new Set();
    }
  });

  const saveReadIds = (ids) => {
    setReadIds(ids);
    localStorage.setItem("admin_notif_read", JSON.stringify([...ids]));
  };

  const saveDeletedIds = (ids) => {
    setDeletedIds(ids);
    localStorage.setItem("admin_notif_deleted", JSON.stringify([...ids]));
  };

  const fetchActivity = useCallback(async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const res = await api.get("/admin/activity?limit=100");
      if (res.data.success) {
        setAllEvents(res.data.data || []);
        if (isManual) toast.success("Activity feed refreshed");
      }
    } catch (err) {
      console.error(err);
      if (isManual) toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  // Non-deleted notifications
  const visibleEvents = useMemo(() => {
    return allEvents.filter((e) => {
      const id = e._id || e.id;
      return !deletedIds.has(id);
    });
  }, [allEvents, deletedIds]);

  const unreadCount = useMemo(() => {
    return visibleEvents.filter((e) => {
      const id = e._id || e.id;
      return !readIds.has(id);
    }).length;
  }, [visibleEvents, readIds]);

  const handleMarkRead = (id, e) => {
    if (e) e.stopPropagation();
    const next = new Set(readIds);
    next.add(id);
    saveReadIds(next);
    toast.success("Marked as read");
  };

  const handleDelete = (id, e) => {
    if (e) e.stopPropagation();
    const next = new Set(deletedIds);
    next.add(id);
    saveDeletedIds(next);
    toast.success("Notification dismissed");
  };

  const handleMarkAllRead = () => {
    const ids = visibleEvents.map((e) => e._id || e.id);
    const next = new Set([...readIds, ...ids]);
    saveReadIds(next);
    toast.success("All notifications marked as read");
  };

  const handleClearAll = () => {
    const ids = visibleEvents.map((e) => e._id || e.id);
    const next = new Set([...deletedIds, ...ids]);
    saveDeletedIds(next);
    toast.success("All notifications cleared");
  };

  const handleEventClick = (event) => {
    const id = event._id || event.id;
    if (!readIds.has(id)) {
      handleMarkRead(id);
    }

    switch (event.type) {
      case "signup":
      case "deleted":
      case "suspended":
        navigate("/users");
        break;
      case "collaboration":
      case "agreement":
        navigate("/conversations");
        break;
      case "payment":
      case "withdrawal":
        navigate("/payments");
        break;
      case "campaign":
        navigate("/campaigns");
        break;
      default:
        break;
    }
  };

  // Filtered
  const filteredEvents = useMemo(() => {
    return visibleEvents.filter((item) => {
      const id = item._id || item.id;
      const isUnread = !readIds.has(id);

      if (activeTab === "unread" && !isUnread) return false;
      if (activeTab === "read" && isUnread) return false;
      if (
        activeTab !== "all" &&
        activeTab !== "unread" &&
        activeTab !== "read" &&
        item.type !== activeTab
      ) {
        return false;
      }

      if (search.trim()) {
        const query = search.toLowerCase();
        const title = (item.title || "").toLowerCase();
        const body = (item.body || item.text || "").toLowerCase();
        const type = (item.type || "").toLowerCase();
        return title.includes(query) || body.includes(query) || type.includes(query);
      }

      return true;
    });
  }, [visibleEvents, readIds, activeTab, search]);

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl flex items-center gap-2.5">
              <Bell className="h-7 w-7 text-primary" />
              Notifications & Activity
            </h1>
            {unreadCount > 0 && (
              <span className="flex h-5 px-2 items-center justify-center rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-bold">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            View, filter, and track all real-time platform actions, signups, transactions, and alerts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchActivity(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-2 rounded-xl text-xs sm:text-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-primary" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>

          {visibleEvents.length > 0 && (
            <>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1.5 rounded-xl text-xs sm:text-sm text-primary hover:text-primary hover:bg-primary/10"
                >
                  <Check className="h-3.5 w-3.5" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="flex items-center gap-1.5 rounded-xl text-xs sm:text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear all
              </Button>
            </>
          )}
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex max-w-full overflow-x-auto gap-1 rounded-full border border-border/50 bg-secondary/35 p-1 no-scrollbar">
          {[
            { id: "all", label: `All (${visibleEvents.length})` },
            { id: "unread", label: `Unread (${unreadCount})` },
            { id: "signup", label: "Signups" },
            { id: "collaboration", label: "Collabs" },
            { id: "payment", label: "Payments" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-3.5 py-1 text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-xs"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-border bg-card/60 pl-9 pr-4 py-1.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      {/* CONTENT LIST */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 animate-pulse"
            >
              <div className="h-10 w-10 rounded-xl bg-secondary shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded bg-secondary" />
                <div className="h-3 w-1/2 rounded bg-secondary" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/40 py-16 text-center px-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
            <Bell className="h-7 w-7 text-primary/80" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            {search ? "No matching notifications" : "All caught up!"}
          </h3>
          <p className="mt-1 max-w-sm text-xs sm:text-sm text-muted-foreground">
            {search
              ? `No notifications found matching "${search}". Try adjusting your search query.`
              : "No activity notifications to display at the moment."}
          </p>
          {search && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearch("")}
              className="mt-4 rounded-xl text-xs"
            >
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((event) => {
            const id = event._id || event.id;
            const Icon = getEventIcon(event.type);
            const colorClass = getEventColor(event.type);
            const isUnread = !readIds.has(id);

            return (
              <div
                key={id}
                onClick={() => handleEventClick(event)}
                className={`group relative flex items-start justify-between gap-3 sm:gap-4 rounded-2xl border p-3.5 sm:p-4 transition-all duration-200 cursor-pointer ${
                  isUnread
                    ? "border-primary/30 bg-primary/5 hover:bg-primary/10 shadow-xs"
                    : "border-border/60 bg-card/60 hover:bg-secondary/40 hover:border-border"
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-transform group-hover:scale-105 ${colorClass}`}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-xs sm:text-sm font-semibold leading-snug break-words ${
                          isUnread ? "text-foreground" : "text-foreground/80"
                        }`}
                      >
                        {event.title}
                      </p>
                      {isUnread && (
                        <span className="inline-block h-2 w-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground mt-0.5 break-words line-clamp-2 sm:line-clamp-none">
                      {event.body || event.text}
                    </p>

                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] sm:text-xs text-muted-foreground/70">
                      <span>{timeAgo(event.createdAt || event.timestamp || Date.now())}</span>
                      <span>•</span>
                      <span className="capitalize font-medium">
                        {(event.type || "system").replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                  {isUnread && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleMarkRead(id, e)}
                      title="Mark as read"
                      className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDelete(id, e)}
                    title="Dismiss notification"
                    className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default NotificationsPage;
