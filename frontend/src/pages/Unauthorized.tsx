import { Link } from "react-router-dom";

export function Unauthorized() {
  return (
    <div style={{ padding: "3rem 1rem", textAlign: "center" }}>
      <h1>403 - Accès refusé</h1>
      <p>Vous n'avez pas les droits nécessaires pour accéder à cette page.</p>
      <p>Seuls les organisateurs peuvent créer des événements.</p>
      <Link to="/events" className="btn-primary" style={{ marginTop: "1rem", display: "inline-block" }}>
        Retour aux événements
      </Link>
    </div>
  );
}
