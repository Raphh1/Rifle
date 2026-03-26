import { useNavigate, useParams } from "react-router-dom";
import { EventForm, mapEventToFormData } from "./EventForm";
import { useCategories, useEventDetail, useUpdateEvent } from "../../api/queries";

export function EditEvent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const updateEventMutation = useUpdateEvent();
  const { data: event, isLoading, isError, error } = useEventDetail(id || "");
  const { data: categories } = useCategories();

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
          <p className="font-medium text-lg">Impossible de charger l&apos;événement</p>
          <p className="text-sm mt-2 opacity-80">{error instanceof Error ? error.message : "Événement non trouvé"}</p>
        </div>
      </div>
    );
  }

  return (
    <EventForm
      mode="edit"
      categories={categories}
      initialValues={mapEventToFormData(event)}
      isPending={updateEventMutation.isPending}
      submitLabel="Enregistrer les modifications"
      title="Modifier l'événement"
      subtitle="Mets à jour les informations de ton événement publié."
      onCancel={() => navigate(`/events/${event.id}`)}
      onSubmit={async (formData) => {
        await updateEventMutation.mutateAsync({ eventId: event.id, eventData: formData });
        navigate(`/events/${event.id}`);
      }}
    />
  );
}
