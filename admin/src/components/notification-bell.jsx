import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  UserPlus,
  Handshake,
  CreditCard,
  UserX,
  UserMinus,
  CheckCircle,
  X,
  Trash2,
  Check,
  Megaphone,
  FileCheck,
  Wallet,
} from "lucide-react";
import api from "@/lib/axios";

function getEventIcon(type) {
  switch (type) {
    case "signup": return UserPlus;
    case "collaboration": return Handshake;
    case "payment": return CreditCard;
    case "withdrawal": return Wallet;
    case "agreement": return FileCheck;
    case "campaign": return Megaphone;
    case "deleted": return UserX;
    case "suspended": return UserMinus;
    default: return CheckCircle;
  }
}

function getEventColor(type) {
  switch (type) {
    case "signup": return "text-emerald-500 bg-emerald-500/10";
    case "collaboration": return "text-violet-500 bg-violet-500/10";
    case "payment": return "text-amber-500 bg-amber-500/10";
    case "deleted": return "text-red-500 bg-red-500/10";
    case "suspended": return "text-orange-500 bg-orange-500/10";
    default: return "text-primary bg-primary/10";
  }
}

function timeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${days}d ago`;
}

export function NotificationBell({ align = "right" }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [allEvents, setAllEvents] = useState([]);
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
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  const saveReadIds = (ids) => {
    setReadIds(ids);
    localStorage.setItem("admin_notif_read", JSON.stringify([...ids]));
  };

  const saveDeletedIds = (ids) => {
    setDeletedIds(ids);
    localStorage.setItem("admin_notif_deleted", JSON.stringify([...ids]));
  };

  const fetchActivity = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/activity?limit=50");
      if (res.data.success) {
        setAllEvents(res.data.data || []);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivity();
    const interval = setInterval(fetchActivity, 30000);
    return () => clearInterval(interval);
  }, [fetchActivity]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Visible events = not deleted
  const visibleEvents = allEvents.filter((e) => !deletedIds.has(e.id));
  const unread = visibleEvents.filter((e) => !readIds.has(e.id)).length;

  const handleMarkRead = (id, e) => {
    e.stopPropagation();
    const next = new Set(readIds);
    next.add(id);
    saveReadIds(next);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    const next = new Set(deletedIds);
    next.add(id);
    saveDeletedIds(next);
  };

  const handleMarkAllRead = () => {
    const next = new Set([...readIds, ...visibleEvents.map((e) => e.id)]);
    saveReadIds(next);
  };

  const handleClearAll = () => {
    const next = new Set([...deletedIds, ...visibleEvents.map((e) => e.id)]);
    saveDeletedIds(next);
  };

  const panelAlign = align === "left"
    ? "right-auto left-0"
    : "left-auto right-0";

  return (
    <div className="relative inline-block" ref={panelRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-card text-muted-foreground transition-all hover:bg-secondary hover:text-foreground shadow-xs"
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white shadow-xs">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-x-3 top-16 sm:absolute sm:top-full sm:right-0 sm:left-auto sm:inset-x-auto sm:mt-2.5 z-50 sm:w-[400px] max-w-[calc(100vw-24px)] rounded-3xl border border-border bg-card/95 backdrop-blur-md shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          style={{ maxHeight: "calc(100vh - 90px)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-border bg-secondary/30 shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Bell className="h-3.5 w-3.5" />
              </div>
              <span className="font-display font-bold text-sm text-foreground">Activity Feed</span>
              {unread > 0 && (
                <span className="flex h-5 px-2 items-center justify-center rounded-full bg-primary/15 text-primary text-[10px] font-bold">
                  {unread} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchActivity}
                disabled={loading}
                className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
              >
                Refresh
              </button>
              <button
                onClick={() => setOpen(false)}
                className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Bulk actions */}
          {visibleEvents.length > 0 && (
            <div className="flex items-center gap-3 px-4 py-2 border-b border-border/60 bg-muted/20 shrink-0 text-xs">
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 font-medium text-primary hover:underline"
              >
                <Check className="h-3 w-3" />
                Mark all read
              </button>
              <span className="text-muted-foreground/30">•</span>
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1 font-medium text-destructive hover:underline"
              >
                <Trash2 className="h-3 w-3" />
                Clear all
              </button>
              <span className="ml-auto text-[10px] text-muted-foreground">
                {visibleEvents.length} events
              </span>
            </div>
          )}

          {/* Events list */}
          <div className="overflow-y-auto flex-1 divide-y divide-border/60">
            {loading && visibleEvents.length === 0 ? (
              <div className="flex flex-col gap-3 p-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-xl bg-secondary animate-pulse shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 w-32 rounded bg-secondary animate-pulse" />
                      <div className="h-2.5 w-48 rounded bg-secondary animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : visibleEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-2.5">
                  <Bell className="h-6 w-6 text-primary/70" />
                </div>
                <p className="text-sm font-semibold text-foreground">No notifications</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Events will appear here as activity occurs on the platform.
                </p>
              </div>
            ) : (
              visibleEvents.map((event) => {
                const id = event._id || event.id;
                const Icon = getEventIcon(event.type);
                const colorClass = getEventColor(event.type);
                const isUnread = !readIds.has(id);

                const handleClickEvent = () => {
                  if (isUnread) {
                    handleMarkRead(id, { stopPropagation: () => {} });
                  }
                  setOpen(false);

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

                return (
                  <div
                    key={id}
                    onClick={handleClickEvent}
                    className={`group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-secondary/40 cursor-pointer ${
                      isUnread ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold truncate ${isUnread ? "text-foreground font-bold" : "text-muted-foreground"}`}>
                            {event.title}
                            {isUnread && (
                              <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle" />
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                            {event.body || event.text}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">
                            {timeAgo(event.createdAt || event.timestamp || Date.now())}
                          </p>
                        </div>

                        {/* Per-item actions */}
                        <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                          {isUnread && (
                            <button
                              onClick={(e) => handleMarkRead(id, e)}
                              title="Mark as read"
                              className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDelete(id, e)}
                            title="Dismiss"
                            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-4 py-2.5 flex items-center justify-between shrink-0 bg-secondary/30">
            <span className="text-[10px] text-muted-foreground">
              Auto-refreshes every 30s
            </span>
            <button
              onClick={() => {
                setOpen(false);
                navigate("/notifications");
              }}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              View all notifications →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
