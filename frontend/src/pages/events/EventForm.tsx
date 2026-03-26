import { useMemo, useState } from "react";
import { z } from "zod";
import type { CategoryOption, Event } from "../../types/api";
import { createEventSchema, type CreateEventFormData } from "../../utils/validation";

type EventFormProps = {
  mode: "create" | "edit";
  categories?: CategoryOption[];
  initialValues?: Partial<CreateEventFormData> & { imageUrl?: string | null };
  isPending: boolean;
  submitLabel: string;
  title: string;
  subtitle: string;
  onCancel: () => void;
  onSubmit: (data: FormData) => Promise<void>;
};

const fallbackCategories: CategoryOption[] = [
  { value: "concert", label: "Concert" },
  { value: "conference", label: "Conférence" },
  { value: "festival", label: "Festival" },
  { value: "sport", label: "Sport" },
  { value: "theatre", label: "Théâtre" },
  { value: "exposition", label: "Exposition" },
  { value: "autre", label: "Autre" },
];

const toDatetimeLocal = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

export const mapEventToFormData = (event: Event): Partial<CreateEventFormData> & { imageUrl?: string | null } => ({
  title: event.title,
  description: event.description,
  date: toDatetimeLocal(event.date),
  location: event.location,
  price: event.price,
  capacity: event.capacity,
  category: event.category,
  imageUrl: event.imageUrl,
});

export function EventForm({
  mode,
  categories,
  initialValues,
  isPending,
  submitLabel,
  title,
  subtitle,
  onCancel,
  onSubmit,
}: EventFormProps) {
  const [formData, setFormData] = useState<CreateEventFormData>({
    title: initialValues?.title ?? "",
    description: initialValues?.description ?? "",
    date: initialValues?.date ?? "",
    location: initialValues?.location ?? "",
    price: initialValues?.price ?? 0,
    capacity: initialValues?.capacity ?? 1,
    category: initialValues?.category ?? "autre",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categoryOptions = useMemo(() => categories ?? fallbackCategories, [categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    } else {
      setImageFile(null);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setErrors({});

    try {
      const validatedData = createEventSchema.parse(formData);
      const payload = new FormData();

      Object.entries(validatedData).forEach(([key, value]) => {
        payload.append(key, String(value));
      });

      if (initialValues?.imageUrl) {
        payload.append("imageUrl", initialValues.imageUrl);
      }

      if (imageFile) {
        payload.append("image", imageFile);
      }

      await onSubmit(payload);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const mapped: Record<string, string> = {};
        const fieldErrors = err.flatten().fieldErrors as Record<string, unknown>;

        for (const [key, value] of Object.entries(fieldErrors)) {
          if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
            mapped[key] = value[0];
          }
        }

        setErrors(mapped);
        return;
      }

      setGeneralError(err instanceof Error ? err.message : "Une erreur inattendue est survenue.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 animate-fade-in relative z-10 px-4 sm:px-6">
      <button
        onClick={onCancel}
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors group"
      >
        <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Retour aux événements
      </button>

      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="text-base text-slate-400 mt-2 font-medium">{subtitle}</p>
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
        onSubmit={submit}
        className="relative rounded-3xl border border-slate-700/50 bg-slate-900/40 backdrop-blur-xl p-6 sm:p-8 md:p-10 shadow-2xl space-y-8 animate-slide-up"
        style={{ animationDelay: "100ms" }}
        noValidate
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-blue-500/5 rounded-3xl pointer-events-none" />

        <section className="relative z-10 space-y-5 bg-slate-800/30 p-6 rounded-2xl border border-slate-700/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Informations</h2>
              <p className="text-sm text-slate-400">Titre, description et catégorie.</p>
            </div>
          </div>

          <FieldError label="Titre" error={errors.title}>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              disabled={isPending}
              placeholder="Ex: Concert privé • Rolling Stones"
              className={inputClass(errors.title)}
            />
          </FieldError>

          <FieldError label="Description" error={errors.description}>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              disabled={isPending}
              placeholder="Décris l'événement, le déroulé, les infos importantes…"
              className={textareaClass(errors.description)}
            />
          </FieldError>

          <FieldError label="Catégorie" error={errors.category}>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={isPending}
              className={inputClass(errors.category)}
            >
              {categoryOptions.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </FieldError>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2" htmlFor="image">
              Image de l&apos;événement
            </label>
            {initialValues?.imageUrl && !imageFile && (
              <div className="mb-3 overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/60">
                <img src={initialValues.imageUrl} alt="Aperçu actuel" className="h-48 w-full object-cover" />
              </div>
            )}
            <div className="flex border border-slate-700/60 rounded-xl bg-slate-800/50 p-2 items-center">
              <input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isPending}
                className="w-full text-sm text-slate-400 file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/20 file:text-indigo-400 hover:file:bg-indigo-500/30 file:transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            {mode === "edit" && (
              <p className="mt-2 text-xs text-slate-500">Choisis une nouvelle image seulement si tu veux remplacer l&apos;actuelle.</p>
            )}
          </div>
        </section>

        <section className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-5 bg-slate-800/30 p-6 rounded-2xl border border-slate-700/40">
          <FieldError label="Date" error={errors.date}>
            <input
              id="date"
              name="date"
              type="datetime-local"
              value={formData.date}
              onChange={handleChange}
              disabled={isPending}
              className={`${inputClass(errors.date)} [color-scheme:dark]`}
            />
          </FieldError>

          <FieldError label="Lieu" error={errors.location}>
            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              disabled={isPending}
              placeholder="Ex: Paris, La Cigale"
              className={inputClass(errors.location)}
            />
          </FieldError>
        </section>

        <section className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-5 bg-slate-800/30 p-6 rounded-2xl border border-slate-700/40">
          <FieldError label="Prix (€)" error={errors.price}>
            <input
              id="price"
              name="price"
              type="number"
              min={0}
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              disabled={isPending}
              className={inputClass(errors.price)}
            />
          </FieldError>

          <FieldError label="Capacité" error={errors.capacity}>
            <input
              id="capacity"
              name="capacity"
              type="number"
              min={1}
              step="1"
              value={formData.capacity}
              onChange={handleChange}
              disabled={isPending}
              className={inputClass(errors.capacity)}
            />
          </FieldError>
        </section>

        <div className="relative z-10 flex flex-col sm:flex-row gap-4 sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-600/50 bg-slate-800/50 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 transition-all"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-blue-500 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {isPending ? "Enregistrement..." : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

function FieldError({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-300 mb-2">{label}</label>
      {children}
      {error && <div className="mt-2 text-sm text-red-400 font-medium">{error}</div>}
    </div>
  );
}

const baseInputClass =
  "w-full rounded-xl border bg-slate-800/50 px-4 py-3 text-white shadow-inner transition-all duration-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed";

const inputClass = (error?: string) =>
  `${baseInputClass} ${error ? "border-red-500/50 bg-red-500/5 focus:ring-red-500" : "border-slate-700/60 hover:border-slate-600"}`;

const textareaClass = (error?: string) =>
  `${inputClass(error)} resize-y`;
