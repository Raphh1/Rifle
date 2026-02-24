import { useParams, useNavigate } from "react-router-dom";
import { useEventDetail, useBuyTicket } from "../../api/queries";

export function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: event, isLoading, isError, error } = useEventDetail(id!);
  const buyTicketMutation = useBuyTicket();

  if (isLoading) return (
    <div className="container mx-auto p-4">
      <div className="text-center text-gray-600">Chargement...</div>
    </div>
  );

  if (isError || !event) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-red-600">Erreur : {error instanceof Error ? error.message : "Événement non trouvé"}</div>
      </div>
    );
  }

  const handleBuyTicket = async () => {
    try {
      const result = await buyTicketMutation.mutateAsync(event.id);
      alert(result.message);
      navigate('/tickets');
    } catch (err) {
      console.error('Erreur lors de l\'achat du billet:', err);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {event.imageUrl && (
        <img src={event.imageUrl} alt={event.title} className="w-full rounded-lg mb-4 object-cover" />
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-semibold mb-4">{event.title}</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm text-gray-600">Date :</label>
            <div className="font-medium">{new Date(event.date).toLocaleDateString()}</div>
          </div>
          <div>
            <label className="text-sm text-gray-600">Lieu :</label>
            <div className="font-medium">{event.location}</div>
          </div>
          <div>
            <label className="text-sm text-gray-600">Prix :</label>
            <div className="font-medium">{event.price}€</div>
          </div>
          <div>
            <label className="text-sm text-gray-600">Places :</label>
            <div className="font-medium">{event.remaining} / {event.capacity} disponibles</div>
          </div>
          {event.organizer && (
            <div>
              <label className="text-sm text-gray-600">Organisateur :</label>
              <div className="font-medium">{event.organizer.name}</div>
            </div>
          )}
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-medium mb-2">Description</h2>
          <p className="text-gray-700 leading-relaxed">{event.description}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleBuyTicket}
            disabled={event.remaining === 0 || buyTicketMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {buyTicketMutation.isPending ? 'Achat en cours...' : 'Acheter un billet'}
          </button>
          <button onClick={() => navigate('/events')} className="px-4 py-2 bg-gray-200 rounded">Retour</button>
        </div>
      </div>
    </div>
  );
}
