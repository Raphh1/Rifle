import { Link } from "react-router-dom";

export type EventCardModel = {
  id: string | number;
  title: string;
  date: string | Date;
  price: number;
  location: string;
  capacity: number;
  remaining: number;
  imageUrl?: string | null;
};

function formatDate(d: string | Date) {
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function EventCard({ event }: { event: EventCardModel }) {
  const capacity = event.capacity ?? 0;
  const remaining = event.remaining ?? 0;

  const occupied = capacity > 0 ? Math.max(0, capacity - remaining) : 0;
  const pct = capacity > 0 ? Math.max(0, Math.min(100, Math.round((occupied / capacity) * 100))) : 0;

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

        {/* Price badge (glass) */}
        <div className="absolute right-3 top-3">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-gradient-to-r from-indigo-600 to-blue-500 text-xs font-semibold text-white shadow-lg">
            <span className="whitespace-nowrap">{event.price}€</span>
          </div>
        </div>

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