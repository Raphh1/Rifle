import { useOrganizerDashboard } from "../../api/queries";
import "../dashboard.css";

export function OrganizerDashboard() {
  const {
    data: dashboard,
    isLoading,
    isError,
    error,
  } = useOrganizerDashboard();

  if (isLoading) return <div className="loading">Chargement du tableau de bord...</div>;

  if (isError || !dashboard) {
    return (
      <div className="error">
        Erreur : {error instanceof Error ? error.message : "Impossible de charger le tableau de bord"}
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1>Tableau de bord - Organisateur</h1>

      {/* Cartes statistiques */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Événements créés</h3>
          <p className="stat-value">{dashboard.eventsCount}</p>
        </div>

        <div className="stat-card">
          <h3>Billets vendus</h3>
          <p className="stat-value">{dashboard.ticketsSold}</p>
        </div>

        <div className="stat-card">
          <h3>Revenu total</h3>
          <p className="stat-value">{dashboard.revenues.toFixed(2)}€</p>
        </div>
      </div>

      {/* Tableau des événements */}
      <section className="dashboard-section">
        <h2>Mes événements</h2>
        {dashboard.events.length === 0 ? (
          <p>Vous n'avez pas encore créé d'événement.</p>
        ) : (
          <table className="events-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Billets vendus</th>
                <th>Capacité</th>
                <th>Revenus</th>
                <th>Taux de remplissage</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.events.map((event) => (
                <tr key={event.id}>
                  <td>{event.title}</td>
                  <td>{event.ticketsSold}</td>
                  <td>{event.capacity}</td>
                  <td>{event.revenues.toFixed(2)}€</td>
                  <td>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${(event.ticketsSold / event.capacity) * 100}%`,
                        }}
                      />
                      <span>
                        {(
                          (event.ticketsSold / event.capacity) *
                          100
                        ).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
