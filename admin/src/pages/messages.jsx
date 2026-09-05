import { useEffect, useState } from "react";
import { resolveImageUrl } from "@/lib/utils";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, CheckCheck } from "lucide-react";
import api from "@/lib/axios";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

export function MessagesPage() {
  const { id } = useParams();

  useEffect(() => {
    document.title = "Messages —  Pravixo Admin";
  }, []);

  const [data, setData] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleSelection = (msgId) => {
    setSelectedMessages((prev) => {
      const next = new Set(prev);
      if (next.has(msgId)) {
        next.delete(msgId);
      } else {
        next.add(msgId);
      }
      return next;
    });
  };

  const handleBulkDelete = async (type) => {
    if (selectedMessages.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedMessages.size} messages for ${type}?`)) return;

    try {
      setIsDeleting(true);
      await api.post("/admin/messages/bulk-delete", {
        messageIds: Array.from(selectedMessages),
        deleteType: type
      });
      
      // Refresh messages
      const res = await api.get(`/admin/conversations/${id}/messages`);
      if (res.data.success) {
        setData(res.data.data);
      }
      setSelectedMessages(new Set());
    } catch (error) {
      console.error("Bulk delete failed", error);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const res = await api.get(`/admin/conversations/${id}/messages`);
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };
    fetchData();
  }, [id]);

  if (!id) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-muted-foreground">No conversation selected.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/conversations"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          {!data ? (
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <img
                  src={
                    resolveImageUrl(data.creator?.avatarUrl, data.creator?.fullName || "C")
                  }
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.creator?.fullName || "C")}&background=random`;
                  }}
                  alt=""
                  className="h-10 w-10 rounded-full border border-border object-cover"
                />
                <div>
                  <div className="text-sm font-semibold">
                    {data.creator?.fullName || "Unknown Creator"}
                  </div>
                  <Badge
                    variant="secondary"
                    className="rounded-full text-[10px] bg-violet/10 text-violet"
                  >
                    creator
                  </Badge>
                </div>
              </div>
              <span className="text-lg text-muted-foreground">↔</span>
              <div className="flex items-center gap-2">
                <img
                  src={
                    resolveImageUrl(data.brand?.avatarUrl, data.brand?.fullName || "B")
                  }
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.brand?.fullName || "B")}&background=random`;
                  }}
                  alt=""
                  className="h-10 w-10 rounded-full border border-border object-cover"
                />
                <div>
                  <div className="text-sm font-semibold">
                    {data.brand?.fullName || "Unknown Brand"}
                  </div>
                  <Badge
                    variant="secondary"
                    className="rounded-full text-[10px] bg-amber/10 text-amber"
                  >
                    brand
                  </Badge>
                </div>
              </div>
              {data.conversation && (
                <Badge
                  variant="secondary"
                  className={`ml-4 rounded-full text-[10px] capitalize ${
                    data.conversation.status === "active"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : data.conversation.status === "pending"
                        ? "bg-amber/10 text-amber"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {data.conversation.status}
                </Badge>
              )}
            </div>
          )}
        </div>
        <button
          onClick={async () => {
            if (confirm("Are you sure you want to permanently delete this chat?")) {
              try {
                await api.delete(`/admin/conversations/${id}`);
                window.location.href = "/conversations";
              } catch (err) {
                console.error("Failed to delete chat", err);
              }
            }
          }}
          className="rounded-xl bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors"
        >
          Delete Chat
        </button>
      </div>

      {selectedMessages.size > 0 && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-card p-4">
          <div className="text-sm font-medium">
            {selectedMessages.size} messages selected
          </div>
          <div className="flex gap-2">
            <button
              disabled={isDeleting}
              onClick={() => handleBulkDelete("all")}
              className="rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive hover:text-white transition-colors"
            >
              Delete for Everyone
            </button>
            <button
              disabled={isDeleting}
              onClick={() => handleBulkDelete("creator")}
              className="rounded-lg bg-violet/10 px-3 py-1.5 text-xs font-medium text-violet hover:bg-violet hover:text-white transition-colors"
            >
              Delete for Creator
            </button>
            <button
              disabled={isDeleting}
              onClick={() => handleBulkDelete("brand")}
              className="rounded-lg bg-amber/10 px-3 py-1.5 text-xs font-medium text-amber hover:bg-amber hover:text-white transition-colors"
            >
              Delete for Brand
            </button>
            <button
              onClick={() => setSelectedMessages(new Set())}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="mt-6 flex-1 rounded-3xl border border-border bg-card overflow-hidden">
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-1 p-6">
            {!data ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex ${i % 2 === 0 ? "" : "justify-end"}`}
                >
                  <div className="max-w-[70%] space-y-1.5">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-12 w-48 rounded-2xl" />
                  </div>
                </div>
              ))
            ) : data.messages.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                No messages in this conversation
              </div>
            ) : (
              data.messages.map((msg) => {
                const isCreator =
                  data.creator && msg.senderId?._id === data.creator._id;
                const senderName = msg.senderId?.fullName || "Unknown";
                const senderAvatar =
                  resolveImageUrl(msg.senderId?.avatarUrl, senderName);

                return (
                  <div
                    key={msg._id}
                    className={`group flex items-start gap-3 ${isCreator ? "" : "flex-row-reverse"}`}
                  >
                    <div className="mt-2 flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={selectedMessages.has(msg._id)}
                        onChange={() => toggleSelection(msg._id)}
                        className="h-4 w-4 cursor-pointer rounded border-border"
                      />
                    </div>
                    <img
                      src={senderAvatar}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(senderName)}`;
                      }}
                      alt=""
                      className="mt-1 h-7 w-7 shrink-0 rounded-full border border-border object-cover"
                    />
                    <div
                      className={`max-w-[70%] ${isCreator ? "" : "text-right"}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-semibold ${
                            isCreator ? "text-violet" : "text-amber"
                          }`}
                        >
                          {senderName}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {format(new Date(msg.createdAt), "MMM d, HH:mm")}
                        </span>
                      </div>
                      <div
                        className={`inline-block rounded-2xl px-4 py-2.5 text-sm ${
                          isCreator
                            ? "rounded-tl-sm bg-secondary text-foreground"
                            : "rounded-tr-sm gradient-sunset text-white"
                        }`}
                      >
                        {msg.deletedByAdmin ? (
                          <span className="italic opacity-70">This message has been deleted by Admin</span>
                        ) : (
                          msg.text
                        )}
                        {msg.deletedForCreator && !msg.deletedByAdmin && (
                          <div className="mt-1 text-[10px] text-destructive italic opacity-70">
                            (Hidden from Creator)
                          </div>
                        )}
                        {msg.deletedForBrand && !msg.deletedByAdmin && (
                          <div className="mt-1 text-[10px] text-destructive italic opacity-70">
                            (Hidden from Brand)
                          </div>
                        )}
                      </div>
                      <div className="mt-0.5">
                        {msg.read ? (
                          <CheckCheck className="inline h-3 w-3 text-primary" />
                        ) : (
                          <Check className="inline h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
