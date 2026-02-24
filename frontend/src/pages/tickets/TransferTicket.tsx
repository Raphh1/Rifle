import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTicketDetail, useTransferTicket } from "../../api/queries";

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

export function TransferTicket() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: ticket, isLoading, isError, error } = useTicketDetail(id!);
  const transferMutation = useTransferTicket();

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string>("");

  const canSubmit = useMemo(() => {
    return !!email.trim() && !submitting && !transferMutation.isPending;
  }, [email, submitting, transferMutation.isPending]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600 shadow-sm">
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!email.trim()) return;

    setSubmitting(true);
    try {
      await transferMutation.mutateAsync({ ticketId: id!, email: email.trim() });
      navigate("/tickets");
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Erreur lors du transfert";
      setFormError(String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Transférer le billet
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Envoie ce billet à un autre utilisateur par email
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        {/* Ticket recap */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {ticket.event ? (
              <>
                <div className="text-lg font-bold text-slate-900 truncate">{ticket.event.title}</div>
                <div className="mt-1 text-sm text-slate-600">
                  {formatDate(ticket.event.date)} • {ticket.event.location}
                </div>
              </>
            ) : (
              <div className="text-lg font-bold text-slate-900">Billet</div>
            )}
          </div>

          <StatusBadge status={ticket.status} />
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold text-slate-500">ID du billet</div>
            <div className="mt-1 font-mono text-sm text-slate-900 break-all">{ticket.id}</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold text-slate-500">Statut</div>
            <div className="mt-2">
              <StatusBadge status={ticket.status} />
            </div>
          </div>
        </div>

        {/* Error banner */}
        {formError && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <label className="block text-sm font-semibold text-slate-900" htmlFor="email">
              Email du destinataire
            </label>
            <div className="relative mt-1">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 0l-8 0m12-7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2z" />
              </svg>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="destinataire@example.com"
                required
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-slate-900 shadow-sm
                           placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400"
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Assure-toi que le destinataire a un compte (ou pourra en créer un).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/tickets")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700
                         shadow-sm hover:bg-slate-50 transition"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm
                         hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {submitting || transferMutation.isPending ? "Transfert..." : "Transférer le billet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}