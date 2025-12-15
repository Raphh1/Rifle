import { useAdminDashboard } from "../../api/queries";
import "./dashboard.css";

export function AdminDashboard() {
  const {
    data: dashboard,
    isLoading,
    isError,
    error,
  } = useAdminDashboard();

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
      <h1>Tableau de bord - Administrateur</h1>

      {/* Cartes statistiques */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Utilisateurs inscrits</h3>
          <p className="stat-value">{dashboard.users}</p>
        </div>

        <div className="stat-card">
          <h3>Événements créés</h3>
          <p className="stat-value">{dashboard.events}</p>
        </div>

        <div className="stat-card">
          <h3>Billets vendus</h3>
          <p className="stat-value">{dashboard.ticketsSold}</p>
        </div>

        <div className="stat-card highlight">
          <h3>Revenu total</h3>
          <p className="stat-value">{dashboard.revenues.toFixed(2)}€</p>
        </div>
      </div>

      {/* Autres sections peuvent être ajoutées ici */}
      <section className="dashboard-section">
        <h2>Résumé plateforme</h2>
        <div className="summary-info">
          <p>Plateforme d'événements en bon fonctionnement</p>
          <p>Revenu moyen par billet: {(dashboard.revenues / Math.max(dashboard.ticketsSold, 1)).toFixed(2)}€</p>
        </div>
      </section>
    </div>
  );
}
