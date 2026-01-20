import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { registerSchema, type RegisterFormData } from "../../utils/validation";
import { ZodError } from "zod";
import "../auth.css";

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading, error: authError } = useAuth();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    setErrors({});

    try {
      const validatedData = registerSchema.parse(formData);
      await register(
        validatedData.name,
        validatedData.email,
        validatedData.password
      );
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.issues.forEach((issue) => {
          const path = issue.path[0];
          if (path) fieldErrors[String(path)] = issue.message;
        });
        setErrors(fieldErrors);
      } else if (err instanceof Error) {
        setGeneralError(err.message || "Registration failed");
      } else {
        setGeneralError("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Créer un compte</h1>
        <p className="auth-subtitle">Rejoignez la communauté Rifle</p>

        {(generalError || authError) && (
          <div className="error-text" style={{ textAlign: "center", marginBottom: "1rem" }}>
            {generalError || authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Nom complet</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
              className={errors.name ? "input-error" : ""}
              placeholder="John Doe"
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              className={errors.email ? "input-error" : ""}
              placeholder="john@example.com"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              className={errors.password ? "input-error" : ""}
              placeholder="••••••••"
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading} style={{ marginTop: "1rem" }}>
            {isLoading ? "Création en cours..." : "S'inscrire"}
          </button>
        </form>

        <div className="auth-footer">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </div>
      </div>
    </div>
  );
}
