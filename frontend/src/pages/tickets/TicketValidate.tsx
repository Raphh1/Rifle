import { useParams, useNavigate } from "react-router-dom";
import { useTicketDetail, useValidateTicket } from "../../api/queries";
import "../tickets.css";

export function TicketValidate() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: ticket, isLoading, isError, error } = useTicketDetail(id!);
  const validateMutation = useValidateTicket();

  if (isLoading) return <div className="loading">Chargement du billet...</div>;

  if (isError || !ticket) {
    return (
      <div className="error">
        Erreur : {error instanceof Error ? error.message : "Billet non trouvé"}
      </div>
    );
  }

  const handleValidate = async () => {
    try {
      await validateMutation.mutateAsync({ qrCode: ticket.qrCode });
      alert("Billet validé avec succès !");
      navigate("/tickets");
    } catch (err) {
      console.error("Erreur lors de la validation:", err);
    }
  };

  return (
    <div className="ticket-validate-container">
      <h1>Valider le billet</h1>

      <div className="ticket-validate-card">
        {ticket.event && (
          <>
            <h2>{ticket.event.title}</h2>
            <p className="event-info">
              {new Date(ticket.event.date).toLocaleDateString()} -{" "}
              {ticket.event.location}
            </p>
          </>
        )}

        <div className="ticket-qr-large">
          <img src={ticket.qrCode} alt="QR Code du billet" />
        </div>

        <div className="ticket-details">
          <div className="detail">
            <label>ID du billet :</label>
            <code>{ticket.id}</code>
          </div>

          <div className="detail">
            <label>Statut :</label>
            <span className={`status status-${ticket.status}`}>
              {ticket.status === "paid" && "Payé"}
              {ticket.status === "pending" && "En attente"}
              {ticket.status === "used" && "Utilisé"}
            </span>
          </div>
        </div>

        <div className="ticket-actions">
          <button
            onClick={handleValidate}
            disabled={ticket.status !== "paid" || validateMutation.isPending}
            className="btn-primary"
          >
            {validateMutation.isPending
              ? "Validation en cours..."
              : "Valider le billet"}
          </button>
          <button
            onClick={() => navigate("/tickets")}
            className="btn-secondary"
          >
            Retour
          </button>
        </div>
      </div>
    </div>
  );
}
