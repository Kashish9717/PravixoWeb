import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X, Bot } from "lucide-react";

import { useAuth } from "../auth/AuthProvider";
import api from "../../lib/api";

export function ChatDialog() {
  const { isAuthenticated } = useAuth();

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "bot",
      text: "Hi! 👋 How can I help you today?",
    },
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();

    const text = message.trim();

    if (!text || sending) return;

    const userMessage = {
      id: `${Date.now()}-user`,
      sender: "user",
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setSending(true);

    try {
      const response = await api("/api/conversations/message", {
        method: "POST",
        body: JSON.stringify({
          message: text,
        }),
      });

      const reply =
        response?.reply ||
        response?.message ||
        response?.data?.reply ||
        response?.data?.message ||
        "Sorry, I couldn't process that message.";

      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-bot`,
          sender: "bot",
          text: reply,
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);

      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          sender: "bot",
          text: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full gradient-sunset text-white shadow-glow transition-transform hover:scale-105"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 flex h-[520px] w-[360px] max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-elevated">

          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-primary via-magenta to-violet px-5 py-4 text-white">

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                <Bot className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-semibold">
                  Pravixo Assistant
                </p>
                <p className="text-xs text-white/70">
                  Here to help
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-2 hover:bg-white/10"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">

            {messages.map((item) => (
              <div
                key={item.id}
                className={`flex ${
                  item.sender === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    item.sender === "user"
                      ? "rounded-br-md gradient-sunset text-white"
                      : "rounded-bl-md bg-muted text-foreground"
                  }`}
                >
                  {item.text}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={sendMessage}
            className="border-t border-border p-3"
          >
            <div className="flex items-center gap-2 rounded-2xl border border-input bg-background p-1.5">

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
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-sunset text-white disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}


export default ChatDialog;