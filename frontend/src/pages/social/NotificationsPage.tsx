import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from "../../api/socialQueries";
import type { NotificationType } from "../../types/social";

const NOTIF_ICONS: Record<NotificationType, string> = {
  friend_request: "👤",
  friend_accepted: "🤝",
  room_invite: "💬",
  new_message: "✉️",
  event_reminder: "📅",
  review_received: "⭐",
};

export function NotificationsPage() {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { data, isLoading } = useNotifications(page);
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const handleClick = (notification: { id: string; read: boolean; type: NotificationType; data?: Record<string, string> }) => {
    if (!notification.read) {
      markAsRead.mutate(notification.id);
    }
    // Navigate based on type
    if (notification.data?.roomId) {
      navigate(`/rooms/${notification.data.roomId}`);
    } else if (notification.data?.eventId) {
      navigate(`/events/${notification.data.eventId}`);
    } else if (notification.type === "friend_request" || notification.type === "friend_accepted") {
      navigate("/friends");
    }
  };

  return (
    <div className="animate-fade-in relative z-10 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Notifications</h1>
        {data?.data?.some((n) => !n.read) && (
          <button
            onClick={() => markAllAsRead.mutate()}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition"
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
      ) : !data?.data?.length ? (
        <div className="text-center py-20">
          <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p className="text-slate-400 text-lg">Aucune notification</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.data.map((notif) => (
            <button
              key={notif.id}
              onClick={() => handleClick(notif)}
              className={`w-full text-left p-4 rounded-2xl border transition ${
                notif.read
                  ? "bg-slate-800/30 border-slate-700/30 hover:bg-slate-800/50"
                  : "bg-slate-800/60 border-indigo-500/20 hover:bg-slate-800/80"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{NOTIF_ICONS[notif.type] || "🔔"}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`font-medium text-sm ${notif.read ? "text-slate-300" : "text-white"}`}>
                      {notif.title}
                    </p>
                    {!notif.read && <span className="h-2 w-2 rounded-full bg-indigo-500" />}
                  </div>
                  {notif.body && (
                    <p className="text-sm text-slate-400 mt-0.5 truncate">{notif.body}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(notif.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </button>
          ))}

          {data.meta.last_page > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: data.meta.last_page }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    page === i + 1
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
