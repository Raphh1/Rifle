import { useOrganizerDashboard } from "../../api/queries";

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

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Tableau de bord
        </h1>
        <p className="text-sm text-slate-500 mt-1">Vue d’ensemble de tes performances</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KpiCard
          title="Événements créés"
          value={String(dashboard.eventsCount)}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M5 11h14M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <KpiCard
          title="Billets vendus"
          value={String(dashboard.ticketsSold)}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l2 2 4-4M7 7h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2z" />
            </svg>
          }
        />
        <KpiCard
          title="Revenu total"
          value={formatMoneyEUR(dashboard.revenues)}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.5 0-3 .8-3 2s1.5 2 3 2 3 .8 3 2-1.5 2-3 2m0-10V6m0 12v-2M6 12a6 6 0 1112 0 6 6 0 01-12 0z" />
            </svg>
          }
        />
      </div>

      {/* Table */}
      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-200">
          <h2 className="text-lg font-extrabold text-slate-900">Mes événements</h2>
          <p className="text-sm text-slate-500 mt-1">Suivi des ventes et du remplissage</p>
        </div>

        {dashboard.events.length === 0 ? (
          <div className="p-8 text-slate-600">
            Vous n&apos;avez pas encore créé d&apos;événement.
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-slate-600">
                  <th className="px-6 py-3 font-semibold">Titre</th>
                  <th className="px-6 py-3 font-semibold whitespace-nowrap">Billets vendus</th>
                  <th className="px-6 py-3 font-semibold">Capacité</th>
                  <th className="px-6 py-3 font-semibold">Revenus</th>
                  <th className="px-6 py-3 font-semibold whitespace-nowrap">Remplissage</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {dashboard.events.map((event) => {
                  const pct = clampPct(event.capacity ? (event.ticketsSold / event.capacity) * 100 : 0);
                  return (
                    <tr key={event.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{event.title}</div>
                      </td>

                      <td className="px-6 py-4 text-slate-700">{event.ticketsSold}</td>

                      <td className="px-6 py-4 text-slate-700">{event.capacity}</td>

                      <td className="px-6 py-4 text-slate-900 font-semibold">
                        {formatMoneyEUR(event.revenues)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 min-w-[220px]">
                          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-indigo-600 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="text-xs font-semibold text-slate-600 w-10 text-right">
                            {pct.toFixed(0)}%
                          </div>
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {event.ticketsSold}/{event.capacity}
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