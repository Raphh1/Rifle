import { Link } from "react-router-dom";
import { useEvents } from "../api/queries";
import { useAuth } from "../context/useAuth";
import type { Event } from "../types/api";

const CATEGORY_LABELS: Record<string, string> = {
  concert: "Concert",
  conference: "Conférence",
  festival: "Festival",
  sport: "Sport",
  theatre: "Théâtre",
  exposition: "Exposition",
  autre: "Autre",
};

function EventCard({ event }: { event: Event }) {
  const remaining = event.remaining ?? 0;
  const capacity = event.capacity ?? 1;
  const pctLeft = (remaining / capacity) * 100;
  const almostFull = pctLeft <= 20 && remaining > 0;
  const soldOut = remaining === 0;

  return (
    <Link
      to={`/events/${event.id}`}
      className="group relative flex flex-col rounded-2xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm overflow-hidden hover:border-indigo-500/40 hover:bg-slate-800/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10"
    >
      {event.imageUrl ? (
        <img src={event.imageUrl} alt={event.title} className="h-40 w-full object-cover" />
      ) : (
        <div className="h-40 w-full bg-gradient-to-br from-indigo-500/20 to-blue-600/20 flex items-center justify-center">
          <svg className="w-12 h-12 text-indigo-400/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}

      <div className="flex flex-col flex-1 p-4 gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
            {CATEGORY_LABELS[event.category] ?? event.category}
          </span>
          {almostFull && (
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">
              Plus que {remaining} place{remaining > 1 ? "s" : ""} !
            </span>
          )}
          {soldOut && (
            <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-full px-2 py-0.5">
              Complet
            </span>
          )}
        </div>

        <h3 className="text-white font-semibold text-sm leading-snug group-hover:text-indigo-300 transition-colors line-clamp-2">
          {event.title}
        </h3>

        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <span className="truncate">{event.location}</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>
            {new Date(event.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          </span>
        </div>

        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="text-white font-bold text-sm">
            {event.price === 0 ? "Gratuit" : `${event.price.toFixed(2)} €`}
          </span>
          <span className="text-xs text-slate-500">{remaining} place{remaining > 1 ? "s" : ""} restante{remaining > 1 ? "s" : ""}</span>
        </div>
      </div>
    </Link>
  );
}

const FEATURES = [
  {
    icon: "M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z",
    title: "Billets sécurisés",
    desc: "QR code unique par billet, transfert et annulation en quelques clics.",
  },
  {
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    title: "Social intégré",
    desc: "Rejoins des rooms de discussion, retrouve tes amis qui y vont.",
  },
  {
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    title: "Dashboard organisateur",
    desc: "Suivi des ventes en temps réel, scanner de billets intégré.",
  },
];

export function Landing() {
  const { isAuthenticated } = useAuth();
  const { data: eventsData, isLoading } = useEvents(1, 6);
  const events = eventsData?.data ?? [];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[140px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/15 blur-[140px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 border-b border-slate-800/60 backdrop-blur-xl bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
            Rifle
          </span>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/events"
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition"
              >
                Accéder à la plateforme
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-slate-300 text-sm font-medium hover:text-white transition"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition"
                >
                  Créer un compte
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-300 mb-6">
          <span className="flex h-2 w-2 rounded-full bg-indigo-400 mr-2 animate-pulse" />
          La billetterie événementielle nouvelle génération
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 animate-slide-up">
          <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Tes événements,
          </span>
          <br />
          <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
            sans friction.
          </span>
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: "100ms" }}>
          Achète, transfère et scanne des billets. Rejoins des rooms de discussion. Retrouve tes amis dans la foule.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "200ms" }}>
          <Link
            to={isAuthenticated ? "/events" : "/register"}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-base hover:from-indigo-500 hover:to-blue-500 transition-all hover:-translate-y-0.5 shadow-lg shadow-indigo-500/25"
          >
            {isAuthenticated ? "Voir les événements" : "Commencer gratuitement"}
          </Link>
          <Link
            to="/events"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl border border-slate-700 text-slate-300 font-semibold text-base hover:bg-slate-800/50 hover:text-white transition-all"
          >
            Parcourir les événements
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid sm:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm p-6 hover:border-indigo-500/30 hover:bg-slate-800/50 transition-all"
            >
              <div className="h-10 w-10 rounded-xl bg-indigo-500/15 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Events à la une */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Événements à venir</h2>
            <p className="text-slate-400 text-sm mt-1">Les prochains événements sur la plateforme</p>
          </div>
          <Link
            to="/events"
            className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1"
          >
            Voir tout
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-700/50 bg-slate-800/30 h-64 animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            Aucun événement disponible pour le moment.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* CTA final */}
      {!isAuthenticated && (
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-blue-500/5 p-10 text-center backdrop-blur-sm">
            <h2 className="text-3xl font-extrabold text-white mb-3">Prêt à rejoindre ?</h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              Crée ton compte gratuitement et accède à tous les événements, tes billets et la communauté.
            </p>
            <Link
              to="/register"
              className="inline-flex px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-base hover:from-indigo-500 hover:to-blue-500 transition-all hover:-translate-y-0.5 shadow-lg shadow-indigo-500/25"
            >
              Créer mon compte
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/60 py-8 text-center text-slate-500 text-sm">
        © {new Date().getFullYear()} Rifle. Tous droits réservés.
      </footer>
    </div>
  );
}
