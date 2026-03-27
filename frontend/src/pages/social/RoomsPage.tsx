import { Link } from "react-router-dom";
import { useMyRooms } from "../../api/socialQueries";

export function RoomsPage() {
  const { data: rooms, isLoading } = useMyRooms();

  return (
    <div className="animate-fade-in relative z-10 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Mes rooms</h1>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
      ) : !rooms?.length ? (
        <div className="text-center py-20">
          <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-slate-400 text-lg">Aucune room</p>
          <p className="text-slate-500 text-sm mt-2">Rejoignez des rooms depuis la page d'un événement</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rooms.map((room) => (
            <Link
              key={room.id}
              to={`/rooms/${room.id}`}
              className="relative block overflow-hidden rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/70 hover:bg-slate-800/70 hover:scale-[1.02] transition-all duration-200 group"
            >
              {/* Creator photo bleeding from left */}
              <div className="absolute inset-y-0 left-0 w-32">
                {room.creator.avatar ? (
                  <img
                    src={room.creator.avatar}
                    alt={room.creator.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center">
                    <span className="text-white text-3xl font-bold opacity-60">
                      {room.creator.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {/* Gradient fade from photo into card */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-900/60 to-slate-900/95" />
              </div>

              {/* Content */}
              <div className="relative flex items-center justify-between p-4 pl-36">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-white font-semibold truncate min-w-0">{room.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 leading-tight ${
                      room.visibility === "public"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-amber-500/20 text-amber-400"
                    }`}>
                      {room.visibility === "public" ? "Public" : "Privé"}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5">Par {room.creator.name}</p>
                  {room.event && (
                    <p className="text-slate-400 text-sm mt-1 truncate">{room.event.title}</p>
                  )}
                </div>
                <div className="flex flex-col items-end shrink-0 ml-4 gap-1.5">
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {room.membersCount}
                  </div>
                  {(room.unreadCount ?? 0) > 0 && (
                    <span className="bg-indigo-600 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[22px] text-center leading-tight">
                      {(room.unreadCount ?? 0) > 10 ? "10+" : room.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
