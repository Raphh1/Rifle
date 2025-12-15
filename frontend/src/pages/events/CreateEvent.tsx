import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useCreateEvent } from "../../api/queries";
import "./events.css";

const createEventSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères"),
  date: z.string().refine(
    (date) => new Date(date) > new Date(),
    "La date doit être dans le futur"
  ),
  location: z.string().min(3, "Le lieu doit contenir au moins 3 caractères"),
  price: z.coerce.number().min(0, "Le prix doit être positif"),
  capacity: z.coerce.number().min(1, "La capacité doit être au moins 1"),
});

type CreateEventFormData = z.infer<typeof createEventSchema>;

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

  const [errors, setErrors] = useState<Partial<CreateEventFormData>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "capacity" ? parseFloat(value) : value,
    }));

    // Effacer l'erreur quand on commence à taper
    if (errors[name as keyof CreateEventFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    try {
      const validData = createEventSchema.parse(formData);
      await createEventMutation.mutateAsync({
        ...validData,
        imageUrl: "", // À implémenter si upload d'image
      });
      navigate("/events");
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors = err.flatten().fieldErrors;
        setErrors(fieldErrors as Partial<CreateEventFormData>);
      } else if (err instanceof Error) {
        setGeneralError(err.message);
      }
    }
  };

  return (
    <div className="create-event-container">
      <h1>Créer un événement</h1>

      {generalError && <div className="error-message">{generalError}</div>}

      <form onSubmit={handleSubmit} className="create-event-form">
        <div className="form-group">
          <label htmlFor="title">Titre *</label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            disabled={createEventMutation.isPending}
          />
          {errors.title && <span className="error">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            disabled={createEventMutation.isPending}
            rows={4}
          />
          {errors.description && (
            <span className="error">{errors.description}</span>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              id="date"
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleChange}
              disabled={createEventMutation.isPending}
            />
            {errors.date && <span className="error">{errors.date}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="location">Lieu *</label>
            <input
              id="location"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              disabled={createEventMutation.isPending}
            />
            {errors.location && (
              <span className="error">{errors.location}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Prix (€) *</label>
            <input
              id="price"
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              disabled={createEventMutation.isPending}
              step="0.01"
            />
            {errors.price && <span className="error">{errors.price}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="capacity">Capacité *</label>
            <input
              id="capacity"
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              disabled={createEventMutation.isPending}
              min="1"
            />
            {errors.capacity && (
              <span className="error">{errors.capacity}</span>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={createEventMutation.isPending} className="btn-primary">
            {createEventMutation.isPending ? "Création en cours..." : "Créer l'événement"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/events")}
            className="btn-secondary"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
