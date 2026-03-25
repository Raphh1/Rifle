import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useCreateEvent } from "../../api/queries";
import { createEventSchema, type CreateEventFormData } from "../../utils/validation";

export function CreateEvent() {
  const navigate = useNavigate();
  const createEventMutation = useCreateEvent();

  const [formData, setFormData] = useState<CreateEventFormData>({
    title: "",
    description: "",
    date: "",
    location: "",
    price: 0,
    capacity: 1,
  });

  // ✅ Fix TS7053 définitif : index signature
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "capacity" ? Number(value) : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setErrors({});

    try {
      const validData = createEventSchema.parse(formData);
      await createEventMutation.mutateAsync({ ...validData, imageUrl: "" });
      navigate("/events");
    } catch (err) {
  if (err instanceof z.ZodError) {
    const mapped: Record<string, string> = {};

    const fieldErrors = err.flatten().fieldErrors as Record<string, unknown>;

    for (const [key, value] of Object.entries(fieldErrors)) {
      // value peut être string[] | undefined, mais TS le voit parfois comme {}
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
        mapped[key] = value[0];
      }
    }

    setErrors(mapped);
  } else if (err instanceof Error) {
    setGeneralError(err.message);
  } else {
    setGeneralError("Une erreur inattendue est survenue.");
  }
}
  };

  const isPending = createEventMutation.isPending;

  return (
    <div className="max-w-4xl mx-auto py-8 animate-fade-in relative z-10 px-4 sm:px-6">
      
      <button 
        onClick={() => navigate('/events')} 
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors group"
      >
        <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Retour aux événements
      </button>

      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Créer un événement
        </h1>
        <p className="text-base text-slate-400 mt-2 font-medium">
          Renseigne les infos principales : titre, date, lieu, prix et capacité.
        </p>
      </div>

      {generalError && (
        <div className="mb-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400 backdrop-blur-sm shadow-lg flex items-center gap-3 animate-fade-in">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {generalError}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="relative rounded-3xl border border-slate-700/50 bg-slate-900/40 backdrop-blur-xl p-6 sm:p-8 md:p-10 shadow-2xl space-y-8 animate-slide-up"
        style={{ animationDelay: '100ms' }}
        noValidate
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-blue-500/5 rounded-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Informations</h2>
              <p className="text-sm text-slate-400">Donne un titre clair et une description courte.</p>
            </div>
          </div>

          <div className="space-y-5 bg-slate-800/30 p-6 rounded-2xl border border-slate-700/40">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2" htmlFor="title">
                Titre <span className="text-indigo-400">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                disabled={isPending}
                placeholder="Ex: Concert privé • Rolling Stones"
                className={[
                  "w-full rounded-xl border bg-slate-800/50 px-4 py-3 text-white shadow-inner transition-all duration-200",
                  "placeholder:text-slate-500",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-slate-800",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  errors.title ? "border-red-500/50 bg-red-500/5 focus:ring-red-500" : "border-slate-700/60 hover:border-slate-600",
                ].join(" ")}
              />
              {errors.title && <div className="mt-2 text-sm text-red-400 font-medium flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{errors.title}</div>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2" htmlFor="description">
                Description <span className="text-indigo-400">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                disabled={isPending}
                placeholder="Décris l'événement, le déroulé, les infos importantes…"
                className={[
                  "w-full rounded-xl border bg-slate-800/50 px-4 py-3 text-white shadow-inner transition-all duration-200 resize-y",
                  "placeholder:text-slate-500",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-slate-800",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  errors.description ? "border-red-500/50 bg-red-500/5 focus:ring-red-500" : "border-slate-700/60 hover:border-slate-600",
                ].join(" ")}
              />
              {errors.description && <div className="mt-2 text-sm text-red-400 font-medium flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{errors.description}</div>}
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Lieu et date</h2>
              <p className="text-sm text-slate-400">Où et quand ça se passe ?</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-slate-800/30 p-6 rounded-2xl border border-slate-700/40">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2" htmlFor="date">
                Date <span className="text-indigo-400">*</span>
              </label>
              <input
                id="date"
                name="date"
                type="datetime-local"
                value={formData.date}
                onChange={handleChange}
                disabled={isPending}
                className={[
                  "w-full rounded-xl border bg-slate-800/50 px-4 py-3 text-white shadow-inner transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-slate-800 [color-scheme:dark]",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  errors.date ? "border-red-500/50 bg-red-500/5 focus:ring-red-500" : "border-slate-700/60 hover:border-slate-600",
                ].join(" ")}
              />
              {errors.date && <div className="mt-2 text-sm text-red-400 font-medium flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{errors.date}</div>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2" htmlFor="location">
                Lieu <span className="text-indigo-400">*</span>
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                disabled={isPending}
                placeholder="Ex: Paris, La Cigale"
                className={[
                  "w-full rounded-xl border bg-slate-800/50 px-4 py-3 text-white shadow-inner transition-all duration-200",
                  "placeholder:text-slate-500",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-slate-800",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  errors.location ? "border-red-500/50 bg-red-500/5 focus:ring-red-500" : "border-slate-700/60 hover:border-slate-600",
                ].join(" ")}
              />
              {errors.location && <div className="mt-2 text-sm text-red-400 font-medium flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{errors.location}</div>}
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Tarification</h2>
              <p className="text-sm text-slate-400">Définis le prix et la capacité maximale.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-slate-800/30 p-6 rounded-2xl border border-slate-700/40">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2" htmlFor="price">
                Prix (€) <span className="text-indigo-400">*</span>
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                disabled={isPending}
                className={[
                  "w-full rounded-xl border bg-slate-800/50 px-4 py-3 text-white shadow-inner transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-slate-800",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  errors.price ? "border-red-500/50 bg-red-500/5 focus:ring-red-500" : "border-slate-700/60 hover:border-slate-600",
                ].join(" ")}
              />
              {errors.price && <div className="mt-2 text-sm text-red-400 font-medium flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{errors.price}</div>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2" htmlFor="capacity">
                Capacité <span className="text-indigo-400">*</span>
              </label>
              <input
                id="capacity"
                name="capacity"
                type="number"
                min={1}
                value={formData.capacity}
                onChange={handleChange}
                disabled={isPending}
                className={[
                  "w-full rounded-xl border bg-slate-800/50 px-4 py-3 text-white shadow-inner transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-slate-800",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  errors.capacity ? "border-red-500/50 bg-red-500/5 focus:ring-red-500" : "border-slate-700/60 hover:border-slate-600",
                ].join(" ")}
              />
              {errors.capacity && <div className="mt-2 text-sm text-red-400 font-medium flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{errors.capacity}</div>}
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-6 mt-4 border-t border-slate-700/50 flex flex-col sm:flex-row gap-4 sm:justify-end items-center">
          <button
            type="button"
            onClick={() => navigate("/events")}
            className="w-full sm:w-auto rounded-xl border border-slate-600/50 bg-slate-800/50 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all disabled:opacity-50"
            disabled={isPending}
          >
            Annuler
          </button>

          <button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-blue-500 hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Création en cours…
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Créer l'événement
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}