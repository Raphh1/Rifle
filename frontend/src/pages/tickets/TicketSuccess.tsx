import { useParams, useNavigate, Link } from "react-router-dom";
import { useTicketDetail } from "../../api/queries";

export function TicketSuccess() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: ticket, isLoading, isError } = useTicketDetail(id || "");

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 animate-fade-in relative z-10 min-h-[50vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent shadow-lg shadow-indigo-500/20" />
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="container mx-auto p-4 relative z-10 pt-12">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-center text-red-500 backdrop-blur-xl animate-fade-in shadow-2xl">
          <p className="font-medium text-lg">Billet introuvable</p>
          <button onClick={() => navigate("/tickets")} className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 underline">
            Voir mes billets
          </button>
        </div>
      </div>
    );
  }

  const event = ticket.event;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-lg animate-fade-in relative z-10">
      <div className="rounded-3xl border border-slate-700/50 bg-slate-900/40 backdrop-blur-xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Success header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Réservation confirmée !</h1>
          <p className="text-sm text-white/80 mt-1">Ton billet a été envoyé par email</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Event info */}
          {event && (
            <div className="flex gap-4 items-start">
              <div className="h-20 w-20 rounded-2xl bg-slate-800 overflow-hidden shrink-0">
                {event.imageUrl ? (
                  <img src={event.imageUrl} alt={event.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-slate-500">
                    <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-white truncate">{event.title}</h2>
                <p className="text-sm text-slate-400 mt-1">
                  {new Date(event.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
                <p className="text-sm text-slate-400">
                  {new Date(event.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }).replace(":", "h")} — {event.location}
                </p>
              </div>
            </div>
          )}

          {/* QR Code */}
          {ticket.qrCode && (
            <div className="text-center">
              <div className="inline-flex flex-col items-center gap-3 rounded-2xl bg-white p-6">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(ticket.qrCode)}`}
                  alt="QR Code du billet"
                  className="h-[180px] w-[180px]"
                />
                <span className="text-xs font-mono text-slate-600 tracking-wider">{ticket.qrCode}</span>
              </div>
              <p className="text-xs text-slate-500 mt-3">Présente ce QR code à l'entrée de l'événement</p>
            </div>
          )}

          {/* Ticket recap */}
          <div className="rounded-2xl bg-slate-800/50 border border-slate-700/40 p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Statut</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Valide
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Prix payé</span>
              <span className="text-white font-semibold">
                {event?.price === 0 ? "Gratuit" : `${event?.price}€`}
              </span>
            </div>
            {ticket.purchaseDate && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Date d'achat</span>
                <span className="text-white">
                  {new Date(ticket.purchaseDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              to="/tickets"
              className="w-full inline-flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-blue-500 transition"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              Voir mes billets
            </Link>
            {event && (
              <Link
                to={`/events/${event.id}`}
                className="w-full inline-flex justify-center items-center gap-2 rounded-xl bg-slate-800 border border-slate-700/50 px-6 py-3.5 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition"
              >
                Retour à l'événement
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
