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
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Créer un événement
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Renseigne les infos principales : titre, date, lieu, prix et capacité.
        </p>
      </div>

      {generalError && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {generalError}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6"
        noValidate
      >
        <div>
          <div className="text-sm font-bold text-slate-900">Informations</div>
          <div className="mt-1 text-sm text-slate-500">
            Donne un titre clair et une description courte.
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900" htmlFor="title">
                Titre <span className="text-red-500">*</span>
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
                  "mt-1 w-full rounded-xl border bg-white px-3 py-2.5 text-slate-900 shadow-sm",
                  "placeholder:text-slate-400",
                  "focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400",
                  "disabled:opacity-60",
                  errors.title ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-slate-200",
                ].join(" ")}
              />
              {errors.title && <div className="mt-1 text-sm text-red-600">{errors.title}</div>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900" htmlFor="description">
                Description <span className="text-red-500">*</span>
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
                  "mt-1 w-full rounded-xl border bg-white px-3 py-2.5 text-slate-900 shadow-sm",
                  "placeholder:text-slate-400",
                  "focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400",
                  "disabled:opacity-60",
                  errors.description ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-slate-200",
                ].join(" ")}
              />
              {errors.description && <div className="mt-1 text-sm text-red-600">{errors.description}</div>}
            </div>
          </div>
        </div>

        <div className="pt-2">
          <div className="text-sm font-bold text-slate-900">Lieu et date</div>
          <div className="mt-1 text-sm text-slate-500">Où et quand ça se passe ?</div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900" htmlFor="date">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                id="date"
                name="date"
                type="datetime-local"
                value={formData.date}
                onChange={handleChange}
                disabled={isPending}
                className={[
                  "mt-1 w-full rounded-xl border bg-white px-3 py-2.5 text-slate-900 shadow-sm",
                  "focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400",
                  "disabled:opacity-60",
                  errors.date ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-slate-200",
                ].join(" ")}
              />
              {errors.date && <div className="mt-1 text-sm text-red-600">{errors.date}</div>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900" htmlFor="location">
                Lieu <span className="text-red-500">*</span>
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
                  "mt-1 w-full rounded-xl border bg-white px-3 py-2.5 text-slate-900 shadow-sm",
                  "placeholder:text-slate-400",
                  "focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400",
                  "disabled:opacity-60",
                  errors.location ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-slate-200",
                ].join(" ")}
              />
              {errors.location && <div className="mt-1 text-sm text-red-600">{errors.location}</div>}
            </div>
          </div>
        </div>

        <div className="pt-2">
          <div className="text-sm font-bold text-slate-900">Tarification</div>
          <div className="mt-1 text-sm text-slate-500">Définis le prix et la capacité maximale.</div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900" htmlFor="price">
                Prix (€) <span className="text-red-500">*</span>
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
                  "mt-1 w-full rounded-xl border bg-white px-3 py-2.5 text-slate-900 shadow-sm",
                  "focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400",
                  "disabled:opacity-60",
                  errors.price ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-slate-200",
                ].join(" ")}
              />
              {errors.price && <div className="mt-1 text-sm text-red-600">{errors.price}</div>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900" htmlFor="capacity">
                Capacité <span className="text-red-500">*</span>
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
                  "mt-1 w-full rounded-xl border bg-white px-3 py-2.5 text-slate-900 shadow-sm",
                  "focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400",
                  "disabled:opacity-60",
                  errors.capacity ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-slate-200",
                ].join(" ")}
              />
              {errors.capacity && <div className="mt-1 text-sm text-red-600">{errors.capacity}</div>}
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            type="button"
            onClick={() => navigate("/events")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700
                       shadow-sm hover:bg-slate-50 transition"
            disabled={isPending}
          >
            Annuler
          </button>

          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm
                       hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {isPending ? "Création en cours…" : "Créer l'événement"}
          </button>
        </div>
      </form>
    </div>
  );
}