import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useEvents } from "../../api/queries";
import { useAuth } from "../../context/useAuth";
import { EventCard, type EventCardModel } from "./EventCard";

export function EventList() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data: response, isLoading, isError, error } = useEvents(page, 10, search);

  const events = useMemo(() => {
    const raw = response?.data ?? [];
    // petit "cast" safe : ton backend renvoie déjà les champs utilisés
    return raw as unknown as EventCardModel[];
  }, [response?.data]);

  const meta = response?.meta;

  return (
    <div className="min-h-screen bg-slate-900 border border-slate-700 rounded-2xl shadow-sm p-6 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header / Toolbar */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-sm p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Événements disponibles
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Trouvez des événements près de chez vous
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              {/* Search */}
              <div className="relative w-full sm:w-80">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                  />
                </svg>

                <input
                  type="text"
                  aria-label="Rechercher un événement"
                  placeholder="Rechercher un événement…"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white shadow-sm
                             focus:outline-none focus:ring-4 focus:ring-indigo-900 focus:border-indigo-500"
                />
              </div>

              {/* Create button */}
              {user?.role === "organizer" && (
                <Link
                  to="/create-event"
                  className="inline-flex justify-center items-center rounded-xl bg-indigo-600 px-4 py-2.5
                             text-white font-semibold shadow-sm hover:bg-indigo-500 transition
                             focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-900"
                >
                  Créer
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-6">
          {isLoading && (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-sm p-10 text-center text-slate-400">
              Chargement des événements…
            </div>
          )}

          {isError && (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-sm p-10 text-center text-red-400">
              Erreur : {error instanceof Error ? error.message : "Unknown error"}
            </div>
          )}

          {!isLoading && !isError && (
            <>
              {events.length === 0 ? (
                <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-sm p-10 text-center">
                  <p className="text-white text-lg font-semibold">Aucun événement trouvé.</p>
                  <p className="text-slate-400 mt-2">Essaie une autre recherche.</p>
                  {user?.role === "organizer" && (
                    <div className="mt-6">
                      <Link
                        to="/create-event"
                        className="inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2.5
                                   text-white font-semibold shadow-sm hover:bg-emerald-500 transition"
                      >
                        Créer ton premier événement
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {meta && meta.last_page && meta.last_page > 1 && (
                <div className="mt-8 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-xl bg-slate-800 border border-slate-700 px-4 py-2 font-semibold text-white
                               shadow-sm hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 transition"
                  >
                    Précédent
                  </button>

                  <div className="text-sm text-slate-400">
                    Page <span className="font-semibold text-white">{page}</span> sur{" "}
                    <span className="font-semibold text-white">{meta.last_page}</span>
                  </div>

                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= meta.last_page}
                    className="rounded-xl bg-slate-800 border border-slate-700 px-4 py-2 font-semibold text-white
                               shadow-sm hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 transition"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}