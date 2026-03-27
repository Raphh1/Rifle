import { useNavigate } from "react-router-dom";
import { EventForm } from "./EventForm";
import { useCategories, useCreateEvent } from "../../api/queries";

export function CreateEvent() {
  const navigate = useNavigate();
  const createEventMutation = useCreateEvent();
  const { data: categories } = useCategories();

  return (
    <EventForm
      mode="create"
      categories={categories}
      isPending={createEventMutation.isPending}
      submitLabel="Créer l'événement"
      title="Créer un événement"
      subtitle="Renseigne les informations principales pour publier ton événement."
      onCancel={() => navigate("/events")}
      onSubmit={async (formData) => {
        await createEventMutation.mutateAsync(formData);
        navigate("/events");
      }}
    />
  );
}
