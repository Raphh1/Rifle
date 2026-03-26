import { useAdminDashboard } from "../../api/queries";

function formatMoneyEUR(v: number) {
  if (!Number.isFinite(v)) return "0,00€";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(v);
}

function clampPct(p: number) {
  if (!Number.isFinite(p)) return 0;
  return Math.max(0, Math.min(100, p));
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "En attente", color: "bg-yellow-500" },
  paid: { label: "Payés", color: "bg-emerald-500" },
  used: { label: "Utilisés", color: "bg-indigo-500" },
  cancelled: { label: "Annulés", color: "bg-red-500" },
};

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  user: { label: "Utilisateurs", color: "text-slate-300" },
  organizer: { label: "Organisateurs", color: "text-emerald-400" },
  admin: { label: "Admins", color: "text-indigo-400" },
};

export function AdminDashboard() {
  const { data: dashboard, isLoading, isError, error } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-700 bg-slate-800 p-10 text-center text-slate-400 shadow-sm">
        Chargement du tableau de bord…
      </div>
    );
  }

  if (isError || !dashboard) {
    return (
      <div className="rounded-2xl border border-red-900 bg-red-950 p-6 text-red-400 shadow-sm">
        Erreur : {error instanceof Error ? error.message : "Impossible de charger le tableau de bord"}
      </div>
    );
  }

  const avgRevenuePerTicket =
    dashboard.revenues / Math.max(dashboard.ticketsSold || 0, 1);

  const totalTickets = Object.values(dashboard.ticketsByStatus).reduce((s, n) => s + n, 0);

  return (
    <div className="max-w-7xl animate-fade-in">
      {/* Header */}
      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Tableau de bord Global
        </h1>
        <p className="text-sm font-medium text-slate-400 mt-2">Vue globale de la plateforme</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <KpiCard
            title="Utilisateurs inscrits"
            value={String(dashboard.users)}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m8-4a4 4 0 10-8 0 4 4 0 008 0z" />
              </svg>
            }
          />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <KpiCard
            title="Événements créés"
            value={String(dashboard.events)}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M5 11h14M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <KpiCard
            title="Billets vendus"
            value={String(dashboard.ticketsSold)}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2z" />
            </svg>
            }
          />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
          <KpiCard
            title="Revenu total"
            value={formatMoneyEUR(dashboard.revenues)}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.5 0-3 .8-3 2s1.5 2 3 2 3 .8 3 2-1.5 2-3 2m0-10V6m0 12v-2M6 12a6 6 0 1112 0 6 6 0 01-12 0z" />
              </svg>
            }
          />
        </div>
      </div>

      {/* Secondary KPIs row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="animate-slide-up" style={{ animationDelay: '450ms' }}>
          <KpiCard
            title="Billets annulés"
            value={String(dashboard.cancelledTickets)}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            }
          />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '500ms' }}>
          <KpiCard
            title="Organisateurs"
            value={String(dashboard.usersByRole["organizer"] ?? 0)}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '550ms' }}>
          <KpiCard
            title="Revenu moyen / billet"
            value={formatMoneyEUR(avgRevenuePerTicket)}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
        </div>
      </div>

      {/* Users by role + Tickets by status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Users by role */}
        <section className="rounded-3xl border border-slate-700 bg-slate-800/50 backdrop-blur shadow-xl shadow-indigo-500/5 overflow-hidden animate-slide-up hover:border-slate-600 transition-colors duration-300" style={{ animationDelay: '600ms' }}>
          <div className="p-6 border-b border-indigo-500/10">
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              Répartition des utilisateurs
            </h2>
            <p className="text-sm text-slate-400 mt-1">Par rôle</p>
          </div>
          <div className="p-6 space-y-3">
            {Object.entries(ROLE_LABELS).map(([role, { label, color }]) => {
              const count = dashboard.usersByRole[role] ?? 0;
              const pct = clampPct(dashboard.users ? (count / dashboard.users) * 100 : 0);
              return (
                <div key={role}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-semibold ${color}`}>{label}</span>
                    <span className="text-sm font-bold text-white">{count}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-1000"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Tickets by status */}
        <section className="rounded-3xl border border-slate-700 bg-slate-800/50 backdrop-blur shadow-xl shadow-indigo-500/5 overflow-hidden animate-slide-up hover:border-slate-600 transition-colors duration-300" style={{ animationDelay: '650ms' }}>
          <div className="p-6 border-b border-indigo-500/10">
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Répartition des billets
            </h2>
            <p className="text-sm text-slate-400 mt-1">Par statut</p>
          </div>
          <div className="p-6 space-y-3">
            {Object.entries(STATUS_LABELS).map(([status, { label, color }]) => {
              const count = dashboard.ticketsByStatus[status] ?? 0;
              const pct = clampPct(totalTickets ? (count / totalTickets) * 100 : 0);
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                      <span className="text-sm font-semibold text-slate-300">{label}</span>
                    </div>
                    <span className="text-sm font-bold text-white">{count}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color} transition-all duration-1000`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Top events table */}
      <section className="animate-slide-up overflow-hidden rounded-3xl border border-slate-700/50 bg-slate-900/40 backdrop-blur-xl shadow-2xl relative" style={{ animationDelay: '700ms' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-blue-500/5 pointer-events-none" />

        <div className="p-6 sm:p-8 border-b border-slate-700/50 relative z-10">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            Top événements
          </h2>
          <p className="text-sm text-slate-400 mt-1">Les 5 événements les plus vendus</p>
        </div>

        {dashboard.topEvents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 relative z-10 flex flex-col items-center">
            <div className="mx-auto h-16 w-16 mb-4 rounded-full bg-slate-800/80 border border-slate-700/50 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-lg font-medium text-slate-300">Aucun événement</p>
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
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {dashboard.topEvents.map((event) => {
                  const pct = clampPct(event.capacity ? (event.ticketsSold / event.capacity) * 100 : 0);
                  return (
                    <tr key={event.id} className="group hover:bg-slate-800/40 transition-all duration-200">
                      <td className="px-6 py-5">
                        <div className="font-medium text-white group-hover:text-indigo-300 transition-colors">{event.title}</div>
                      </td>
                      <td className="px-6 py-5 text-slate-300">{event.ticketsSold}</td>
                      <td className="px-6 py-5 text-slate-300">{event.capacity}</td>
                      <td className="px-6 py-5 font-semibold text-emerald-400">{formatMoneyEUR(event.revenues)}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3 min-w-[180px]">
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
                      <td className="px-6 py-5 text-slate-400 text-xs whitespace-nowrap">
                        {new Date(event.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
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
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group rounded-3xl border border-slate-700 bg-slate-800/80 backdrop-blur-sm p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="flex items-center justify-between relative z-10">
        <div>
          <div className="text-sm font-semibold text-slate-400 group-hover:text-slate-300 transition-colors">{title}</div>
          <div className="mt-1 text-3xl font-black text-white tracking-tight">{value}</div>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-slate-900/50 border border-slate-700 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/10 flex items-center justify-center transition-all duration-300">
          {icon}
        </div>
      </div>
    </div>
  );
}
