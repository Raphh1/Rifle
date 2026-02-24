import { useAdminDashboard } from "../../api/queries";

function formatMoneyEUR(v: number) {
  if (!Number.isFinite(v)) return "0,00€";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(v);
}

export function AdminDashboard() {
  const { data: dashboard, isLoading, isError, error } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600 shadow-sm">
        Chargement du tableau de bord…
      </div>
    );
  }

  if (isError || !dashboard) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
        Erreur : {error instanceof Error ? error.message : "Impossible de charger le tableau de bord"}
      </div>
    );
  }

  const avgRevenuePerTicket =
    dashboard.revenues / Math.max(dashboard.ticketsSold || 0, 1);

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Tableau de bord
        </h1>
        <p className="text-sm text-slate-500 mt-1">Vue globale de la plateforme</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Utilisateurs inscrits"
          value={String(dashboard.users)}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m8-4a4 4 0 10-8 0 4 4 0 008 0z" />
            </svg>
          }
        />
        <KpiCard
          title="Événements créés"
          value={String(dashboard.events)}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M5 11h14M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <KpiCard
          title="Billets vendus"
          value={String(dashboard.ticketsSold)}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2z" />
            </svg>
          }
        />
        <KpiCard
          title="Revenu total"
          value={formatMoneyEUR(dashboard.revenues)}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.5 0-3 .8-3 2s1.5 2 3 2 3 .8 3 2-1.5 2-3 2m0-10V6m0 12v-2M6 12a6 6 0 1112 0 6 6 0 01-12 0z" />
            </svg>
          }
        />
      </div>

      {/* Summary */}
      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-200">
          <h2 className="text-lg font-extrabold text-slate-900">Résumé plateforme</h2>
          <p className="text-sm text-slate-500 mt-1">Quelques indicateurs rapides</p>
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

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <div className="font-semibold text-slate-900">Conseil</div>
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
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-500">{title}</div>
          <div className="mt-1 text-2xl font-extrabold text-slate-900">{value}</div>
        </div>
        <div className="h-10 w-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
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
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold text-slate-500">{title}</div>
      <div className="mt-1 text-lg font-extrabold text-slate-900">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}