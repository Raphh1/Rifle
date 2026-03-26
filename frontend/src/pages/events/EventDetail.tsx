import { useNavigate, useParams } from "react-router-dom";
import { useBuyTicket, useDeleteEvent, useEventDetail } from "../../api/queries";
import { useAuth } from "../../context/useAuth";

export function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: event, isLoading, isError, error } = useEventDetail(id || "");
  const buyTicketMutation = useBuyTicket();
  const deleteEventMutation = useDeleteEvent();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 animate-fade-in relative z-10 min-h-[50vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent shadow-lg shadow-indigo-500/20"></div>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="container mx-auto p-4 relative z-10 pt-12">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-center text-red-500 backdrop-blur-xl animate-fade-in shadow-2xl">
          <svg className="w-10 h-10 mx-auto mb-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="font-medium text-lg">Erreur de chargement</p>
          <p className="text-sm mt-2 opacity-80">{error instanceof Error ? error.message : "Événement non trouvé"}</p>
        </div>
      </div>
    );
  }

  const canManageEvent = !!user && (user.role === "admin" || event.organizer?.id === user.id);

  const handleBuyTicket = async () => {
    try {
      const result = await buyTicketMutation.mutateAsync(event.id);
      alert(result.message);
      navigate("/tickets");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Impossible d'acheter ce billet.");
    }
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm("Supprimer cet événement ? Les billets actifs seront automatiquement annulés et remboursés.")) {
      return;
    }

    try {
      const result = await deleteEventMutation.mutateAsync(event.id);
      alert(result.message || "Événement supprimé. Les billets ont été remboursés.");
      navigate("/dashboard");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Impossible de supprimer cet événement.");
    }
  };

  const capacity = event.capacity ?? 0;
  const remaining = event.remaining ?? 0;
  const occupied = capacity > 0 ? Math.max(0, capacity - remaining) : 0;
  const pct = capacity > 0 ? Math.max(0, Math.min(100, Math.round((occupied / capacity) * 100))) : 0;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-5xl animate-fade-in relative z-10">
      <button
        onClick={() => navigate("/events")}
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors group"
      >
        <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Retour aux événements
      </button>

      <div className="relative rounded-3xl overflow-hidden border border-slate-700/50 bg-slate-900/40 backdrop-blur-xl shadow-2xl animate-slide-up">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-blue-500/5 pointer-events-none" />

        <div className="relative h-64 sm:h-80 md:h-96 w-full bg-slate-800">
          {event.imageUrl ? (
            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
              <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Aucune image disponible</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-90" />

          <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-slate-800/80 border border-slate-600/50 text-xs font-medium text-slate-300 backdrop-blur-md mb-3">
                <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(event.date).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg leading-tight">{event.title}</h1>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-3">
              <div className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-lg font-bold text-white shadow-xl shadow-indigo-500/20">
                {event.price === 0 ? "Gratuit" : `${event.price}€`}
              </div>

              {canManageEvent && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => navigate(`/events/${event.id}/edit`)}
                    className="rounded-xl border border-slate-600/60 bg-slate-900/60 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={handleDeleteEvent}
                    disabled={deleteEventMutation.isPending}
                    className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/20 transition disabled:opacity-50"
                  >
                    {deleteEventMutation.isPending ? "Suppression..." : "Supprimer"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 md:p-10 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                À propos de l&apos;événement
              </h2>
              <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed bg-slate-800/30 rounded-2xl p-6 border border-slate-700/40">
                {event.description ? (
                  <p className="whitespace-pre-wrap">{event.description}</p>
                ) : (
                  <p className="italic text-slate-500">Aucune description fournie par l&apos;organisateur.</p>
                )}
              </div>
            </div>

            {event.organizer && (
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                  {event.organizer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-slate-400">Organisé par</p>
                  <p className="text-base font-semibold text-white">{event.organizer.name}</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl bg-slate-800/40 border border-slate-700/50 p-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Détails pratiques</h3>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-white">Lieu</p>
                    <p className="text-sm text-slate-300">{event.location}</p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-white">Heure</p>
                    <p className="text-sm text-slate-300">
                      {new Date(event.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }).replace(":", "h")} (Heure locale)
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-slate-800/40 border border-slate-700/50 p-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Disponibilité</h3>

              <div className="flex items-end justify-between mb-2">
                <span className="text-2xl font-bold text-white">{remaining}</span>
                <span className="text-sm text-slate-400 mb-1">places restantes sur {capacity}</span>
              </div>

              <div className="h-2.5 w-full rounded-full bg-slate-700/50 overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    pct > 90 ? "bg-red-500" : pct > 75 ? "bg-orange-400" : "bg-gradient-to-r from-emerald-400 to-teal-500"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="text-right text-xs text-slate-500">{pct}% rempli</div>

              <div className="mt-8">
                <button
                  onClick={handleBuyTicket}
                  disabled={remaining === 0 || buyTicketMutation.isPending}
                  className="w-full inline-flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-blue-500 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  {buyTicketMutation.isPending ? "Traitement en cours..." : remaining === 0 ? "Complet" : "Réserver ma place"}
                </button>
                <p className="text-center text-xs text-slate-500 mt-3">Paiement simulé. Le billet est disponible immédiatement dans ton espace.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
