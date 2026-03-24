import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { useTicketDetail, useValidateTicket } from "../../api/queries";

function formatDate(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "paid"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "pending"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : status === "used"
      ? "bg-slate-700 text-white border-slate-700"
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

export function TicketValidate() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: ticket, isLoading, isError, error } = useTicketDetail(id!);
  const validateMutation = useValidateTicket();

  const canValidate = useMemo(() => {
    return ticket?.status === "paid" && !!ticket?.qrCode;
  }, [ticket]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-700 bg-slate-800 p-10 text-center text-slate-400 shadow-sm">
        Chargement du billet…
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
        Erreur : {error instanceof Error ? error.message : "Billet non trouvé"}
      </div>
    );
  }

  const handleValidate = async () => {
    try {
      await validateMutation.mutateAsync({ qrCode: ticket.qrCode });
      navigate("/tickets");
    } catch (err) {
      console.error("Erreur lors de la validation:", err);
      alert("Erreur lors de la validation du billet.");
    }
  };

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Valider le billet
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Vérifie les informations puis valide le billet
        </p>
      </div>

      <div className="rounded-3xl border border-slate-700 bg-slate-800 p-6 sm:p-8 shadow-sm">
        {/* Event infos */}
        {ticket.event && (
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                {ticket.event.title}
              </h2>
              <div className="mt-1 text-sm text-slate-400">
                {formatDate(ticket.event.date)} • {ticket.event.location}
              </div>
            </div>
            <StatusBadge status={ticket.status} />
          </div>
        )}

        {/* QR */}
        <div className="mt-6 flex justify-center">
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4 shadow-sm">
            <QRCode value={ticket.qrCode || "INVALID"} size={180} />
          </div>
        </div>

        {/* Details */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-700 p-4">
            <div className="text-xs font-semibold text-slate-400">ID du billet</div>
            <div className="mt-1 font-mono text-sm text-white break-all">{ticket.id}</div>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-700 p-4">
            <div className="text-xs font-semibold text-slate-400">Statut</div>
            <div className="mt-2">
              <StatusBadge status={ticket.status} />
            </div>

            {ticket.status !== "paid" && (
              <div className="mt-2 text-xs text-slate-400">
                Seuls les billets <span className="font-semibold">payés</span> peuvent être validés.
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={() => navigate("/tickets")}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white
                       shadow-sm hover:bg-slate-700 transition"
          >
            Retour
          </button>

          <button
            onClick={handleValidate}
            disabled={!canValidate || validateMutation.isPending}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm
                       hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {validateMutation.isPending ? "Validation en cours…" : "Valider le billet"}
          </button>
        </div>
      </div>
    </div>
  );
}