import { Link } from "react-router-dom";
import { useDeleteEvent, useOrganizerDashboard } from "../../api/queries";

function formatMoneyEUR(v: number) {
  if (Number.isNaN(v)) return "0,00€";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(v);
}

function clampPct(p: number) {
  if (!Number.isFinite(p)) return 0;
  return Math.max(0, Math.min(100, p));
}

export function OrganizerDashboard() {
  const { data: dashboard, isLoading, isError, error } = useOrganizerDashboard();
  const deleteEventMutation = useDeleteEvent();

  if (isLoading) {
    return (
      <div className="flex justify-center p-12 animate-fade-in">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (isError || !dashboard) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-500 backdrop-blur-sm animate-fade-in">
        <div className="flex items-center gap-3">
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Erreur : {error instanceof Error ? error.message : "Impossible de charger le tableau de bord"}</span>
        </div>
      </div>
    );
  }

  const handleDelete = async (eventId: string) => {
    if (!window.confirm("Supprimer cet événement ? Les billets actifs seront automatiquement annulés.")) {
      return;
    }

    try {
      const result = await deleteEventMutation.mutateAsync(eventId);
      alert(result.message);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Impossible de supprimer cet événement.");
    }
  };

  return (
    <div className="max-w-7xl animate-fade-in">
      {/* Header */}
      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Tableau de bord
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mt-2 font-medium">Vue d'ensemble de tes performances</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
          <KpiCard
            title="Événements créés"
            value={String(dashboard.eventsCount)}
            trend="+12%"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M5 11h14M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: "150ms" }}>
          <KpiCard
            title="Billets vendus"
            value={String(dashboard.ticketsSold)}
            trend="+24%"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l2 2 4-4M7 7h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2z" />
              </svg>
            }
          />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
          <KpiCard
            title="Revenu total"
            value={formatMoneyEUR(dashboard.revenues)}
            trend="+18%"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.5 0-3 .8-3 2s1.5 2 3 2 3 .8 3 2-1.5 2-3 2m0-10V6m0 12v-2M6 12a6 6 0 1112 0 6 6 0 01-12 0z" />
              </svg>
            }
          />
        </div>
      </div>

      {/* Table */}
      <section className="animate-slide-up overflow-hidden rounded-3xl border border-slate-700/50 bg-slate-900/40 backdrop-blur-xl shadow-2xl relative" style={{ animationDelay: "250ms" }}>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-blue-500/5 pointer-events-none" />
        
        <div className="p-6 sm:p-8 border-b border-slate-700/50 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-white">Mes événements</h2>
            <p className="text-sm text-slate-400 mt-1">Suivi des ventes et du remplissage</p>
          </div>
        </div>

        {dashboard.events.length === 0 ? (
          <div className="p-12 text-center text-slate-400 relative z-10 flex flex-col items-center">
            <div className="mx-auto h-16 w-16 mb-4 rounded-full bg-slate-800/80 border border-slate-700/50 flex items-center justify-center">
               <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
               </svg>
            </div>
            <p className="text-lg font-medium text-slate-300">Aucun événement</p>
            <p className="mt-1">Vous n&apos;avez pas encore créé d&apos;événement.</p>
          </div>
        ) : (
          <div className="overflow-x-auto relative z-10 scrollbar-custom">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-800/30">
                <tr className="text-left text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  <th className="px-6 py-4">Titre</th>
                  <th className="px-6 py-4 whitespace-nowrap">Billets vendus</th>
                  <th className="px-6 py-4">Capacité</th>
                  <th className="px-6 py-4">Revenus</th>
                  <th className="px-6 py-4 whitespace-nowrap">Remplissage</th>
                  <th className="px-6 py-4 whitespace-nowrap">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-700/50">
                {dashboard.events.map((event) => {
                  const pct = clampPct(event.capacity ? (event.ticketsSold / event.capacity) * 100 : 0);
                  return (
                    <tr key={event.id} className="group hover:bg-slate-800/40 transition-all duration-200">
                      <td className="px-6 py-5">
                        <div className="font-medium text-white group-hover:text-indigo-300 transition-colors">{event.title}</div>
                      </td>

                      <td className="px-6 py-5 text-slate-300">{event.ticketsSold}</td>

                      <td className="px-6 py-5 text-slate-300">{event.capacity}</td>

                      <td className="px-6 py-5 font-semibold text-emerald-400">
                        {formatMoneyEUR(event.revenues)}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3 min-w-[220px]">
                          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden border border-slate-700/30 shadow-inner">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-1000 ease-out relative"
                              style={{ width: `${pct}%` }}
                            >
                              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                            </div>
                          </div>
                          <div className="text-xs font-semibold text-slate-300 w-10 text-right">
                            {pct.toFixed(0)}%
                          </div>
                        </div>
                        <div className="mt-1.5 text-xs text-slate-500 font-medium">
                          {event.ticketsSold} / {event.capacity} vendus
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            to={`/events/${event.id}/edit`}
                            className="rounded-xl border border-slate-600/50 bg-slate-800/50 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
                          >
                            Modifier
                          </Link>
                          <button
                            onClick={() => handleDelete(event.id)}
                            disabled={deleteEventMutation.isPending}
                            className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20 transition disabled:opacity-50"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function KpiCard({
  title,
  value,
  trend,
  icon,
}: {
  title: string;
  value: string;
  trend?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-700/50 bg-slate-900/40 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-slate-600/50 hover:bg-slate-800/50 hover:shadow-2xl hover:shadow-indigo-500/10">
      <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br from-indigo-500/20 to-blue-500/20 blur-2xl transition-all duration-500 group-hover:bg-indigo-500/30 group-hover:scale-150" />
      <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-gradient-to-tr from-blue-500/10 to-transparent blur-xl transition-all duration-500 group-hover:bg-blue-500/20" />
      
      <div className="relative flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">{title}</div>
          <div className="mt-2 text-3xl font-extrabold text-white tracking-tight">{value}</div>
          {trend && (
            <div className="mt-2 inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
              <svg className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              {trend} ce mois
            </div>
          )}
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/80 border border-slate-700/50 shadow-inner group-hover:scale-110 group-hover:bg-indigo-500 group-hover:border-indigo-400 transition-all duration-300">
          {icon}
        </div>
      </div>
    </div>
  );
}
