import { useAdminDashboard } from "../../api/queries";

function formatMoneyEUR(v: number) {
  if (!Number.isFinite(v)) return "0,00€";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(v);
}

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

      {/* Summary */}
      <section className="rounded-3xl border border-slate-700 bg-slate-800/50 backdrop-blur shadow-xl shadow-indigo-500/5 overflow-hidden animate-slide-up hover:border-slate-600 transition-colors duration-300" style={{ animationDelay: '500ms' }}>
        <div className="p-6 sm:p-8 border-b border-indigo-500/10">
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Résumé plateforme
          </h2>
          <p className="text-sm text-slate-400 mt-1">Quelques indicateurs rapides</p>
        </div>

        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard
              title="Statut"
              value="Plateforme opérationnelle"
              hint="Monitoring et APIs OK"
            />
            <InfoCard
              title="Revenu moyen par billet"
              value={formatMoneyEUR(avgRevenuePerTicket)}
              hint="Calculé sur les billets vendus"
            />
          </div>

          <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-700 p-4 text-sm text-slate-300">
            <div className="font-semibold text-slate-100">Conseil</div>
            <div className="mt-1">
              Surveille le ratio <span className="font-semibold">billets vendus / événements</span> pour détecter
              rapidement les périodes creuses.
            </div>
          </div>
        </div>
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

function InfoCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4">
      <div className="text-xs font-semibold text-slate-400">{title}</div>
      <div className="mt-1 text-lg font-extrabold text-white">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
    </div>
  );
}