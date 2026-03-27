import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useBuyTicket, useDeleteEvent, useEventDetail } from "../../api/queries";
import { useAuth } from "../../context/useAuth";
import {
  useFavoriteStatus,
  useToggleFavorite,
  useFriendsFavorites,
  useEventRating,
  useEventReviews,
  useCreateReview,
  useEventRooms,
  useCreateRoom,
  useJoinRoom,
} from "../../api/socialQueries";

export function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: event, isLoading, isError, error } = useEventDetail(id || "");
  const buyTicketMutation = useBuyTicket();
  const deleteEventMutation = useDeleteEvent();

  // Social hooks
  const { data: favStatus } = useFavoriteStatus(user ? id! : "");
  const toggleFav = useToggleFavorite();
  const { data: friendsFavs } = useFriendsFavorites(user ? id! : "");
  const { data: rating } = useEventRating(id!);
  const [reviewPage] = useState(1);
  const [reviewSort] = useState("recent");
  const { data: reviewsData } = useEventReviews(id!, reviewPage, reviewSort);
  const { data: rooms } = useEventRooms(user ? id! : "");
  const createReview = useCreateReview();
  const createRoom = useCreateRoom();
  const joinRoom = useJoinRoom();

  // Local state
  const [tab, setTab] = useState<"info" | "reviews" | "rooms">("info");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomVisibility, setRoomVisibility] = useState<"public" | "private">("public");

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 animate-fade-in relative z-10 min-h-[50vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent shadow-lg shadow-indigo-500/20"></div>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="container mx-auto p-4 relative z-10 pt-12">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-center text-red-500 backdrop-blur-xl animate-fade-in shadow-2xl">
          <svg className="w-10 h-10 mx-auto mb-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="font-medium text-lg">Erreur de chargement</p>
          <p className="text-sm mt-2 opacity-80">{error instanceof Error ? error.message : "Événement non trouvé"}</p>
        </div>
      </div>
    );
  }

  const canManageEvent = !!user && (user.role === "admin" || event.organizer?.id === user.id);

  const handleBuyTicket = async () => {
    try {
      const result = await buyTicketMutation.mutateAsync(event.id);
      alert(result.message);
      navigate("/tickets");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Impossible d'acheter ce billet.");
    }
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm("Supprimer cet événement ? Les billets actifs seront automatiquement annulés et remboursés.")) {
      return;
    }

    try {
      const result = await deleteEventMutation.mutateAsync(event.id);
      alert(result.message || "Événement supprimé. Les billets ont été remboursés.");
      navigate("/dashboard");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Impossible de supprimer cet événement.");
    }
  };

  const handleToggleFavorite = () => {
    if (!user) return;
    toggleFav.mutate({ eventId: id!, isFavorited: favStatus?.isFavorited ?? false });
  };

  const handleSubmitReview = async () => {
    try {
      await createReview.mutateAsync({
        eventId: id!,
        data: { rating: reviewRating, comment: reviewComment || undefined },
      });
      setShowReviewForm(false);
      setReviewComment("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur";
      alert(message);
    }
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim()) return;
    try {
      await createRoom.mutateAsync({
        eventId: id!,
        data: { name: roomName, visibility: roomVisibility },
      });
      setShowRoomForm(false);
      setRoomName("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur";
      alert(message);
    }
  };

  const capacity = event.capacity ?? 0;
  const remaining = event.remaining ?? 0;
  const occupied = capacity > 0 ? Math.max(0, capacity - remaining) : 0;
  const pct = capacity > 0 ? Math.max(0, Math.min(100, Math.round((occupied / capacity) * 100))) : 0;
  const isPast = new Date(event.date) < new Date();

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-5xl animate-fade-in relative z-10">
      <button
        onClick={() => navigate("/events")}
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors group"
      >
        <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Retour aux événements
      </button>

      <div className="relative rounded-3xl overflow-hidden border border-slate-700/50 bg-slate-900/40 backdrop-blur-xl shadow-2xl animate-slide-up">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-blue-500/5 pointer-events-none" />

        {/* Header Image */}
        <div className="relative h-64 sm:h-80 md:h-96 w-full bg-slate-800">
          {event.imageUrl ? (
            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
              <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Aucune image disponible</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-90" />

          {/* Favorite button */}
          {user && (
            <button
              onClick={handleToggleFavorite}
              className="absolute right-4 top-4 p-3 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition z-20"
            >
              <svg
                className={`w-6 h-6 transition ${
                  favStatus?.isFavorited ? "text-red-500 fill-red-500" : "text-white/70 hover:text-red-400"
                }`}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                fill={favStatus?.isFavorited ? "currentColor" : "none"}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}

          <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-slate-800/80 border border-slate-600/50 text-xs font-medium text-slate-300 backdrop-blur-md">
                  <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(event.date).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
                {rating && rating.count > 0 && (
                  <div className="inline-flex items-center gap-1 rounded-full px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-xs font-medium text-amber-300 backdrop-blur-md">
                    <span>⭐</span> {rating.average} ({rating.count})
                  </div>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg leading-tight">{event.title}</h1>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-3">
              <div className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-lg font-bold text-white shadow-xl shadow-indigo-500/20">
                {event.price === 0 ? "Gratuit" : `${event.price}€`}
              </div>

              {canManageEvent && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => navigate(`/events/${event.id}/edit`)}
                    className="rounded-xl border border-slate-600/60 bg-slate-900/60 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={handleDeleteEvent}
                    disabled={deleteEventMutation.isPending}
                    className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/20 transition disabled:opacity-50"
                  >
                    {deleteEventMutation.isPending ? "Suppression..." : "Supprimer"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-700/50 px-6 sm:px-8 md:px-10">
          <div className="flex gap-1">
            {(["info", "reviews", "rooms"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                  tab === t
                    ? "border-indigo-500 text-indigo-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                {t === "info" ? "Infos" : t === "reviews" ? `Avis ${rating?.count ? `(${rating.count})` : ""}` : `Rooms ${rooms?.length ? `(${rooms.length})` : ""}`}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 md:p-10 relative z-10">

          {/* INFO TAB */}
          {tab === "info" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    À propos de l&apos;événement
                  </h2>
                  <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed bg-slate-800/30 rounded-2xl p-6 border border-slate-700/40">
                    {event.description ? (
                      <p className="whitespace-pre-wrap">{event.description}</p>
                    ) : (
                      <p className="italic text-slate-500">Aucune description fournie par l&apos;organisateur.</p>
                    )}
                  </div>
                </div>

                {event.organizer && (
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                      {event.organizer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Organisé par</p>
                      <p className="text-base font-semibold text-white">{event.organizer.name}</p>
                    </div>
                  </div>
                )}

                {/* Friends who favorited */}
                {friendsFavs && friendsFavs.length > 0 && (
                  <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/40">
                    <p className="text-sm text-slate-400 mb-2">Amis intéressés</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {friendsFavs.map((f) => (
                        <div key={f.id} className="flex items-center gap-2 bg-slate-700/50 rounded-full px-3 py-1">
                          <div className="h-6 w-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                            {f.avatar ? (
                              <img src={f.avatar} alt={f.name} className="h-6 w-6 rounded-full object-cover" />
                            ) : (
                              f.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <span className="text-sm text-slate-300">{f.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                <div className="rounded-2xl bg-slate-800/40 border border-slate-700/50 p-6">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Détails pratiques</h3>

                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-white">Lieu</p>
                        <p className="text-sm text-slate-300">{event.location}</p>
                      </div>
                    </li>

                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-white">Heure</p>
                        <p className="text-sm text-slate-300">
                          {new Date(event.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }).replace(":", "h")} (Heure locale)
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl bg-slate-800/40 border border-slate-700/50 p-6">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Disponibilité</h3>

                  <div className="flex items-end justify-between mb-2">
                    <span className="text-2xl font-bold text-white">{remaining}</span>
                    <span className="text-sm text-slate-400 mb-1">places restantes sur {capacity}</span>
                  </div>

                  <div className="h-2.5 w-full rounded-full bg-slate-700/50 overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        pct > 90 ? "bg-red-500" : pct > 75 ? "bg-orange-400" : "bg-gradient-to-r from-emerald-400 to-teal-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-right text-xs text-slate-500">{pct}% rempli</div>

                  <div className="mt-8">
                    <button
                      onClick={handleBuyTicket}
                      disabled={remaining === 0 || buyTicketMutation.isPending}
                      className="w-full inline-flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-blue-500 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                      {buyTicketMutation.isPending ? "Traitement en cours..." : remaining === 0 ? "Complet" : "Réserver ma place"}
                    </button>
                    <p className="text-center text-xs text-slate-500 mt-3">Paiement simulé. Le billet est disponible immédiatement dans ton espace.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REVIEWS TAB */}
          {tab === "reviews" && (
            <div className="max-w-3xl">
              {/* Rating summary */}
              {rating && rating.count > 0 && (
                <div className="flex items-center gap-8 p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 mb-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-white">{rating.average}</p>
                    <div className="flex gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className={`w-4 h-4 ${star <= Math.round(rating.average) ? "text-amber-400" : "text-slate-600"}`} viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{rating.count} avis</p>
                  </div>
                  <div className="flex-1 space-y-1">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 w-3">{star}</span>
                        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{ width: rating.count > 0 ? `${(rating.distribution[star] / rating.count) * 100}%` : "0%" }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 w-6">{rating.distribution[star]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Write review button */}
              {user && isPast && !showReviewForm && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="mb-6 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition"
                >
                  Laisser un avis
                </button>
              )}

              {/* Review form */}
              {showReviewForm && (
                <div className="mb-6 p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50">
                  <h3 className="text-white font-semibold mb-4">Votre avis</h3>
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="transition hover:scale-110"
                      >
                        <svg className={`w-8 h-8 ${star <= reviewRating ? "text-amber-400" : "text-slate-600"}`} viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Partagez votre expérience..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleSubmitReview}
                      disabled={createReview.isPending}
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition disabled:opacity-50"
                    >
                      {createReview.isPending ? "Envoi..." : "Publier"}
                    </button>
                    <button
                      onClick={() => setShowReviewForm(false)}
                      className="px-4 py-2 rounded-xl bg-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-600 transition"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {/* Reviews list */}
              <div className="space-y-4">
                {!reviewsData?.data?.length ? (
                  <p className="text-slate-400 text-center py-10">Aucun avis pour le moment</p>
                ) : (
                  reviewsData.data.map((review) => (
                    <div key={review.id} className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/40">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                          {review.user.avatar ? (
                            <img src={review.user.avatar} alt={review.user.name} className="h-8 w-8 rounded-full object-cover" />
                          ) : (
                            review.user.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{review.user.name}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg key={star} className={`w-3 h-3 ${star <= review.rating ? "text-amber-400" : "text-slate-600"}`} viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-xs text-slate-500">
                              {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-slate-300 mt-2">{review.comment}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ROOMS TAB */}
          {tab === "rooms" && (
            <div className="max-w-3xl">
              {user && (
                <div className="mb-6">
                  {!showRoomForm ? (
                    <button
                      onClick={() => setShowRoomForm(true)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition"
                    >
                      Créer une room
                    </button>
                  ) : (
                    <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50">
                      <h3 className="text-white font-semibold mb-4">Nouvelle room</h3>
                      <input
                        type="text"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        placeholder="Nom de la room..."
                        className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm mb-3"
                      />
                      <div className="flex gap-3 mb-4">
                        {(["public", "private"] as const).map((v) => (
                          <button
                            key={v}
                            onClick={() => setRoomVisibility(v)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                              roomVisibility === v
                                ? "bg-indigo-600 text-white"
                                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                            }`}
                          >
                            {v === "public" ? "Publique" : "Privée"}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCreateRoom}
                          disabled={createRoom.isPending || !roomName.trim()}
                          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition disabled:opacity-50"
                        >
                          Créer
                        </button>
                        <button
                          onClick={() => setShowRoomForm(false)}
                          className="px-4 py-2 rounded-xl bg-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-600 transition"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3">
                {!rooms?.length ? (
                  <p className="text-slate-400 text-center py-10">Aucune room pour cet événement</p>
                ) : (
                  rooms.map((room) => (
                    <div key={room.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/30 border border-slate-700/40">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-medium truncate">{room.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            room.visibility === "public"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-amber-500/20 text-amber-400"
                          }`}>
                            {room.visibility === "public" ? "Public" : "Privé"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">
                          {room.membersCount} membres &middot; Par {room.creator.name}
                        </p>
                        {room.lastMessage && (
                          <p className="text-xs text-slate-500 mt-1 truncate">
                            {room.lastMessage.sender.name}: {room.lastMessage.content}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        {room.myRole ? (
                          <Link
                            to={`/rooms/${room.id}`}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition"
                          >
                            Ouvrir
                          </Link>
                        ) : room.visibility === "public" ? (
                          <button
                            onClick={() => joinRoom.mutate(room.id, { onSuccess: () => navigate(`/rooms/${room.id}`) })}
                            disabled={joinRoom.isPending}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition disabled:opacity-50"
                          >
                            {joinRoom.isPending ? "..." : "Rejoindre"}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
