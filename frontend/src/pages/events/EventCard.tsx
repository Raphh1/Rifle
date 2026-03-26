import { Link } from "react-router-dom";
import type { EventCategory } from "../../types/api";
import { useAuth } from "../../context/useAuth";
import { useFavoriteStatus, useToggleFavorite } from "../../api/socialQueries";

const CATEGORY_LABELS: Record<EventCategory, string> = {
  concert: "Concert",
  conference: "Conférence",
  festival: "Festival",
  sport: "Sport",
  theatre: "Théâtre",
  exposition: "Exposition",
  autre: "Autre",
};

const CATEGORY_COLORS: Record<EventCategory, string> = {
  concert: "from-pink-500 to-rose-500",
  conference: "from-cyan-500 to-blue-500",
  festival: "from-amber-500 to-orange-500",
  sport: "from-emerald-500 to-green-500",
  theatre: "from-purple-500 to-violet-500",
  exposition: "from-teal-500 to-cyan-500",
  autre: "from-slate-500 to-gray-500",
};

export type EventCardModel = {
  id: string | number;
  title: string;
  date: string | Date;
  price: number;
  location: string;
  capacity: number;
  remaining: number;
  category?: EventCategory;
  imageUrl?: string | null;
};

function formatDate(d: string | Date) {
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function EventCard({ event }: { event: EventCardModel }) {
  const { user } = useAuth();
  const eventId = String(event.id);
  const { data: favStatus } = useFavoriteStatus(user ? eventId : "");
  const toggleFav = useToggleFavorite();

  const capacity = event.capacity ?? 0;
  const remaining = event.remaining ?? 0;
  const occupied = capacity > 0 ? Math.max(0, capacity - remaining) : 0;
  const pct = capacity > 0 ? Math.max(0, Math.min(100, Math.round((occupied / capacity) * 100))) : 0;

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    toggleFav.mutate({ eventId, isFavorited: favStatus?.isFavorited ?? false });
  };

  return (
    <Link
      to={`/events/${event.id}`}
      className="group block rounded-3xl overflow-hidden border border-slate-700/50 bg-slate-900/40 backdrop-blur-xl shadow-2xl
                 transform transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] focus:outline-none"
    >
      {/* Image / Hero */}
      <div className="relative h-56 sm:h-52 bg-slate-800">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">
            Pas d'image
          </div>
        )}

        {/* soft vignette + gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-90 pointer-events-none" />

        {/* Badges */}
        <div className="absolute right-3 top-3 flex flex-col items-end gap-2">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-gradient-to-r from-indigo-600 to-blue-500 text-xs font-semibold text-white shadow-lg">
            <span className="whitespace-nowrap">{event.price}€</span>
          </div>
          {event.category && event.category !== "autre" && (
            <div className={`inline-flex items-center rounded-full px-2.5 py-1 bg-gradient-to-r ${CATEGORY_COLORS[event.category]} text-xs font-semibold text-white shadow-lg`}>
              {CATEGORY_LABELS[event.category]}
            </div>
          )}
        </div>

        {/* Favorite button */}
        {user && (
          <button
            onClick={handleFavorite}
            className="absolute left-3 top-3 p-2 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition group/fav"
          >
            <svg
              className={`w-5 h-5 transition ${
                favStatus?.isFavorited
                  ? "text-red-500 fill-red-500"
                  : "text-white/70 group-hover/fav:text-red-400"
              }`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              fill={favStatus?.isFavorited ? "currentColor" : "none"}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}

        {/* Title + date */}
        <div className="absolute left-4 bottom-4 right-4 text-white">
          <div className="text-lg font-semibold drop-shadow-md truncate">{event.title}</div>
          <div className="mt-1 text-xs text-white/80">{formatDate(event.date)}</div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm text-slate-200 font-medium truncate">{event.location}</div>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-300">
              <span className="inline-flex items-center rounded-full bg-slate-800/60 px-2 py-0.5 text-slate-200">
                {pct}% rempli
              </span>
              {capacity > 0 ? (
                <span className="text-slate-300">{occupied}/{capacity} places</span>
              ) : (
                <span className="text-slate-400">Capacité non définie</span>
              )}
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-xs text-slate-400">Restantes</div>
            <div className="text-sm font-semibold text-white">{remaining}</div>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4" aria-hidden>
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
