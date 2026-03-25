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
      : status;

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-md ${styles}`}>
      {status === 'paid' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>}
      {status === 'used' && <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mr-1.5"></span>}
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
      <div className="flex justify-center py-20 animate-fade-in relative z-10 min-h-[50vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent shadow-lg shadow-indigo-500/20"></div>
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="container mx-auto p-4 relative z-10 pt-12">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-center text-red-500 backdrop-blur-xl animate-fade-in shadow-2xl">
          <p className="font-medium text-lg">Billet introuvable</p>
          <p className="text-sm mt-2 opacity-80">{error instanceof Error ? error.message : "Erreur inconnue"}</p>
        </div>
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
    <div className="max-w-2xl mx-auto py-8 animate-fade-in relative z-10 px-4 sm:px-6">
      
      <button 
        onClick={() => navigate('/tickets')} 
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors group"
      >
        <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Retour aux billets
      </button>

      {/* Header */}
      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Valider le billet
        </h1>
        <p className="text-base text-slate-400 mt-2 font-medium">
          Présentez ce billet à l'entrée ou validez-le manuellement.
        </p>
      </div>

      <div className="relative rounded-3xl border border-slate-700/50 bg-slate-900/40 backdrop-blur-xl p-6 sm:p-8 md:p-10 shadow-2xl animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-blue-500/5 rounded-3xl pointer-events-none" />
        
        <div className="relative z-10">
          {/* Event infos */}
          {ticket.event && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/30 p-6 rounded-2xl border border-slate-700/40">
              <div className="min-w-0 flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">
                  {ticket.event.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {formatDate(ticket.event.date)}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {ticket.event.location}
                  </span>
                </div>
              </div>
              <StatusBadge status={ticket.status} />
            </div>
          )}

          {/* QR */}
          <div className="mt-8 flex justify-center">
            <div className="relative bg-white p-6 rounded-3xl shadow-inner inline-block">
              <div className="absolute -left-4 top-1/2 -mt-4 w-8 h-8 bg-slate-900 rounded-full border-r border-slate-700/50"></div>
              <div className="absolute -right-4 top-1/2 -mt-4 w-8 h-8 bg-slate-900 rounded-full border-l border-slate-700/50"></div>
              
              <QRCode 
                value={ticket.qrCode || "INVALID"} 
                size={220} 
                level="H"
                className={ticket.status === 'used' ? "opacity-20" : ""}
              />
              
              {ticket.status === 'used' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-slate-900/90 text-white font-bold px-6 py-2 rounded-full border border-slate-700/50 backdrop-blur-md -rotate-12 shadow-2xl text-xl tracking-widest">
                    UTILISÉ
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-5 shadow-inner">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">ID du billet</div>
              <div className="font-mono text-sm text-white break-all bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                {ticket.id}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-5 shadow-inner">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Opération</div>
              <div className="mt-3">
                <StatusBadge status={ticket.status} />
              </div>

              {ticket.status !== "paid" && (
                <div className="mt-3 text-sm text-slate-400 flex items-start gap-2 bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                  <svg className="w-5 h-5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <span>Action bloquée. Billet non valide pour ce scan.</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 pt-6 border-t border-slate-700/50 flex flex-col sm:flex-row gap-4 sm:justify-end items-center">
            <button
              onClick={() => navigate("/tickets")}
              className="w-full sm:w-auto rounded-xl border border-slate-600/50 bg-slate-800/50 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
            >
              Fermer
            </button>

            <button
              onClick={handleValidate}
              disabled={!canValidate || validateMutation.isPending}
              className="w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-400 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {validateMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Validation…
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Confirmer la validation
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}