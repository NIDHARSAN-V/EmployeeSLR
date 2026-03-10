"use client";

import { useEffect, useState } from "react";

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
      const res = await fetch(`http://localhost:8000/discussion/${kind}/${refId}`);
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
      `http://localhost:8000/discussion/${kind}/${refId}/message`,
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
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center">
      <div className="bg-white p-6 w-full max-w-lg rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 capitalize">
          Discussion – {kind} #{refId}
        </h2>

        <div className="space-y-3 max-h-64 overflow-y-auto border p-3 rounded">
          {messages.length === 0 && (
            <p className="text-slate-500">No messages yet.</p>
          )}

          {messages.map((msg, i) => (
            <div key={i} className="p-2 bg-slate-100 rounded">
              <p className="font-medium text-sm">User: {msg.userId}</p>
              <p className="text-slate-700">{msg.message}</p>
              <p className="text-xs text-slate-500">
                {new Date(msg.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 border rounded px-3 py-2"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-4 rounded"
          >
            Send
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 text-red-600 underline text-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
}