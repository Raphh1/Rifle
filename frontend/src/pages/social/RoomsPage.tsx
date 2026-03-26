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
              className="block p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800/80 transition group"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold truncate">{room.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      room.visibility === "public"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-amber-500/20 text-amber-400"
                    }`}>
                      {room.visibility === "public" ? "Public" : "Privé"}
                    </span>
                  </div>
                  {room.event && (
                    <p className="text-slate-400 text-sm mt-1 truncate">{room.event.title}</p>
                  )}
                  {room.lastMessage && (
                    <p className="text-slate-500 text-sm mt-2 truncate">
                      <span className="text-slate-400">{room.lastMessage.sender.name}:</span>{" "}
                      {room.lastMessage.content}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0 ml-4">
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {room.membersCount}
                  </div>
                  {room.lastMessage && (
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(room.lastMessage.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
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
