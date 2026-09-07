import { useState, useEffect, useRef, useCallback } from "react";
import {
  Bell,
  CheckCircle,
  X,
  Trash2,
  Check,
  Activity
} from "lucide-react";
import api from "@/lib/api";

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

export function NotificationBell({ profileId }) {
  const [open, setOpen] = useState(false);
  const [allEvents, setAllEvents] = useState([]);
  const [deletedIds, setDeletedIds] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(`notif_deleted_${profileId}`) || "[]"));
    } catch {
      return new Set();
    }
  });
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  const saveDeletedIds = (ids) => {
    setDeletedIds(ids);
    localStorage.setItem(`notif_deleted_${profileId}`, JSON.stringify([...ids]));
  };

  const fetchActivity = useCallback(async () => {
    if (!profileId) return;
    try {
      setLoading(true);
      const res = await api.get(`/tasks/notifications/${profileId}`);
      setAllEvents(res.data?.data || res.data || []);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, [profileId]);

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
  const visibleEvents = allEvents.filter((e) => !deletedIds.has(e._id));
  const unread = visibleEvents.filter((e) => !e.read).length;

  const handleMarkRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.patch(`/tasks/notifications/${id}/read`);
      setAllEvents((prev) => prev.map((ev) => (ev._id === id ? { ...ev, read: true } : ev)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    const next = new Set(deletedIds);
    next.add(id);
    saveDeletedIds(next);
  };

  const handleMarkAllRead = async () => {
    const unreadEvents = visibleEvents.filter(e => !e.read);
    for (const ev of unreadEvents) {
      await handleMarkRead(ev._id, null);
    }
  };

  const handleClearAll = () => {
    const next = new Set([...deletedIds, ...visibleEvents.map((e) => e._id)]);
    saveDeletedIds(next);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-secondary"
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
          className="absolute top-full right-0 mt-2 z-50 w-80 sm:w-96 rounded-2xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden"
          style={{ maxHeight: "520px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Notifications</span>
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
                  const isUnread = !event.read;
                  return (
                    <div
                      key={event._id}
                      className={`group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-secondary/40 ${
                        isUnread ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0 text-primary bg-primary/10">
                        <Activity className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold truncate ${isUnread ? "text-foreground" : "text-muted-foreground"}`}>
                              {event.text || "Notification"}
                              {isUnread && (
                                <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle" />
                              )}
                            </p>
                            <p className="text-[10px] text-muted-foreground/50 mt-1">
                              {timeAgo(event.createdAt || event.timestamp || Date.now())}
                            </p>
                          </div>
                          {/* Per-item actions — show on hover */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            {isUnread && (
                              <button
                                onClick={(e) => handleMarkRead(event._id, e)}
                                title="Mark as read"
                                className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                              >
                                <Check className="h-3 w-3" />
                              </button>
                            )}
                            <button
                              onClick={(e) => handleDelete(event._id, e)}
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
        </div>
      )}
    </div>
  );
}
