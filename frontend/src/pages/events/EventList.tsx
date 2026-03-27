import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useEvents, useCategories } from "../../api/queries";
import { useAuth } from "../../context/useAuth";
import { EventCard, type EventCardModel } from "./EventCard";
import type { EventFilters, EventCategory } from "../../types/api";

const CATEGORY_ICONS: Record<EventCategory, string> = {
  concert: "🎵",
  conference: "🎤",
  festival: "🎪",
  sport: "⚽",
  theatre: "🎭",
  exposition: "🖼️",
  autre: "📌",
};

export function EventList() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<EventFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const { data: categories } = useCategories();
  const { data: response, isLoading, isError, error } = useEvents(page, 10, filters);

  const events = useMemo(() => {
    const raw = response?.data ?? [];
    return raw as unknown as EventCardModel[];
  }, [response?.data]);

  const meta = response?.meta;

  const activeFilterCount = [
    filters.category,
    filters.dateFrom,
    filters.dateTo,
    filters.priceMin !== undefined && filters.priceMin !== "" ? filters.priceMin : null,
    filters.priceMax !== undefined && filters.priceMax !== "" ? filters.priceMax : null,
  ].filter(Boolean).length;

  const updateFilter = <K extends keyof EventFilters>(key: K, value: EventFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in relative z-10">
      {/* Header / Toolbar */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-700/50 bg-slate-900/40 backdrop-blur-xl shadow-2xl p-6 md:p-8 animate-slide-up">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-blue-500/5 pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Événements disponibles
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-2 font-medium">
              Trouvez des événements et réservez votre place
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            {/* Search */}
            <div className="relative w-full sm:w-80 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-400 transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
              </div>
              <input
                type="text"
                aria-label="Rechercher un événement"
                placeholder="Rechercher un événement…"
                value={filters.search || ""}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700/60 bg-slate-800/50 text-white shadow-inner transition-all duration-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-slate-800/80"
              />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={[
                "inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all border",
                showFilters || activeFilterCount > 0
                  ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300"
                  : "bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-700/50",
              ].join(" ")}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtres
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-500 text-xs font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Create button */}
            {user?.role === "organizer" && (
              <Link
                to="/create-event"
                className="inline-flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-blue-500 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Créer
              </Link>
            )}
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="relative z-10 mt-6 pt-6 border-t border-slate-700/50 animate-fade-in">
            {/* Category pills */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Catégorie</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updateFilter("category", "")}
                  className={[
                    "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all border",
                    !filters.category
                      ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300 shadow-sm shadow-indigo-500/10"
                      : "bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-200",
                  ].join(" ")}
                >
                  Toutes
                </button>
                {categories?.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => updateFilter("category", cat.value)}
                    className={[
                      "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all border",
                      filters.category === cat.value
                        ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300 shadow-sm shadow-indigo-500/10"
                        : "bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-200",
                    ].join(" ")}
                  >
                    <span>{CATEGORY_ICONS[cat.value]}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Price filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Date début</label>
                <input
                  type="date"
                  value={filters.dateFrom || ""}
                  onChange={(e) => updateFilter("dateFrom", e.target.value)}
                  className="w-full rounded-xl border border-slate-700/60 bg-slate-800/50 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Date fin</label>
                <input
                  type="date"
                  value={filters.dateTo || ""}
                  onChange={(e) => updateFilter("dateTo", e.target.value)}
                  className="w-full rounded-xl border border-slate-700/60 bg-slate-800/50 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Prix min (€)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0"
                  value={filters.priceMin ?? ""}
                  onChange={(e) => updateFilter("priceMin", e.target.value ? Number(e.target.value) : "")}
                  className="w-full rounded-xl border border-slate-700/60 bg-slate-800/50 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Prix max (€)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="∞"
                  value={filters.priceMax ?? ""}
                  onChange={(e) => updateFilter("priceMax", e.target.value ? Number(e.target.value) : "")}
                  className="w-full rounded-xl border border-slate-700/60 bg-slate-800/50 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Clear filters */}
            {activeFilterCount > 0 && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-400 transition-colors font-medium"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mt-8">
        {isLoading && (
          <div className="flex justify-center py-20 animate-fade-in">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent shadow-lg shadow-indigo-500/20"></div>
          </div>
        )}

        {isError && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center text-red-500 backdrop-blur-sm animate-fade-in">
            <svg className="w-10 h-10 mx-auto mb-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-medium text-lg">Impossible de charger les événements</p>
            <p className="text-sm mt-2 opacity-80">{error instanceof Error ? error.message : "Erreur inconnue"}</p>
          </div>
        )}

        {!isLoading && !isError && (
          <div className="animate-slide-up" style={{ animationDelay: "150ms" }}>
            {events.length === 0 ? (
              <div className="rounded-3xl border border-slate-700/50 bg-slate-900/40 backdrop-blur-xl p-16 text-center shadow-lg">
                <div className="mx-auto h-20 w-20 rounded-full bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Aucun événement trouvé</h3>
                <p className="text-slate-400 max-w-md mx-auto">
                  {activeFilterCount > 0 || filters.search
                    ? "Aucun événement ne correspond à vos critères. Essayez de modifier vos filtres."
                    : "Il n'y a pas encore d'événements disponibles pour le moment."}
                </p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 transition"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
                {user?.role === "organizer" && activeFilterCount === 0 && !filters.search && (
                  <div className="mt-8">
                    <Link
                      to="/create-event"
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 transition"
                    >
                      <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Créer le premier événement
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {events.map((event, i) => (
                  <div key={event.id} className="animate-slide-up" style={{ animationDelay: `${(i % 10) * 50 + 150}ms` }}>
                    <EventCard event={event} />
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {meta && meta.last_page && meta.last_page > 1 && (
              <div className="mt-12 flex items-center justify-center gap-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  &larr; Précédent
                </button>

                <div className="text-sm font-medium text-slate-400 px-4 py-2 rounded-xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-xl">
                  Page <span className="text-white mx-1">{page}</span> / <span className="text-white mx-1">{meta.last_page}</span>
                </div>

                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= meta.last_page}
                  className="rounded-xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Suivant &rarr;
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
