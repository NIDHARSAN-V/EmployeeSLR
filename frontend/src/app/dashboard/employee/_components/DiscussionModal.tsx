"use client";

import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";

export default function DiscussionModal({
  kind,
  refId,
  userId,
  onClose,
}: {
  kind: "ticket" | "asset";
  refId: string;
  userId: string;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const loadMessages = async () => {
    try {
      const res = await fetch(apiUrl(`/discussion/${kind}/${refId}`));
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const res = await fetch(
      apiUrl(`/discussion/${kind}/${refId}/message`),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, message: newMessage }),
      }
    );

    const data = await res.json();
    setMessages(data.messages);
    setNewMessage("");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700/60 rounded-xl shadow-xl w-full max-w-lg p-6 text-slate-200">
        
        {/* Header */}
        <h2 className="text-xl font-bold text-slate-100 mb-4">
          Discussion – <span className="text-cyan-400">{kind}</span> #{refId}
        </h2>

        {/* Messages */}
        <div className="space-y-3 max-h-64 overflow-y-auto border border-slate-700 rounded p-3 bg-slate-800/40">
          {messages.length === 0 && (
            <p className="text-slate-500 text-sm font-mono">No messages yet.</p>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className="p-3 bg-slate-800 border border-slate-700 rounded-lg"
            >
              <p className="text-xs font-mono text-cyan-400">
                User: {msg.userId}
              </p>

              <p className="text-sm text-slate-200 mt-1">{msg.message}</p>

              <p className="text-[10px] text-slate-500 font-mono mt-1">
                {new Date(msg.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* Input Row */}
        <div className="flex gap-2 mt-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-cyan-400/20 outline-none"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            className="px-4 bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 rounded uppercase font-bold text-xs tracking-wider hover:bg-cyan-500/30 transition"
          >
            Send
          </button>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="mt-4 text-red-400 hover:text-red-300 font-mono text-xs underline"
        >
          Close
        </button>
      </div>
    </div>
  );
}