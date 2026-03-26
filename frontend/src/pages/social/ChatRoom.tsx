import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRoomDetail, useRoomMessages, useDeleteRoom, useLeaveRoom } from "../../api/socialQueries";
import { useAuth } from "../../context/useAuth";
import { useSocket } from "../../context/SocketContext";
import type { Message } from "../../types/social";

const EMOJI_OPTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

export function ChatRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();

  const { data: room, isLoading: roomLoading } = useRoomDetail(roomId!);
  const { data: messagesData } = useRoomMessages(roomId!);

  const deleteRoom = useDeleteRoom();
  const leaveRoom = useLeaveRoom();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const [showMembers, setShowMembers] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Load initial messages
  useEffect(() => {
    if (messagesData?.data) {
      setMessages(messagesData.data);
    }
  }, [messagesData]);

  // Socket events
  useEffect(() => {
    if (!socket || !roomId) return;

    socket.emit("room:join", roomId);

    socket.on("message:new", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("message:reaction:update", ({ messageId, reactions }: { messageId: string; reactions: Message["reactions"] }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, reactions } : m)),
      );
    });

    socket.on("typing", ({ userId, name }: { userId: string; name: string }) => {
      setTypingUsers((prev) => new Map(prev).set(userId, name));
    });

    socket.on("typing:stop", ({ userId }: { userId: string }) => {
      setTypingUsers((prev) => {
        const next = new Map(prev);
        next.delete(userId);
        return next;
      });
    });

    return () => {
      socket.emit("room:leave", roomId);
      socket.off("message:new");
      socket.off("message:reaction:update");
      socket.off("typing");
      socket.off("typing:stop");
    };
  }, [socket, roomId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() || !socket || !roomId) return;

    socket.emit("message:send", {
      roomId,
      content: newMessage.trim(),
      parentId: replyTo?.id,
    });

    setNewMessage("");
    setReplyTo(null);
    socket.emit("typing:stop", roomId);
  };

  const handleTyping = () => {
    if (!socket || !roomId) return;
    socket.emit("typing:start", roomId);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("typing:stop", roomId);
    }, 2000);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    if (!socket) return;
    socket.emit("message:reaction", { messageId, emoji });
  };

  const handleLeave = async () => {
    if (!roomId) return;
    await leaveRoom.mutateAsync(roomId);
    navigate("/rooms");
  };

  const handleDelete = async () => {
    if (!roomId || !confirm("Supprimer cette room ?")) return;
    await deleteRoom.mutateAsync(roomId);
    navigate("/rooms");
  };

  if (roomLoading) {
    return (
      <div className="flex justify-center py-20 relative z-10">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="text-center py-20 relative z-10">
        <p className="text-red-400">Room introuvable</p>
      </div>
    );
  }

  const isCreator = room.creatorId === user?.id;
  const isOrganizer = room.event.organizerId === user?.id;
  const canDelete = isCreator || isOrganizer || user?.role === "admin";

  const typingNames = Array.from(typingUsers.values()).filter(Boolean);

  return (
    <div className="animate-fade-in relative z-10 max-w-4xl mx-auto flex flex-col" style={{ height: "calc(100vh - 160px)" }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 rounded-t-2xl bg-slate-800/60 border border-slate-700/50 backdrop-blur-xl">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate("/rooms")} className="text-slate-400 hover:text-white transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div className="min-w-0">
            <h2 className="text-white font-semibold truncate">{room.name}</h2>
            <p className="text-slate-400 text-xs truncate">{room.event.title} &middot; {room.members.length} membres</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMembers(!showMembers)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button onClick={handleLeave} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
          {canDelete && (
            <button onClick={handleDelete} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Messages */}
        <div className="flex-1 flex flex-col bg-slate-900/40 border-x border-slate-700/50">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
              const isMe = msg.senderId === user?.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] ${isMe ? "order-2" : ""}`}>
                    {!isMe && (
                      <div className="flex items-center gap-2 mb-1 ml-1">
                        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 overflow-hidden">
                          {msg.sender.avatar ? (
                            <img src={msg.sender.avatar} alt={msg.sender.name} className="h-6 w-6 rounded-full object-cover" />
                          ) : (
                            msg.sender.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <p className="text-xs text-slate-300 font-medium">{msg.sender.name}</p>
                      </div>
                    )}
                    {msg.parent && (
                      <div className="text-xs bg-slate-700/50 rounded-lg px-3 py-1.5 mb-1 border-l-2 border-indigo-500 text-slate-400">
                        <span className="font-medium text-slate-300">{msg.parent.sender.name}</span>: {msg.parent.content.substring(0, 80)}
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-2.5 ${
                        isMe
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-800 text-slate-200 border border-slate-700/50"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                    <p className={`text-[11px] mt-1 ${isMe ? "text-right mr-1 text-slate-500" : "ml-1 text-slate-500"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    {/* Reactions */}
                    {msg.reactions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {msg.reactions.map((r) => (
                          <button
                            key={r.emoji}
                            onClick={() => handleReaction(msg.id, r.emoji)}
                            className={`text-xs px-2 py-0.5 rounded-full border transition ${
                              r.users.some((u) => u.id === user?.id)
                                ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300"
                                : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                            }`}
                          >
                            {r.emoji} {r.count}
                          </button>
                        ))}
                      </div>
                    )}
                    {/* Actions */}
                    <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => setReplyTo(msg)} className="text-xs text-slate-500 hover:text-slate-300 px-1">
                        Répondre
                      </button>
                      {EMOJI_OPTIONS.slice(0, 3).map((emoji) => (
                        <button key={emoji} onClick={() => handleReaction(msg.id, emoji)} className="text-xs hover:scale-125 transition">
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Typing indicator */}
          {typingNames.length > 0 && (
            <div className="px-4 py-1 text-xs text-slate-400">
              {typingNames.join(", ")} {typingNames.length > 1 ? "écrivent" : "écrit"}...
            </div>
          )}

          {/* Reply indicator */}
          {replyTo && (
            <div className="px-4 py-2 bg-slate-800/80 border-t border-slate-700/50 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Réponse à <span className="text-indigo-400 font-medium">{replyTo.sender.name}</span>: {replyTo.content.substring(0, 60)}
              </div>
              <button onClick={() => setReplyTo(null)} className="text-slate-500 hover:text-white">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-slate-700/50 bg-slate-800/40">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Écrire un message..."
                className="flex-1 px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <button
                onClick={handleSend}
                disabled={!newMessage.trim()}
                className="px-4 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Members sidebar */}
        {showMembers && (
          <div className="w-64 bg-slate-800/60 border-r border-slate-700/50 overflow-y-auto p-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Membres ({room.members.length})</h3>
            <div className="space-y-2">
              {room.members.map((m) => (
                <div key={m.id} className="flex items-center gap-2 p-2 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {m.user.avatar ? (
                      <img src={m.user.avatar} alt={m.user.name} className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      m.user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{m.user.name}</p>
                    {m.role !== "member" && (
                      <span className="text-xs text-indigo-400">{m.role}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
