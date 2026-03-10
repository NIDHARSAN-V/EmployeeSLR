"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AddDiscussionMessage,
  GetDiscussionMessages,
} from "@/api/discussion";
import { GetUserById } from "@/api/user";
import {
  DiscussionKind,
  DiscussionMessage,
} from "@/types/discussion";

interface DiscussionModalProps {
  kind: DiscussionKind;
  refId: string;
  userId: string;
  title: string;
  onClose: () => void;
}

export default function DiscussionModal({
  kind,
  refId,
  userId,
  title,
  onClose,
}: DiscussionModalProps) {
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messageCountLabel = useMemo(() => {
    return messages.length === 1 ? "1 message" : `${messages.length} messages`;
  }, [messages.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await GetDiscussionMessages(kind, refId);
        setMessages(data.messages ?? []);
      } catch (loadError) {
        console.error("Error loading discussion:", loadError);
        setError("Unable to load messages right now.");
      } finally {
        setLoading(false);
      }
    };

    void loadMessages();
  }, [kind, refId]);

  useEffect(() => {
    const missingUserIds = Array.from(
      new Set(messages.map((message) => message.userId).filter(Boolean))
    ).filter((messageUserId) => !userNames[messageUserId]);

    if (missingUserIds.length === 0) {
      return;
    }

    const loadUserNames = async () => {
      try {
        const users = await Promise.all(
          missingUserIds.map(async (messageUserId) => {
            const user = await GetUserById(messageUserId);
            return [messageUserId, user.userName] as const;
          })
        );

        setUserNames((current) => {
          const next = { ...current };
          for (const [messageUserId, userName] of users) {
            next[messageUserId] = userName;
          }
          return next;
        });
      } catch (userError) {
        console.error("Error loading message authors:", userError);
      }
    };

    void loadUserNames();
  }, [messages, userNames]);

  const handleSend = async () => {
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage || sending) {
      return;
    }

    setSending(true);
    setError(null);

    try {
      const data = await AddDiscussionMessage(kind, refId, {
        userId,
        message: trimmedMessage,
      });

      setMessages(data.messages ?? []);
      setNewMessage("");
    } catch (sendError) {
      console.error("Error sending discussion message:", sendError);
      setError("Unable to send the message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/80 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl border border-slate-800 bg-[#0d1117] shadow-2xl shadow-black/40"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-slate-800 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-slate-600">
                Discussion / {kind}
              </p>
              <h2 className="text-lg font-medium text-slate-100">{title}</h2>
              <p className="mt-1 text-xs text-slate-500">{messageCountLabel}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-[10px] uppercase tracking-widest text-slate-500 transition-colors hover:text-slate-300"
            >
              Close
            </button>
          </div>
        </div>

        <div className="max-h-[55vh] min-h-[280px] space-y-3 overflow-y-auto px-5 py-4">
          {loading && (
            <p className="text-xs uppercase tracking-widest text-slate-600">
              Loading messages...
            </p>
          )}

          {!loading && messages.length === 0 && (
            <div className="border border-dashed border-slate-800 px-4 py-6 text-center">
              <p className="text-xs uppercase tracking-widest text-slate-600">
                No messages yet
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Start the thread for this request.
              </p>
            </div>
          )}

          {!loading &&
            messages.map((message, index) => (
              <div
                key={`${message.userId}-${message.createdAt}-${index}`}
                className="border border-slate-800 bg-slate-950/40 px-4 py-3"
              >
                <div className="mb-2 flex items-center justify-between gap-4">
                  <p className="text-[11px] uppercase tracking-widest text-slate-400">
                    {userNames[message.userId] ?? message.userId}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-slate-600">
                    {new Date(message.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">
                  {message.message}
                </p>
              </div>
            ))}
        </div>

        <div className="border-t border-slate-800 px-5 py-4">
          <label className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-slate-600">
            New message
          </label>
          <textarea
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
            placeholder="Write a message for this request..."
            rows={4}
            className="w-full resize-none border border-slate-800 bg-slate-950/40 px-3 py-3 text-sm text-slate-200 outline-none transition-colors placeholder:text-slate-600 focus:border-slate-700"
          />

          <div className="mt-3 flex items-center justify-between gap-4">
            <p className="text-xs text-rose-400">{error ?? ""}</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="text-[10px] uppercase tracking-widest text-slate-500 transition-colors hover:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={!newMessage.trim() || sending}
                className="border border-sky-500/30 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-sky-300 transition-colors hover:border-sky-400/50 hover:text-sky-200 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-600"
              >
                {sending ? "Sending..." : "Send message"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
