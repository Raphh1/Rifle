import { useUserTickets, useTransferTicket } from "../../api/queries";
import { Link } from "react-router-dom";
import QRCode from "react-qr-code";

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
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "pending"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : status === "used"
      ? "bg-slate-100 text-slate-600 border-slate-200"
      : "bg-red-50 text-red-700 border-red-200";

  const label =
    status === "paid"
      ? "Payé"
      : status === "pending"
      ? "En attente"
      : status === "used"
      ? "Utilisé"
      : status;

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles}`}>
      {label}
    </span>
  );
}

export function TicketsList() {
  const { data: tickets, isLoading, isError, error } = useUserTickets();
  const transferMutation = useTransferTicket();

  const handleTransfer = async (ticketId: string) => {
    const email = window.prompt("Entrez l'email du destinataire :");
    if (!email) return;

    if (!confirm(`Êtes-vous sûr de vouloir transférer ce billet à ${email} ?`)) return;

    try {
      await transferMutation.mutateAsync({ ticketId, email });
      alert("Billet transféré avec succès !");
    } catch (err) {
      alert("Erreur lors du transfert : " + (err instanceof Error ? err.message : "Inconnue"));
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600 shadow-sm">
        Chargement de vos billets…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
        Erreur : {error instanceof Error ? error.message : "Impossible de charger les billets"}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Mes billets
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Retrouvez tous vos billets achetés
        </p>
      </div>

      {!tickets || tickets.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-slate-700 font-semibold">Vous n&apos;avez pas encore acheté de billets.</p>

          <Link
            to="/events"
            className="mt-4 inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2.5 text-white font-semibold
                       shadow-sm hover:bg-indigo-700 transition"
          >
            Découvrir les événements
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col
                         transition hover:shadow-md"
            >
              {ticket.event && (
                <div className="mb-4">
                  <h3 className="text-base font-bold text-slate-900">
                    {ticket.event.title}
                  </h3>

                  <div className="mt-1 text-sm text-slate-500">
                    {formatDate(ticket.event.date)}
                  </div>

                  <div className="text-sm text-slate-600">
                    {ticket.event.location}
                  </div>
                </div>
              )}

              {/* QR */}
              <div className="flex justify-center my-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <QRCode value={ticket.qrCode || "INVALID"} size={120} />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-3">
                <div className="text-xs text-slate-500">
                  Billet #{ticket.id.slice(0, 8)}
                </div>

                <StatusBadge status={ticket.status} />
              </div>

              {/* Actions */}
              {ticket.status === "paid" && (
                <div className="mt-4 flex gap-2">
                  <Link
                    to={`/tickets/${ticket.id}/validate`}
                    className="flex-1 text-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold
                               text-slate-700 shadow-sm hover:bg-slate-50 transition"
                  >
                    Valider
                  </Link>

                  <button
                    onClick={() => handleTransfer(ticket.id)}
                    className="flex-1 rounded-xl bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm
                               hover:bg-red-600 transition"
                  >
                    Transférer
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}