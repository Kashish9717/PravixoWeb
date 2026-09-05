import { useState, useEffect, useRef, useCallback } from "react";
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
} from "lucide-react";
import api from "@/lib/axios";

function getEventIcon(type) {
  switch (type) {
    case "signup": return UserPlus;
    case "collaboration": return Handshake;
    case "payment": return CreditCard;
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
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`absolute top-full mt-2 z-50 w-96 rounded-2xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden ${panelAlign}`}
          style={{ maxHeight: "520px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Activity Feed</span>
              {unread > 0 && (
                <span className="flex h-4 px-1.5 items-center justify-center rounded-full bg-primary/10 text-primary text-[9px] font-bold">
                  {unread} unread
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchActivity}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Refresh
              </button>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Bulk actions */}
          {visibleEvents.length > 0 && (
            <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-secondary/30 shrink-0">
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Check className="h-3 w-3" />
                Mark all read
              </button>
              <span className="text-muted-foreground/40">·</span>
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1 text-xs text-red-500 hover:underline"
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
          <div className="overflow-y-auto flex-1">
            {loading && visibleEvents.length === 0 ? (
              <div className="flex flex-col gap-3 p-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-secondary animate-pulse shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-32 rounded bg-secondary animate-pulse" />
                      <div className="h-2.5 w-48 rounded bg-secondary animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : visibleEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No notifications</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Events appear here as users interact on the platform
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {visibleEvents.map((event) => {
                  const Icon = getEventIcon(event.type);
                  const colorClass = getEventColor(event.type);
                  const isUnread = !readIds.has(event.id);
                  return (
                    <div
                      key={event.id}
                      className={`group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-secondary/40 ${
                        isUnread ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${colorClass}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold truncate ${isUnread ? "text-foreground" : "text-muted-foreground"}`}>
                              {event.title}
                              {isUnread && (
                                <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle" />
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {event.body}
                            </p>
                            <p className="text-[10px] text-muted-foreground/50 mt-1">
                              {timeAgo(event.timestamp)}
                            </p>
                          </div>
                          {/* Per-item actions — show on hover */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            {isUnread && (
                              <button
                                onClick={(e) => handleMarkRead(event.id, e)}
                                title="Mark as read"
                                className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                              >
                                <Check className="h-3 w-3" />
                              </button>
                            )}
                            <button
                              onClick={(e) => handleDelete(event.id, e)}
                              title="Delete"
                              className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-4 py-2 text-center shrink-0">
            <p className="text-[10px] text-muted-foreground">
              Auto-refreshes every 30s
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
