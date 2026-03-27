import { Link } from "react-router-dom";
import QRCode from "react-qr-code";
import { useCancelTicket, useTransferTicket, useUserTickets } from "../../api/queries";
import { useAuth } from "../../context/useAuth";

function formatDate(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "paid"
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      : status === "pending"
      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
      : status === "used"
      ? "bg-slate-700/50 text-slate-400 border-slate-600/50"
      : "bg-red-500/10 text-red-400 border-red-500/20";

  const label =
    status === "paid"
      ? "Valide"
      : status === "pending"
      ? "En attente"
      : status === "used"
      ? "Utilisé"
      : "Annulé";

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-md ${styles}`}>
      {status === "paid" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>}
      {status === "used" && <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mr-1.5"></span>}
      {status === "cancelled" && <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5"></span>}
      {label}
    </span>
  );
}

export function TicketsList() {
  const { user } = useAuth();
  const { data: tickets, isLoading, isError, error } = useUserTickets();
  const transferMutation = useTransferTicket();
  const cancelTicketMutation = useCancelTicket();

  const handleTransfer = async (ticketId: string) => {
    const email = window.prompt("Entrez l'email du destinataire :");
    if (!email) return;

    if (!window.confirm(`Êtes-vous sûr de vouloir transférer ce billet à ${email} ?`)) return;

    try {
      const result = await transferMutation.mutateAsync({ ticketId, email });
      alert(result.message);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors du transfert.");
    }
  };

  const handleCancel = async (ticketId: string) => {
    if (!window.confirm("Demander le remboursement de ce billet ? Cette action annulera votre billet et est irréversible.")) {
      return;
    }

    try {
      const result = await cancelTicketMutation.mutateAsync(ticketId);
      alert(result.message || "Billet remboursé et annulé avec succès.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de l'annulation et du remboursement.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 animate-fade-in relative z-10 min-h-[50vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent shadow-lg shadow-indigo-500/20"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-4 relative z-10 pt-12">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-center text-red-500 backdrop-blur-xl animate-fade-in shadow-2xl">
          <p className="font-medium text-lg">Impossible de charger les billets</p>
          <p className="text-sm mt-2 opacity-80">{error instanceof Error ? error.message : "Erreur inconnue"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in relative z-10">
      <div className="mb-10 animate-slide-up">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Mes billets
        </h1>
        <p className="text-base text-slate-400 mt-2 font-medium">Retrouvez tous vos billets achetés et pass d&apos;accès.</p>
      </div>

      {!tickets || tickets.length === 0 ? (
        <div className="animate-slide-up rounded-3xl border border-slate-700/50 bg-slate-900/40 backdrop-blur-xl p-16 text-center shadow-2xl">
          <div className="mx-auto h-20 w-20 rounded-full bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <p className="text-white font-bold text-xl mb-2">Aucun billet trouvé</p>
          <p className="text-slate-400 max-w-md mx-auto mb-8">Vous n&apos;avez pas encore acheté de billets. Découvrez les événements disponibles.</p>

          <Link
            to="/events"
            className="inline-flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-blue-500 transition-all transform hover:-translate-y-0.5"
          >
            Découvrir les événements
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {tickets.map((ticket, i) => {
            const canTransfer = ticket.status === "paid" || ticket.status === "pending";
            const canCancel = ticket.status === "paid" || ticket.status === "pending";
            const canValidate = (user?.role === "organizer" || user?.role === "admin") && ticket.status === "paid";

            return (
              <div
                key={ticket.id}
                className="group rounded-3xl border border-slate-700/50 bg-slate-900/40 backdrop-blur-xl p-6 shadow-2xl flex flex-col transform transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-indigo-500/10 animate-slide-up"
                style={{ animationDelay: `${(i % 10) * 50}ms` }}
              >
                <div className="flex justify-between items-start mb-6">
                  <StatusBadge status={ticket.status} />
                  <div className="text-xs font-mono text-slate-500 bg-slate-800/50 px-2 py-1 rounded-md border border-slate-700/50">#{ticket.id.slice(0, 8).toUpperCase()}</div>
                </div>

                {ticket.event ? (
                  <div className="mb-6 flex-1">
                    <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-indigo-400 transition-colors">
                      {ticket.event.title}
                    </h3>

                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-slate-300">
                        <svg className="w-4 h-4 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(ticket.event.date)}
                      </div>

                      <div className="flex items-center text-sm text-slate-300">
                        <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">{ticket.event.location}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 flex-1">
                    <h3 className="text-lg font-bold text-white mb-2 leading-tight">Événement inconnu</h3>
                  </div>
                )}

                <div className="relative mx-auto bg-white p-4 rounded-2xl shadow-inner mb-6 transition-transform group-hover:scale-105 duration-500 w-fit">
                  <div className="absolute -left-3 top-1/2 -mt-3 w-6 h-6 bg-slate-900 rounded-full"></div>
                  <div className="absolute -right-3 top-1/2 -mt-3 w-6 h-6 bg-slate-900 rounded-full"></div>
                  <QRCode value={ticket.qrCode || "INVALID"} size={140} level="H" className={ticket.status !== "paid" ? "opacity-30" : ""} />
                  {ticket.status !== "paid" && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-slate-900/80 text-white font-bold px-4 py-1 rounded-full border border-slate-700/50 backdrop-blur-sm -rotate-12 shadow-lg">
                        {ticket.status === "used" ? "UTILISÉ" : ticket.status === "cancelled" ? "ANNULÉ" : "EN ATTENTE"}
                      </div>
                    </div>
                  )}
                </div>

                {(canTransfer || canCancel || canValidate) && (
                  <div className={`mt-auto grid gap-3 pt-4 border-t border-slate-700/50 ${canValidate ? "grid-cols-3" : "grid-cols-2"}`}>
                    {canValidate && (
                      <Link
                        to={`/tickets/${ticket.id}/validate`}
                        className="flex items-center justify-center gap-2 rounded-xl bg-slate-800/80 border border-slate-600/50 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 hover:border-slate-500 transition-all"
                      >
                        Valider
                      </Link>
                    )}

                    {canTransfer && (
                      <button
                        onClick={() => handleTransfer(ticket.id)}
                        className="flex items-center justify-center gap-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-3 py-2.5 text-sm font-semibold shadow-sm hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all"
                      >
                        Offrir
                      </button>
                    )}

                    {canCancel && (
                      <button
                        onClick={() => handleCancel(ticket.id)}
                        disabled={cancelTicketMutation.isPending}
                        className="flex items-center justify-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 px-3 py-2.5 text-sm font-semibold shadow-sm hover:bg-red-500/20 transition-all disabled:opacity-50"
                      >
                        Se faire rembourser
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
