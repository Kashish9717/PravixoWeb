import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  MessageSquare,
  Search,
  Archive,
  ArchiveRestore,
  Send,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth/AuthProvider";
import api from "@/lib/api";

const resolveImageUrl = (url) => {
  if (!url || url === "undefined" || url === "null") return null;
  if (url.startsWith("http")) return url;
  let apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  if (apiUrl.endsWith("/api")) apiUrl = apiUrl.slice(0, -4);
  return `${apiUrl}${url}`;
};

export default function Messages() {
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();

  const queryConversationId = searchParams.get("conversationId");

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);

  const [activeConversation, setActiveConversation] = useState(null);

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    document.title = "Messages — Pravixo";
  }, []);

  /*
   * ----------------------------------------------------
   * GET CONVERSATIONS
   * ----------------------------------------------------
   */
  const fetchConversations = async () => {
    if (!profile?._id || !profile?.role) return;

    try {
      setLoading(true);

      const response = await api(
        `/api/conversations?profileId=${profile._id}&role=${profile.role}`,
        {
          method: "GET",
        }
      );

      const data =
        response?.data?.data ||
        response?.data ||
        [];

      setConversations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch conversations error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load conversations."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchConversations();
    }
  }, [profile]);

  /*
   * ----------------------------------------------------
   * OPEN CONVERSATION
   * ----------------------------------------------------
   */
  const openConversation = async (conversation) => {
    if (!conversation?._id) return;

    setActiveConversation(conversation);
    setMessages([]);

    await fetchMessages(conversation._id);

    await markConversationAsRead(conversation._id);

    // Update unread count locally
    setConversations((prev) =>
      prev.map((item) =>
        item._id === conversation._id
          ? {
              ...item,
              unreadCount: 0,
            }
          : item
      )
    );
  };

  /*
   * ----------------------------------------------------
   * OPEN CONVERSATION FROM URL
   * ----------------------------------------------------
   */
  useEffect(() => {
    if (!queryConversationId || !conversations.length) return;

    const conversation = conversations.find(
      (item) => item._id === queryConversationId
    );

    if (conversation) {
      openConversation(conversation);
    }
  }, [queryConversationId, conversations]);

  /*
   * ----------------------------------------------------
   * GET MESSAGES
   * ----------------------------------------------------
   */
  const fetchMessages = async (conversationId) => {
    try {
      setMessagesLoading(true);

      const response = await api(
        `/api/messages/${conversationId}`,
        {
          method: "GET",
        }
      );

      const data =
        response?.data?.data ||
        response?.data ||
        [];

      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch messages error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load messages."
      );
    } finally {
      setMessagesLoading(false);
    }
  };

  /*
   * ----------------------------------------------------
   * MARK AS READ
   * ----------------------------------------------------
   */
  const markConversationAsRead = async (conversationId) => {
    if (!profile?._id) return;

    try {
      await api(
        `/api/conversations/${conversationId}/read`,
        {
          method: "PATCH",
          data: {
            profileId: profile._id,
          },
        }
      );
    } catch (error) {
      console.error("Mark as read error:", error);
    }
  };

  /*
   * ----------------------------------------------------
   * SEND MESSAGE
   * ----------------------------------------------------
   */
  const sendMessage = async (e) => {
    e.preventDefault();

    const text = message.trim();

    if (!text || sending || !activeConversation || !profile?._id) {
      return;
    }

    try {
      setSending(true);

      const response = await api("/api/messages", {
        method: "POST",
        data: {
          conversationId: activeConversation._id,
          senderId: profile._id,
          text,
        },
      });

      const newMessage =
        response?.data?.data ||
        response?.data;

      if (newMessage) {
        setMessages((prev) => [
          ...prev,
          newMessage,
        ]);
      }

      setMessage("");

      // Refresh conversation list so lastMessage updates
      await fetchConversations();
    } catch (error) {
      console.error("Send message error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to send message."
      );
    } finally {
      setSending(false);
    }
  };

  /*
   * ----------------------------------------------------
   * ARCHIVE / UNARCHIVE
   * ----------------------------------------------------
   */
  const toggleArchive = async (conversation) => {
    if (!conversation?._id) return;

    try {
      const response = await api(
        `/api/conversations/${conversation._id}/archive`,
        {
          method: "PATCH",
        }
      );

      const updatedConversation =
        response?.data?.data ||
        response?.data;

      setConversations((prev) =>
        prev.map((item) =>
          item._id === conversation._id
            ? {
                ...item,
                archived:
                  updatedConversation?.archived ??
                  !item.archived,
              }
            : item
        )
      );

      // If currently open conversation is archived
      if (
        activeConversation?._id === conversation._id
      ) {
        setActiveConversation((prev) =>
          prev
            ? {
                ...prev,
                archived:
                  updatedConversation?.archived ??
                  !prev.archived,
              }
            : null
        );
      }

      toast.success(
        conversation.archived
          ? "Conversation unarchived"
          : "Conversation archived"
      );
    } catch (error) {
      console.error("Archive error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update conversation."
      );
    }
  };

  /*
   * ----------------------------------------------------
   * FILTER CONVERSATIONS
   * ----------------------------------------------------
   */
  const filteredConversations = conversations.filter(
    (conversation) => {
      const name =
        conversation?.otherProfile?.fullName || "";

      const matchesSearch = name
        .toLowerCase()
        .includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (activeFilter === "all") {
        return !conversation.archived;
      }

      if (activeFilter === "unread") {
        return (
          !conversation.archived &&
          conversation.unreadCount > 0
        );
      }

      if (activeFilter === "archived") {
        return conversation.archived;
      }

      return true;
    }
  );

  /*
   * ----------------------------------------------------
   * OTHER PROFILE
   * ----------------------------------------------------
   */
  const otherProfile =
    activeConversation?.otherProfile;

  /*
   * ----------------------------------------------------
   * NOT LOGGED IN
   * ----------------------------------------------------
   */
  if (!profile) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-muted-foreground">
          Please log in to view messages.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

      {/* PAGE HEADER */}
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold">
          Messages
        </h1>

        <p className="text-sm text-muted-foreground">
          Manage your collaborations and inquiries.
        </p>
      </div>

      {/* MAIN CHAT CONTAINER */}
      <div className="grid h-[600px] gap-6 lg:h-[700px] lg:grid-cols-[350px_1fr]">

        {/* ==================================================
            LEFT SIDEBAR
        ================================================== */}
        <div
          className={`flex flex-col overflow-hidden rounded-3xl border border-border bg-card ${
            activeConversation
              ? "hidden lg:flex"
              : "flex"
          }`}
        >

          {/* SEARCH + FILTER */}
          <div className="space-y-4 border-b border-border p-4">

            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />

              <input
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full rounded-full border-0 bg-secondary/50 py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* FILTERS */}
            <div className="flex gap-2">

              <button
                type="button"
                onClick={() =>
                  setActiveFilter("all")
                }
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                  activeFilter === "all"
                    ? "gradient-sunset text-white"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                All
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveFilter("unread")
                }
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                  activeFilter === "unread"
                    ? "gradient-sunset text-white"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                Unread
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveFilter("archived")
                }
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                  activeFilter === "archived"
                    ? "gradient-sunset text-white"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                Archived
              </button>

            </div>
          </div>

          {/* CONVERSATIONS */}
          <div className="flex-1 overflow-y-auto">

            {loading ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Loading conversations...
                </p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

                <p className="text-sm text-muted-foreground">
                  No conversations found.
                </p>
              </div>
            ) : (
              filteredConversations.map(
                (conversation) => {
                  const other =
                    conversation?.otherProfile;

                  return (
                    <div
                      key={conversation._id}
                      onClick={() =>
                        openConversation(conversation)
                      }
                      className={`flex cursor-pointer items-center gap-3 border-b border-border/50 p-4 transition hover:bg-secondary/50 ${
                        activeConversation?._id ===
                        conversation._id
                          ? "border-l-4 border-l-primary bg-accent/40"
                          : ""
                      }`}
                    >

                      {/* AVATAR */}
                      <div className="relative shrink-0">

                        <img src={
                            resolveImageUrl(other?.avatarUrl) ||
                            `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(
                              other?.fullName ||
                                "User"
                            )}`
                          }
                          alt={
                            other?.fullName ||
                            "User"
                          }
                          className="h-12 w-12 rounded-2xl object-cover shadow-soft"
                         onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?background=random&name=Fallback"; }} />

                        {conversation.unreadCount >
                          0 && (
                          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white ring-2 ring-card">
                            {conversation.unreadCount}
                          </span>
                        )}

                      </div>

                      {/* INFO */}
                      <div className="min-w-0 flex-1">

                        <div className="flex items-center justify-between gap-2">

                          <h4 className="truncate font-display font-semibold">
                            {other?.fullName ||
                              "Unknown User"}
                          </h4>

                          <span className="shrink-0 text-[10px] text-muted-foreground">
                            {conversation.lastMessage
                              ?.createdAt
                              ? new Date(
                                  conversation.lastMessage.createdAt
                                ).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )
                              : ""}
                          </span>

                        </div>

                        <div className="mt-1 flex items-center justify-between">

                          <p className="flex-1 truncate pr-2 text-xs text-muted-foreground">
                            {conversation
                              .lastMessage
                              ?.text ||
                              "No messages"}
                          </p>

                          {/* ARCHIVE */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleArchive(
                                conversation
                              );
                            }}
                            className="rounded-md p-1 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                            title={
                              conversation.archived
                                ? "Unarchive"
                                : "Archive"
                            }
                          >
                            {conversation.archived ? (
                              <ArchiveRestore className="h-3.5 w-3.5" />
                            ) : (
                              <Archive className="h-3.5 w-3.5" />
                            )}
                          </button>

                        </div>
                      </div>
                    </div>
                  );
                }
              )
            )}

          </div>
        </div>

        {/* ==================================================
            RIGHT CHAT AREA
        ================================================== */}
        <div
          className={`flex flex-col overflow-hidden rounded-3xl border border-border bg-card ${
            activeConversation
              ? "flex"
              : "hidden lg:flex"
          }`}
        >

          {activeConversation ? (
            <>

              {/* CHAT HEADER */}
              <div className="flex items-center gap-3 border-b border-border p-4">

                {/* MOBILE BACK */}
                <button
                  type="button"
                  onClick={() =>
                    setActiveConversation(null)
                  }
                  className="rounded-xl p-2 hover:bg-secondary lg:hidden"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                {/* AVATAR */}
                <img src={
                    resolveImageUrl(otherProfile?.avatarUrl) ||
                    `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(
                      otherProfile?.fullName ||
                        "User"
                    )}`
                  }
                  alt={
                    otherProfile?.fullName ||
                    "User"
                  }
                  className="h-11 w-11 rounded-2xl object-cover"
                 onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?background=random&name=Fallback"; }} />

                {/* NAME */}
                <div className="min-w-0 flex-1">

                  <h2 className="truncate font-display font-semibold">
                    {otherProfile?.fullName ||
                      "Unknown User"}
                  </h2>

                  <p className="text-xs text-muted-foreground">
                    {activeConversation.status ===
                    "active"
                      ? "Active conversation"
                      : activeConversation.status}
                  </p>

                </div>

                {/* ARCHIVE */}
                <button
                  type="button"
                  onClick={() =>
                    toggleArchive(
                      activeConversation
                    )
                  }
                  className="rounded-xl p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  title={
                    activeConversation.archived
                      ? "Unarchive"
                      : "Archive"
                  }
                >
                  {activeConversation.archived ? (
                    <ArchiveRestore className="h-5 w-5" />
                  ) : (
                    <Archive className="h-5 w-5" />
                  )}
                </button>

              </div>

              {/* MESSAGES */}
              <div className="flex-1 space-y-3 overflow-y-auto p-5">

                {messagesLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                      Loading messages...
                    </p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <MessageSquare className="mb-3 h-10 w-10 text-muted-foreground" />

                    <p className="text-sm text-muted-foreground">
                      No messages yet.
                    </p>
                  </div>
                ) : (
                  messages.map((item) => {

                    const isMine =
                      item.senderId?.toString() ===
                      profile._id?.toString();

                    return (
                      <div
                        key={item._id}
                        className={`flex ${
                          isMine
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >

                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                            isMine
                              ? "rounded-br-md gradient-sunset text-white"
                              : "rounded-bl-md bg-muted text-foreground"
                          }`}
                        >
                          {(() => {
                            const isDeletedForAll = item.deletedByAdmin;
                            const isDeletedForMe = 
                              (profile.role === "creator" && item.deletedForCreator) ||
                              (profile.role === "brand" && item.deletedForBrand);
                            
                            if (isDeletedForAll || isDeletedForMe) {
                              return (
                                <p className="italic opacity-80 text-sm">
                                  This message has been deleted by Admin
                                </p>
                              );
                            }
                            
                            return <p>{item.text}</p>;
                          })()}

                          <p
                            className={`mt-1 text-[10px] ${
                              isMine
                                ? "text-white/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {item.createdAt
                              ? new Date(
                                  item.createdAt
                                ).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )
                              : ""}
                          </p>
                        </div>

                      </div>
                    );
                  })
                )}

              </div>

              {/* MESSAGE INPUT */}
              <form
                onSubmit={sendMessage}
                className="border-t border-border p-3"
              >
                <div className="flex items-center gap-2 rounded-2xl border border-input bg-background p-1.5">

                  <input
                    value={message}
                    onChange={(e) =>
                      setMessage(e.target.value)
                    }
                    placeholder="Type a message..."
                    disabled={sending}
                    className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
                  />

                  <button
                    type="submit"
                    disabled={
                      !message.trim() ||
                      sending
                    }
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-sunset text-white disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>

                </div>
              </form>

            </>
          ) : (
            /* EMPTY STATE */
            <div className="flex h-full flex-col items-center justify-center p-12 text-center">

              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-secondary">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>

              <h2 className="font-display text-xl font-semibold">
                Your Inbox
              </h2>

              <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                Select a conversation from the
                left to start chatting with your
                partners.
              </p>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}