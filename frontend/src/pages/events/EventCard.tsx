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
      className="group block rounded-2xl overflow-hidden border border-slate-800 bg-slate-800 shadow-sm
                 transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-xl
                 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100 focus-visible:border-indigo-400"
    >
      <div className="relative h-52 bg-slate-100">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">
            No image
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-90" />

        {/* Price badge */}
        <div className="absolute right-3 top-3">
          <span className="inline-flex items-center rounded-full bg-slate-600/90 px-3 py-1 text-xs font-semibold text-slate-100 shadow-sm">
            {event.price}€
          </span>
        </div>

        {/* Title + date */}
        <div className="absolute left-4 bottom-4 right-4 text-white">
          <div className="text-sm font-semibold drop-shadow-sm leading-snug">
            {event.title}
          </div>
          <div className="mt-1 text-xs text-white/85">{formatDate(event.date)}</div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm text-slate-200 font-medium truncate">{event.location}</div>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-200">
              <span className="inline-flex items-center rounded-full bg-slate-700 px-2 py-0.5">
                {pct}% rempli
              </span>
              {capacity > 0 ? (
                <span>
                  {occupied}/{capacity} places
                </span>
              ) : (
                <span>Capacité non définie</span>
              )}
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-xs text-slate-400">Restantes</div>
            <div className="text-sm font-semibold text-slate-900">{remaining}</div>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}