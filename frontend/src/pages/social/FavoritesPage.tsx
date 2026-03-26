import { useState } from "react";
import { useMyFavorites } from "../../api/socialQueries";
import { EventCard } from "../events/EventCard";

export function FavoritesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyFavorites(page);

  return (
    <div className="animate-fade-in relative z-10">
      <h1 className="text-3xl font-bold text-white mb-8">Mes favoris</h1>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
      ) : !data?.data?.length ? (
        <div className="text-center py-20">
          <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <p className="text-slate-400 text-lg">Aucun favori pour le moment</p>
          <p className="text-slate-500 text-sm mt-2">Ajoutez des événements en favoris pour les retrouver ici</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.data.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {data.meta.last_page > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: data.meta.last_page }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    page === i + 1
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
