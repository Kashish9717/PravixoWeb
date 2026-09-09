import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  MessageSquare,
  Search,
  Archive,
  ArchiveRestore,
  Send,
  ArrowLeft,
  Trash2,
  Ban,
  IndianRupee,
  Check,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Info,
  FileText,
  ChevronDown,
  ChevronUp,
  Upload,
  Play,
  Film,
  CheckCircle2,
  XCircle,
  Plus,
  Eye,
  Paperclip,
  ExternalLink,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
import { formatINR } from "@/lib/format";
import { AgreementModal } from "@/components/collaboration/AgreementModal";

import { useAuth } from "@/components/auth/AuthProvider";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

const resolveImageUrl = (url) => {
  if (!url || url === "undefined" || url === "null") return null;
  if (url.startsWith("http")) return url;
  let apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  if (apiUrl.endsWith("/api")) apiUrl = apiUrl.slice(0, -4);
  return `${apiUrl}${url}`;
};

export default function Messages() {
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const queryConversationId = searchParams.get("conversationId");

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);

  const [activeConversation, setActiveConversation] = useState(null);

  // Negotiation & Collaboration Header states
  const [negotiationAmount, setNegotiationAmount] = useState("");
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);
  const [isAgreeingOffer, setIsAgreeingOffer] = useState(false);
  const [isReopeningNegotiation, setIsReopeningNegotiation] = useState(false);
  const [viewAgreementOpen, setViewAgreementOpen] = useState(false);
  const [isNegotiationExpanded, setIsNegotiationExpanded] = useState(false);

  // Direct In-Chat Deliverables Sharing States
  const [shareWorkModalOpen, setShareWorkModalOpen] = useState(false);
  const [deliverableFile, setDeliverableFile] = useState(null);
  const [deliverableFilePreview, setDeliverableFilePreview] = useState(null);
  const [deliverableType, setDeliverableType] = useState("REEL");
  const [deliverableCaption, setDeliverableCaption] = useState("");
  const [submittingDeliverable, setSubmittingDeliverable] = useState(false);

  // Deliverable Review & Rework Modal States (Brand & Creator)
  const [reworkModalOpen, setReworkModalOpen] = useState(false);
  const [selectedSubmissionForRework, setSelectedSubmissionForRework] = useState(null);
  const [reworkFeedbackText, setReworkFeedbackText] = useState("");
  const [actionProcessingId, setActionProcessingId] = useState(null);

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Touch handling for mobile Unsend / Delete Chat
  const touchTimer = useRef(null);
  const [pressedMessageId, setPressedMessageId] = useState(null);
  const [pressedConversationId, setPressedConversationId] = useState(null);

  const handleTouchStartMessage = (msgId) => {
    touchTimer.current = setTimeout(() => {
      setPressedMessageId(msgId);
    }, 500); // 500ms long press
  };

  const handleTouchStartConversation = (convId) => {
    touchTimer.current = setTimeout(() => {
      setPressedConversationId(convId);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (touchTimer.current) {
      clearTimeout(touchTimer.current);
      touchTimer.current = null;
    }
  };
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

  const activeConvIdRef = useRef(null);
  activeConvIdRef.current = activeConversation?._id;

  /*
   * ----------------------------------------------------
   * OPEN CONVERSATION
   * ----------------------------------------------------
   */
  const openConversation = async (conversation) => {
    if (!conversation?._id) return;
    const isNewSelection = activeConvIdRef.current !== conversation._id;

    // Sync active ID ref immediately to block re-triggering
    activeConvIdRef.current = conversation._id;

    // Keep URL in sync with selected conversation
    if (queryConversationId !== conversation._id) {
      setSearchParams({ conversationId: conversation._id }, { replace: true });
    }

    if (isNewSelection) {
      setActiveConversation(conversation);
      setMessages([]);
    }

    await fetchMessages(conversation._id, isNewSelection);
    await markConversationAsRead(conversation._id);

    // Update unread count locally without triggering full re-selection
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

    // Prevent re-opening already active conversation
    if (activeConvIdRef.current === queryConversationId) return;

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
  const fetchMessages = async (conversationId, showLoading = true) => {
    try {
      if (showLoading) setMessagesLoading(true);

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
      if (showLoading) setMessagesLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  const handleUnsend = async (messageId) => {
    try {
      // Optimistic update
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? { ...msg, unsent: true } : msg))
      );

      await api.patch(`/api/messages/${messageId}/unsend`, {
        profileId: profile._id,
      });
      toast.success("Message unsent");
    } catch (error) {
      console.error("Unsend message error:", error);
      toast.error("Failed to unsend message");
      // Revert optimistic update on failure
      fetchMessages(activeConversation._id, false);
    }
  };

  /*
   * ----------------------------------------------------
   * REAL-TIME POLLING
   * ----------------------------------------------------
   */
  useEffect(() => {
    let interval;
    if (activeConversation?._id && profile?._id) {
      interval = setInterval(() => {
        // Silently fetch new messages without triggering loading state
        api(`/api/messages/${activeConversation._id}`)
          .then((response) => {
            const data = response?.data?.data || response?.data || [];
            const newMessages = Array.isArray(data) ? data : [];
            setMessages((prev) => {
              if (prev.length !== newMessages.length || (prev.length > 0 && prev[prev.length - 1]?._id !== newMessages[newMessages.length - 1]?._id)) {
                setTimeout(scrollToBottom, 100);
                return newMessages;
              }
              return prev;
            });
          })
          .catch(console.error);

        // Also fetch conversations quietly to update unread counts, last message, and collaboration status
        api(`/api/conversations?profileId=${profile._id}&role=${profile.role}`)
          .then((response) => {
            const data = response?.data?.data || response?.data || [];
            const list = Array.isArray(data) ? data : [];
            setConversations((prev) => {
              const prevStr = JSON.stringify(prev);
              const nextStr = JSON.stringify(list);
              if (prevStr !== nextStr) {
                return list;
              }
              return prev;
            });
            if (activeConversation?._id) {
              const currentUpdated = list.find((c) => c._id === activeConversation._id);
              if (currentUpdated && currentUpdated.connection) {
                setActiveConversation((prev) => {
                  if (
                    prev?.connection?.status !== currentUpdated.connection.status ||
                    prev?.connection?.proposedRate !== currentUpdated.connection.proposedRate ||
                    prev?.connection?.agreedRate !== currentUpdated.connection.agreedRate
                  ) {
                    return {
                      ...prev,
                      connection: currentUpdated.connection,
                    };
                  }
                  return prev;
                });
              }
            }
          })
          .catch(console.error);
      }, 4000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeConversation?._id, profile?._id, profile?.role]);

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
   * NEGOTIATION HANDLERS
   * ----------------------------------------------------
   */
  const handleProposeAmount = async (e) => {
    e?.preventDefault();
    const connId = activeConversation?.connection?._id;
    if (!connId) {
      toast.error("No active collaboration connection found.");
      return;
    }

    const num = Number(negotiationAmount);
    if (!num || num <= 0) {
      toast.error("Please enter a valid amount greater than ₹0.");
      return;
    }

    try {
      setIsSubmittingOffer(true);
      const res = await api.patch(`/api/connections/${connId}/propose-amount`, {
        amount: num,
      });

      const updatedConn = res?.data?.data || res?.data;
      if (updatedConn) {
        setActiveConversation((prev) => ({
          ...prev,
          connection: updatedConn,
        }));
        setConversations((prev) =>
          prev.map((c) =>
            c._id === activeConversation._id
              ? { ...c, connection: updatedConn }
              : c
          )
        );
      }

      toast.success(`Proposed creator amount ₹${num.toLocaleString()} successfully!`);
      setNegotiationAmount("");
      setIsReopeningNegotiation(false);
      await fetchConversations();
    } catch (error) {
      console.error("Propose offer error:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to propose payment amount."
      );
    } finally {
      setIsSubmittingOffer(false);
    }
  };

  const handleAgreeAmount = async () => {
    const connId = activeConversation?.connection?._id;
    if (!connId) {
      toast.error("No active collaboration connection found.");
      return;
    }

    try {
      setIsAgreeingOffer(true);
      const res = await api.patch(`/api/connections/${connId}/agree-amount`);

      const updatedConn = res?.data?.data || res?.data;
      if (updatedConn) {
        setActiveConversation((prev) => ({
          ...prev,
          connection: updatedConn,
        }));
        setConversations((prev) =>
          prev.map((c) =>
            c._id === activeConversation._id
              ? { ...c, connection: updatedConn }
              : c
          )
        );
      }

      toast.success("Payment amount agreed successfully!");
      setIsReopeningNegotiation(false);
      await fetchConversations();
    } catch (error) {
      console.error("Agree offer error:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to agree on payment amount."
      );
    } finally {
      setIsAgreeingOffer(false);
    }
  };

  /*
   * ----------------------------------------------------
   * TASK 4: COLLABORATION PAYMENT HANDLER (BRAND -> PRAVIXO)
   * ----------------------------------------------------
   */
  const [isPayingCollaboration, setIsPayingCollaboration] = useState(false);

  const handlePayCollaboration = async () => {
    const connId = activeConversation?.connection?._id;
    if (!connId) {
      toast.error("No active collaboration connection found.");
      return;
    }

    try {
      setIsPayingCollaboration(true);

      // Step 1: Request Order from backend
      const res = await api.post(`/api/payments/collaboration/${connId}/order`);
      const orderData = res.data?.data || res.data;

      if (!orderData || !orderData.orderId) {
        throw new Error("Failed to generate payment order.");
      }

      // Step 2: Open Razorpay checkout modal
      const options = {
        key: orderData.key || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Pravixo Platform",
        description: `Payment for Campaign Collaboration (${activeConversation.campaign?.title || "Campaign"})`,
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            setIsPayingCollaboration(true);
            // Step 3: Server-side signature verification
            const verifyRes = await api.post(`/api/payments/collaboration/${connId}/verify`, {
              gatewayOrderId: response.razorpay_order_id,
              gatewayPaymentId: response.razorpay_payment_id,
              gatewaySignature: response.razorpay_signature,
            });

            const updatedConn = verifyRes.data?.data?.connection || {
              ...activeConversation.connection,
              paymentStatus: "PAID",
            };

            setActiveConversation((prev) => ({
              ...prev,
              connection: updatedConn,
            }));

            setConversations((prev) =>
              prev.map((c) =>
                c._id === activeConversation._id
                  ? { ...c, connection: updatedConn }
                  : c
              )
            );

            toast.success("Payment successful! Funds secured with Pravixo.");
            await fetchConversations();
          } catch (verifyErr) {
            console.error("Verification error:", verifyErr);
            toast.error(verifyErr?.response?.data?.message || verifyErr.message || "Payment verification failed.");
          } finally {
            setIsPayingCollaboration(false);
          }
        },
        prefill: {
          name: profile.fullName || "",
          email: profile.email || "",
          contact: profile.phone || "",
        },
        theme: {
          color: "#EC4899",
        },
        modal: {
          ondismiss: () => {
            setIsPayingCollaboration(false);
            toast.info("Payment window closed.");
          },
        },
      };

      if (!window.Razorpay) {
        // Dynamically load Razorpay script if not loaded
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => {
          const rzp = new window.Razorpay(options);
          rzp.open();
        };
        document.body.appendChild(script);
      } else {
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      console.error("Initiate payment error:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to initiate payment."
      );
      setIsPayingCollaboration(false);
    }
  };

  /*
   * ----------------------------------------------------
   * DELIVERABLES SHARING & REVIEW HANDLERS (IN CHAT)
   * ----------------------------------------------------
   */
  const handleShareDeliverable = async (e) => {
    e?.preventDefault();
    const connId = activeConversation?.connection?._id;
    if (!connId || !deliverableFile) {
      toast.error("Please select a photo or video to share.");
      return;
    }

    try {
      setSubmittingDeliverable(true);
      const formData = new FormData();
      formData.append("deliverableType", deliverableType);
      formData.append("file", deliverableFile);
      if (deliverableCaption) formData.append("caption", deliverableCaption);

      const res = await api.post(`/api/submissions/${connId}/submit`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        toast.success("Deliverable submitted and shared to chat!");
        setShareWorkModalOpen(false);
        setDeliverableFile(null);
        setDeliverableFilePreview(null);
        setDeliverableCaption("");
        await fetchMessages(activeConversation._id, false);
      }
    } catch (err) {
      console.error("Submit deliverable error:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to submit deliverable.");
    } finally {
      setSubmittingDeliverable(false);
    }
  };

  const handleApproveSubmission = async (submissionId) => {
    if (!submissionId) return;
    try {
      setActionProcessingId(submissionId);
      const res = await api.patch(`/api/submissions/${submissionId}/approve`);
      if (res.data.success) {
        toast.success("Deliverable approved!");
        await fetchMessages(activeConversation._id, false);
      }
    } catch (err) {
      console.error("Approve deliverable error:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to approve deliverable.");
    } finally {
      setActionProcessingId(null);
    }
  };

  const handleRejectSubmission = async (e) => {
    e?.preventDefault();
    if (!selectedSubmissionForRework || !reworkFeedbackText.trim()) {
      toast.error("Please provide feedback notes for the rework request.");
      return;
    }

    try {
      setActionProcessingId(selectedSubmissionForRework);
      const res = await api.patch(`/api/submissions/${selectedSubmissionForRework}/reject`, {
        feedbackNotes: reworkFeedbackText.trim(),
      });
      if (res.data.success) {
        toast.success("Rework requested with feedback!");
        setReworkModalOpen(false);
        setSelectedSubmissionForRework(null);
        setReworkFeedbackText("");
        await fetchMessages(activeConversation._id, false);
      }
    } catch (err) {
      console.error("Reject deliverable error:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to request rework.");
    } finally {
      setActionProcessingId(null);
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
   * ARCHIVE / UNARCHIVE (Now "Delete Chat")
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
    <div className="mx-auto flex h-[calc(100vh-64px)] w-full max-w-7xl flex-col p-4 sm:p-6 lg:p-8">

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
      <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[350px_1fr]">

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
                Deleted
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
                      onTouchStart={() => handleTouchStartConversation(conversation._id)}
                      onTouchEnd={handleTouchEnd}
                      onTouchCancel={handleTouchEnd}
                      className={`relative flex cursor-pointer items-center gap-3 border-b border-border/50 p-4 transition hover:bg-secondary/50 ${
                        activeConversation?._id ===
                        conversation._id
                          ? "border-l-4 border-l-primary bg-accent/40"
                          : ""
                      }`}
                    >
                      {/* Mobile Delete Chat Popup */}
                      {pressedConversationId === conversation._id && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleArchive(conversation);
                              setPressedConversationId(null);
                            }}
                            className="rounded-full bg-red-500 px-6 py-2 text-sm font-medium text-white shadow-lg"
                          >
                            {conversation.archived ? "Restore Chat" : "Delete Chat"}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPressedConversationId(null);
                            }}
                            className="ml-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-foreground shadow-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      {/* AVATAR */}
                      <div className="relative shrink-0">

                        <img src={
                            resolveImageUrl(other?.avatarUrl) ||
                            `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(
                              other?.fullName ||
                                "User"
                            )}`
                          }
                          alt={
                            other?.fullName ||
                            "User"
                          }
                          className="h-12 w-12 rounded-2xl object-cover shadow-soft"
                         onError={(e) => { e.target.onerror = null; e.target.src = "https://api.dicebear.com/9.x/avataaars/svg?seed=Fallback"; }} />

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
                          <div className="flex items-center gap-1.5 min-w-0">
                            <h4 className="truncate font-display font-semibold">
                              {other?.role === "admin" || conversation.conversationType?.startsWith("admin_")
                                ? "Pravixo Admin"
                                : other?.fullName || "Unknown User"}
                            </h4>
                            {(other?.role === "admin" || conversation.conversationType?.startsWith("admin_")) && (
                              <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary border border-primary/20">
                                🛡️ Admin
                              </span>
                            )}
                          </div>

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
                    `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(
                      otherProfile?.fullName ||
                        "User"
                    )}`
                  }
                  alt={
                    otherProfile?.fullName ||
                    "User"
                  }
                  className="h-11 w-11 rounded-2xl object-cover"
                 onError={(e) => { e.target.onerror = null; e.target.src = "https://api.dicebear.com/9.x/avataaars/svg?seed=Fallback"; }} />

                {/* NAME */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate font-display font-semibold">
                      {otherProfile?.role === "admin" || activeConversation.conversationType?.startsWith("admin_")
                        ? "Pravixo Admin"
                        : otherProfile?.fullName || "Unknown User"}
                    </h2>
                    {(otherProfile?.role === "admin" || activeConversation.conversationType?.startsWith("admin_")) && (
                      <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary border border-primary/20">
                        🛡️ Pravixo Team
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {otherProfile?.role === "admin" || activeConversation.conversationType?.startsWith("admin_")
                      ? "Official Support & Platform Coordination"
                      : activeConversation.status === "active"
                      ? "Active conversation"
                      : activeConversation.status}
                  </p>
                </div>

                {/* DELETE CHAT */}
                <button
                  type="button"
                  onClick={() =>
                    toggleArchive(
                      activeConversation
                    )
                  }
                  className="rounded-xl p-2 text-muted-foreground hover:bg-secondary hover:text-red-500"
                  title={
                    activeConversation.archived
                      ? "Restore Chat"
                      : "Delete Chat"
                  }
                >
                  {activeConversation.archived ? (
                    <ArchiveRestore className="h-5 w-5" />
                  ) : (
                    <Trash2 className="h-5 w-5" />
                  )}
                </button>

              </div>

              {/* COLLABORATION & PAYMENT NEGOTIATION BAR (CLEAN & COLLAPSIBLE) */}
              {activeConversation.connection && (
                <div className="border-b border-border bg-card/70 backdrop-blur-md transition-all duration-300">
                  {(() => {
                    const conn = activeConversation.connection;
                    const camp = activeConversation.campaign;
                    const isAgreed = conn.collaborationStatus === "AMOUNT_AGREED" && !isReopeningNegotiation;
                    const hasPendingProposal = conn.proposedAmount > 0 && conn.collaborationStatus === "NEGOTIATING";
                    const isProposedByMe = String(conn.proposedBy) === String(profile._id);

                    // Calculations
                    const displayCreatorAmount = isAgreed ? conn.creatorAmount : (conn.proposedAmount || 0);
                    const displayFee = isAgreed ? conn.pravixoFee : Math.round(displayCreatorAmount * 0.20);
                    const displayBrandTotal = isAgreed ? conn.brandTotal : (displayCreatorAmount + displayFee);

                    return (
                      <div>
                        {/* COMPACT TOP BAR */}
                        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <Sparkles className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-display text-xs font-bold text-foreground truncate">
                                  {camp?.title || "Campaign Collaboration"}
                                </span>
                                {isAgreed ? (
                                  <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] py-0 px-2 font-bold flex items-center gap-1">
                                    <ShieldCheck className="h-3 w-3" /> ₹{conn.creatorAmount?.toLocaleString()} Agreed
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] py-0 px-2 font-semibold">
                                    Negotiating Rate
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Payment Status / Action */}
                            {isAgreed && (
                              <>
                                {conn.paymentStatus === "PAID" ? (
                                  <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] py-0 px-2 font-bold flex items-center gap-1">
                                    ✓ Escrow Funded
                                  </Badge>
                                ) : profile.role === "brand" ? (
                                  <Button
                                    size="sm"
                                    onClick={handlePayCollaboration}
                                    disabled={isPayingCollaboration}
                                    className="h-7 rounded-full gradient-sunset text-white font-bold text-[11px] px-3 shadow-glow flex items-center gap-1"
                                  >
                                    <IndianRupee className="h-3 w-3" />
                                    {isPayingCollaboration ? "Paying..." : `Pay ₹${conn.brandTotal?.toLocaleString()}`}
                                  </Button>
                                ) : (
                                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] py-0 px-2 font-medium">
                                    Payment Pending
                                  </Badge>
                                )}
                              </>
                            )}

                            {isAgreed && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setViewAgreementOpen(true)}
                                className="h-7 rounded-full border-border hover:bg-secondary text-[11px] font-medium px-2.5 flex items-center gap-1"
                              >
                                <FileText className="h-3 w-3 text-primary" /> Agreement
                              </Button>
                            )}

                            {/* Creator Share Work Quick Button in Header */}
                            {profile.role === "creator" && conn.paymentStatus === "PAID" && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setDeliverableFile(null);
                                  setDeliverableFilePreview(null);
                                  setDeliverableCaption("");
                                  setShareWorkModalOpen(true);
                                }}
                                className="h-7 rounded-full gradient-sunset border-0 text-white text-[11px] font-bold px-3 shadow-glow flex items-center gap-1 cursor-pointer"
                              >
                                <Upload className="h-3 w-3" /> Share Work
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setIsNegotiationExpanded(!isNegotiationExpanded)}
                              className="h-7 rounded-full text-muted-foreground hover:text-foreground text-[11px] px-2 flex items-center gap-0.5"
                            >
                              <span>{isNegotiationExpanded ? "Hide" : "Details"}</span>
                              {isNegotiationExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </Button>
                          </div>
                        </div>

                        {/* EXPANDABLE DETAILS DRAWER */}
                        {(isNegotiationExpanded || (!isAgreed && !hasPendingProposal && activeConversation)) && (
                          <div className="border-t border-border/50 bg-background/95 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                            {camp && (
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pb-2 border-b border-border/40">
                                <span><strong>Campaign:</strong> {camp.title}</span>
                                {profile?.role !== "creator" && (
                                  <>
                                    <span>•</span>
                                    <span><strong>Total Budget:</strong> ₹{camp.totalBudget?.toLocaleString() || "0"}</span>
                                  </>
                                )}
                                {camp.maxBudgetPerCreator > 0 && (
                                  <>
                                    <span>•</span>
                                    <span><strong>Max/Creator:</strong> ₹{camp.maxBudgetPerCreator?.toLocaleString()}</span>
                                  </>
                                )}
                              </div>
                            )}

                            {isAgreed ? (
                              <div className="space-y-3">
                                {profile?.role === "creator" ? (
                                  <div className="rounded-xl bg-secondary/30 p-3 border border-border/60">
                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium block">
                                      Creator Payout
                                    </span>
                                    <span className="text-base font-bold text-emerald-600">
                                      ₹{conn.creatorAmount?.toLocaleString()}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl bg-secondary/30 p-3 border border-border/60">
                                    <div>
                                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium block">
                                        Creator Payout
                                      </span>
                                      <span className="text-sm font-bold text-emerald-600">
                                        ₹{conn.creatorAmount?.toLocaleString()}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium block">
                                        Pravixo Fee (20%)
                                      </span>
                                      <span className="text-sm font-bold text-foreground">
                                        ₹{conn.pravixoFee?.toLocaleString()}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium block">
                                        Brand Total
                                      </span>
                                      <span className="text-sm font-bold text-primary">
                                        ₹{conn.brandTotal?.toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {/* Deliverables Progress Grid */}
                                {conn.deliverablesTracking && conn.deliverablesTracking.length > 0 && (
                                  <div className="rounded-xl border border-border/80 bg-secondary/10 p-3 space-y-2">
                                    <div className="flex items-center justify-between text-xs font-bold">
                                      <span className="uppercase tracking-wider text-muted-foreground text-[10px]">
                                        Campaign Deliverables Status
                                      </span>
                                      {conn.paymentStatus === "PAID" && (() => {
                                        const totalReq = conn.deliverablesTracking.reduce((acc, d) => acc + (d.requiredQuantity || 0), 0);
                                        const totalComp = conn.deliverablesTracking.reduce((acc, d) => acc + (d.completedQuantity || 0), 0);
                                        const pct = totalReq > 0 ? Math.round((totalComp / totalReq) * 100) : 0;
                                        return (
                                          <span className="text-primary text-xs font-bold">
                                            {totalComp}/{totalReq} Approved ({pct}%)
                                          </span>
                                        );
                                      })()}
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                      {conn.deliverablesTracking.map((deliv, dIdx) => {
                                        const typeLabels = { REEL: "Reels", POST: "Posts", STORY: "Stories", VIDEO: "Videos" };
                                        const isCompleted = (deliv.completedQuantity || 0) >= (deliv.requiredQuantity || 1);
                                        return (
                                          <div
                                            key={dIdx}
                                            className={cn(
                                              "flex flex-col p-2 rounded-lg border text-xs",
                                              isCompleted
                                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700"
                                                : conn.paymentStatus === "PAID"
                                                ? "bg-secondary/50 border-border"
                                                : "bg-muted/30 border-border/40 opacity-60"
                                            )}
                                          >
                                            <div className="flex items-center justify-between text-[11px] font-medium">
                                              <span>{typeLabels[deliv.type] || deliv.type}</span>
                                              {isCompleted && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
                                            </div>
                                            <div className="mt-1 flex items-baseline justify-between text-xs">
                                              <span className="font-bold">
                                                {deliv.completedQuantity || 0} / {deliv.requiredQuantity}
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                                  <span>
                                    Agreed at: {conn.agreedAt ? new Date(conn.agreedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "Recently"}
                                  </span>
                                  {conn.paymentStatus !== "PAID" && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 text-xs text-muted-foreground hover:text-foreground"
                                      onClick={() => setIsReopeningNegotiation(true)}
                                    >
                                      <RefreshCw className="h-3 w-3 mr-1" /> Re-negotiate Amount
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ) : (
                              /* NEGOTIATION FORM */
                              <div className="space-y-3">
                                {hasPendingProposal && (
                                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                        <IndianRupee className="h-3.5 w-3.5 text-primary" />
                                        <span>
                                          {isProposedByMe
                                            ? `You proposed a creator payment of ₹${conn.proposedAmount?.toLocaleString()}`
                                            : `${otherProfile?.fullName || "Partner"} proposed a creator payment of ₹${conn.proposedAmount?.toLocaleString()}`}
                                        </span>
                                      </div>
                                      {profile?.role === "creator" ? (
                                        <div className="flex flex-wrap gap-x-3 text-[11px] text-muted-foreground">
                                          <span><strong>You will receive:</strong> ₹{displayCreatorAmount?.toLocaleString()}</span>
                                        </div>
                                      ) : (
                                        <div className="flex flex-wrap gap-x-3 text-[11px] text-muted-foreground">
                                          <span><strong>Creator receives:</strong> ₹{displayCreatorAmount?.toLocaleString()}</span>
                                          <span>•</span>
                                          <span><strong>Fee (20%):</strong> ₹{displayFee?.toLocaleString()}</span>
                                          <span>•</span>
                                          <span><strong>Brand pays:</strong> ₹{displayBrandTotal?.toLocaleString()}</span>
                                        </div>
                                      )}
                                    </div>

                                    {!isProposedByMe && (
                                      <Button
                                        size="sm"
                                        onClick={handleAgreeAmount}
                                        disabled={isAgreeingOffer}
                                        className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 h-8 shrink-0 flex items-center gap-1.5"
                                      >
                                        <Check className="h-3.5 w-3.5" />
                                        {isAgreeingOffer ? "Agreeing..." : "Accept & Agree"}
                                      </Button>
                                    )}
                                  </div>
                                )}

                                <form onSubmit={handleProposeAmount} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                  <div className="relative flex-1">
                                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                      type="number"
                                      min="1"
                                      placeholder={hasPendingProposal ? "Enter counter offer for creator payment..." : "Enter proposed creator payment amount (₹)..."}
                                      value={negotiationAmount}
                                      onChange={(e) => setNegotiationAmount(e.target.value)}
                                      className="w-full rounded-xl border border-input bg-background py-2 pl-9 pr-4 text-xs font-medium outline-none focus:ring-1 focus:ring-primary"
                                    />
                                  </div>

                                  <Button
                                    type="submit"
                                    size="sm"
                                    disabled={!negotiationAmount || isSubmittingOffer}
                                    className="rounded-xl gradient-sunset text-white text-xs font-semibold px-4 h-9 shrink-0"
                                  >
                                    {isSubmittingOffer ? "Sending..." : hasPendingProposal ? "Send Counter Offer" : "Propose Amount"}
                                  </Button>
                                </form>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* MESSAGES FEED */}
              <div className="flex-1 space-y-3.5 overflow-y-auto p-4 sm:p-5">
                {messagesLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-muted-foreground">Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <MessageSquare className="mb-3 h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm font-semibold text-foreground">No messages yet</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Send a message to start communicating.</p>
                  </div>
                ) : (
                  messages.map((item) => {
                    const isMine = item.senderId?.toString() === profile._id?.toString();

                    return (
                      <div
                        key={item._id}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        {item.unsent || item.deletedByAdmin || (profile.role === "creator" && item.deletedForCreator) || (profile.role === "brand" && item.deletedForBrand) ? (
                          <div className={`flex max-w-[75%] flex-col ${isMine ? "items-end" : "items-start"}`}>
                            <div className="flex items-center gap-1 rounded-2xl bg-slate-100 px-4 py-2 text-sm italic text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                              <Ban className="h-4 w-4" />
                              <span>This message was {item.unsent ? "unsent" : item.deletedByAdmin ? "deleted by Admin" : "deleted"}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-end gap-2 group relative max-w-[85%] sm:max-w-[75%]">
                            {isMine && !item.messageType && (
                              <button
                                onClick={() => handleUnsend(item._id)}
                                className="opacity-0 transition-opacity group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 hidden md:block"
                                title="Unsend for everyone"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}

                            {/* DELIVERABLE SUBMISSION INTERACTIVE CARD IN CHAT */}
                            {item.messageType === "deliverable_submission" && item.metadata ? (
                              <div
                                className={cn(
                                  "w-full rounded-2xl p-4 text-xs border shadow-md space-y-3 transition-all",
                                  isMine
                                    ? "rounded-br-md bg-card/95 border-primary/30 text-foreground"
                                    : "rounded-bl-md bg-card/95 border-border text-foreground"
                                )}
                              >
                                {/* Card Header */}
                                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border/50">
                                  <div className="flex items-center gap-1.5">
                                    <Film className="h-4 w-4 text-primary" />
                                    <span className="font-bold text-xs text-foreground uppercase tracking-wide">
                                      {item.metadata.deliverableType || "Deliverable"} Submission
                                    </span>
                                  </div>
                                  <Badge
                                    className={cn(
                                      "text-[10px] px-2 py-0.5 font-bold border",
                                      item.metadata.status === "APPROVED"
                                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                        : item.metadata.status === "REJECTED"
                                        ? "bg-red-500/10 text-red-500 border-red-500/30"
                                        : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                    )}
                                  >
                                    {item.metadata.status === "APPROVED" ? "✓ Approved" : item.metadata.status === "REJECTED" ? "Rework Needed" : "⏳ Under Review"}
                                  </Badge>
                                </div>

                                {/* Video / Image Media Player Preview */}
                                {item.metadata.contentUrl && (
                                  <div className="rounded-xl overflow-hidden bg-black/90 border border-border flex items-center justify-center">
                                    {item.metadata.contentUrl?.match(/\.(mp4|mov|webm|avi|mkv|m4v)$/i) || item.metadata.deliverableType === "REEL" || item.metadata.deliverableType === "VIDEO" ? (
                                      <video
                                        src={resolveImageUrl(item.metadata.contentUrl)}
                                        controls
                                        playsInline
                                        preload="metadata"
                                        className="w-full max-h-[340px] object-contain rounded-xl"
                                      />
                                    ) : (
                                      <img
                                        src={resolveImageUrl(item.metadata.contentUrl)}
                                        alt="Deliverable work"
                                        className="w-full max-h-[340px] object-contain rounded-xl cursor-pointer"
                                        onClick={() => window.open(resolveImageUrl(item.metadata.contentUrl), "_blank")}
                                      />
                                    )}
                                  </div>
                                )}

                                {/* Caption & Notes */}
                                {item.metadata.caption && (
                                  <div className="rounded-xl bg-secondary/30 p-2.5 text-xs text-foreground">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-0.5">Caption / Notes</span>
                                    <p className="whitespace-pre-wrap">{item.metadata.caption}</p>
                                  </div>
                                )}

                                {/* Rejection Feedback if any */}
                                {item.metadata.status === "REJECTED" && item.metadata.feedbackNotes && (
                                  <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-2.5 text-xs text-red-600">
                                    <span className="font-bold block text-[10px] uppercase mb-0.5">Brand Changes Requested:</span>
                                    <p>{item.metadata.feedbackNotes}</p>
                                  </div>
                                )}

                                {/* BRAND DIRECT APPROVAL / REJECT CONTROLS */}
                                {profile.role === "brand" && (item.metadata.status === "SUBMITTED" || item.metadata.status === "RESUBMITTED" || !item.metadata.status) && (
                                  <div className="pt-2 border-t border-border/50 flex flex-wrap items-center gap-2 justify-end">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled={actionProcessingId === item.metadata.submissionId}
                                      onClick={() => {
                                        setSelectedSubmissionForRework(item.metadata.submissionId);
                                        setReworkFeedbackText("");
                                        setReworkModalOpen(true);
                                      }}
                                      className="h-8 rounded-full border-red-500/30 text-red-600 hover:bg-red-500/10 text-xs font-semibold px-3"
                                    >
                                      <XCircle className="h-3.5 w-3.5 mr-1" /> Request Rework
                                    </Button>

                                    <Button
                                      size="sm"
                                      disabled={actionProcessingId === item.metadata.submissionId}
                                      onClick={() => handleApproveSubmission(item.metadata.submissionId)}
                                      className="h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 shadow-sm"
                                    >
                                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                      {actionProcessingId === item.metadata.submissionId ? "Approving..." : "Approve Deliverable"}
                                    </Button>
                                  </div>
                                )}

                                {/* Card Footer Timestamp & Link */}
                                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/30">
                                  <span>
                                    {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                                  </span>
                                  {item.metadata.contentUrl && (
                                    <a
                                      href={resolveImageUrl(item.metadata.contentUrl)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-primary hover:underline font-semibold flex items-center gap-0.5"
                                    >
                                      <span>Open full size</span> <ExternalLink className="h-2.5 w-2.5" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            ) : (
                              /* STANDARD TEXT MESSAGE BUBBLE */
                              <div
                                onTouchStart={() => isMine && handleTouchStartMessage(item._id)}
                                onTouchEnd={handleTouchEnd}
                                onTouchCancel={handleTouchEnd}
                                className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                                  isMine
                                    ? "rounded-br-md gradient-sunset text-white"
                                    : "rounded-bl-md bg-secondary/80 text-foreground border border-border/50"
                                }`}
                              >
                                <p className="whitespace-pre-wrap leading-relaxed">{item.text}</p>
                                <p
                                  className={`mt-1 text-[10px] ${
                                    isMine ? "text-white/70 text-right" : "text-muted-foreground"
                                  }`}
                                >
                                  {item.createdAt
                                    ? new Date(item.createdAt).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : ""}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* MESSAGE INPUT BAR WITH ATTACH / SHARE WORK BUTTON */}
              <form onSubmit={sendMessage} className="border-t border-border p-3 bg-card/60 backdrop-blur-md">
                <div className="flex items-center gap-2 rounded-2xl border border-input bg-background p-1.5 shadow-sm">
                  {/* Creator Direct Work Upload Action */}
                  {profile.role === "creator" && activeConversation.connection && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDeliverableFile(null);
                        setDeliverableFilePreview(null);
                        setDeliverableCaption("");
                        setShareWorkModalOpen(true);
                      }}
                      className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 shrink-0"
                      title="Share Deliverable / Work (Photo or Video)"
                    >
                      <Film className="h-4 w-4" />
                    </Button>
                  )}

                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    disabled={sending}
                    className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
                  />

                  <button
                    type="submit"
                    disabled={!message.trim() || sending}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-sunset text-white disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:scale-105 active:scale-95 shadow-glow"
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
              <h2 className="font-display text-xl font-semibold">Your Inbox</h2>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                Select a conversation from the left to start communicating.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Collaboration Agreement Viewer Modal */}
      {viewAgreementOpen && activeConversation?.connection?._id && (
        <AgreementModal
          isOpen={viewAgreementOpen}
          onClose={() => setViewAgreementOpen(false)}
          connectionId={activeConversation.connection._id}
        />
      )}

      {/* CREATOR IN-CHAT SHARE WORK / DELIVERABLE MODAL */}
      <Dialog open={shareWorkModalOpen} onOpenChange={setShareWorkModalOpen}>
        <DialogContent className="max-w-md rounded-3xl border border-border bg-card p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold flex items-center gap-2">
              <Film className="h-5 w-5 text-primary" /> Share Deliverable Work
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Upload your video or photo deliverable so the brand can review and approve it directly in chat.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleShareDeliverable} className="space-y-4 pt-2">
            {/* Deliverable Type Selection */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">Deliverable Type</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: "REEL", label: "🎬 Reel" },
                  { id: "POST", label: "📸 Post" },
                  { id: "STORY", label: "📱 Story" },
                  { id: "VIDEO", label: "🎥 Video" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDeliverableType(item.id)}
                    className={cn(
                      "py-2 px-1 text-xs font-semibold rounded-xl border transition-all text-center",
                      deliverableType === item.id
                        ? "gradient-sunset text-white border-0 shadow-glow"
                        : "bg-secondary/40 border-border text-foreground hover:bg-secondary"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload Zone */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">Upload Media File (Video / Photo)</label>
              <div className="relative rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-secondary/20 p-4 transition-all text-center">
                {deliverableFilePreview ? (
                  <div className="space-y-2">
                    {deliverableFile?.type?.startsWith("video") || deliverableType === "REEL" || deliverableType === "VIDEO" ? (
                      <video
                        src={deliverableFilePreview}
                        controls
                        className="max-h-48 w-full object-contain rounded-xl bg-black"
                      />
                    ) : (
                      <img
                        src={deliverableFilePreview}
                        alt="Preview"
                        className="max-h-48 w-full object-contain rounded-xl mx-auto"
                      />
                    )}
                    <p className="text-[11px] font-medium text-foreground truncate">{deliverableFile?.name}</p>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setDeliverableFile(null);
                        setDeliverableFilePreview(null);
                      }}
                      className="h-7 text-xs text-destructive hover:bg-destructive/10 rounded-full"
                    >
                      <X className="h-3 w-3 mr-1" /> Remove
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer py-4">
                    <Upload className="h-8 w-8 text-muted-foreground/60 mb-2" />
                    <span className="text-xs font-bold text-foreground">Click to select Video or Photo</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">MP4, MOV, WEBM, JPG, PNG up to 100MB</span>
                    <input
                      type="file"
                      accept="video/*,image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setDeliverableFile(file);
                          setDeliverableFilePreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Optional Caption */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">Caption & Notes (Optional)</label>
              <textarea
                rows={2}
                placeholder="Add any context, links, or notes for the brand..."
                value={deliverableCaption}
                onChange={(e) => setDeliverableCaption(e.target.value)}
                className="w-full rounded-xl border border-input bg-background p-2.5 text-xs outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShareWorkModalOpen(false)}
                className="rounded-full text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!deliverableFile || submittingDeliverable}
                className="rounded-full gradient-sunset text-white text-xs font-bold px-5 h-9 shadow-glow"
              >
                {submittingDeliverable ? "Uploading..." : "Submit & Send to Chat"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* BRAND REQUEST REWORK MODAL */}
      <Dialog open={reworkModalOpen} onOpenChange={setReworkModalOpen}>
        <DialogContent className="max-w-md rounded-3xl border border-border bg-card p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" /> Request Deliverable Changes
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Provide clear feedback notes for the creator explaining what needs revision.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRejectSubmission} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">Feedback Notes</label>
              <textarea
                rows={4}
                required
                placeholder="Describe what changes you need the creator to make (e.g., sound volume, lighting, product placement)..."
                value={reworkFeedbackText}
                onChange={(e) => setReworkFeedbackText(e.target.value)}
                className="w-full rounded-xl border border-input bg-background p-3 text-xs outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setReworkModalOpen(false)}
                className="rounded-full text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!reworkFeedbackText.trim() || Boolean(actionProcessingId)}
                className="rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-5 h-9 shadow-sm"
              >
                {actionProcessingId ? "Submitting..." : "Send Rework Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}