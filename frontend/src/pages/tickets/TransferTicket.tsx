import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTicketDetail, useTransferTicket } from "../../api/queries";
import "../tickets.css";

export function TransferTicket() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: ticket, isLoading, isError, error } = useTicketDetail(id!);
  const transferMutation = useTransferTicket();

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) return <div className="loading">Chargement du billet...</div>;

  if (isError || !ticket) {
    return (
      <div className="error">
        Erreur : {error instanceof Error ? error.message : "Billet non trouvé"}
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      await transferMutation.mutateAsync({ ticketId: id!, email });
      alert(`Ticket transféré à ${email}`);
      navigate("/tickets");
    } catch (err: any) {
      alert(err?.response?.data?.error || err?.message || "Erreur lors du transfert");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="transfer-container">
      <h1>Transférer le billet</h1>

      <div className="ticket-card small">
        {ticket.event && (
          <>
            <h3>{ticket.event.title}</h3>
            <p className="event-date">{new Date(ticket.event.date).toLocaleDateString()}</p>
          </>
        )}

        <p><strong>ID :</strong> {ticket.id}</p>
        <p><strong>Statut :</strong> {ticket.status}</p>

        <form onSubmit={handleSubmit} className="transfer-form">
          <label htmlFor="email">Email du destinataire</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="destinataire@example.com"
            required
          />

          <div className="ticket-actions">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Transfert..." : "Transférer le billet"}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate("/tickets")}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}