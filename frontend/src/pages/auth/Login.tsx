import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { loginSchema, type LoginFormData } from "../../utils/validation";
import { ZodError } from "zod";

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error: authError } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    setErrors({});

    try {
      const validatedData = loginSchema.parse(formData);
      await login(validatedData.email, validatedData.password);
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
        setGeneralError(err.message || "Login failed");
      } else {
        setGeneralError("An unexpected error occurred");
      }
    }
  };

  const bannerError = generalError || authError;

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left marketing panel */}
          <div className="hidden lg:block">
            <div className="rounded-3xl border border-slate-700 bg-slate-800 p-10 shadow-sm">
              <div className="inline-flex items-center rounded-full bg-indigo-900 px-3 py-1 text-sm font-semibold text-indigo-400">
                Rifle • Accès sécurisé
              </div>

              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white">
                Re-bienvenue 👋
              </h1>

              <p className="mt-3 text-slate-300 leading-relaxed">
                Connecte-toi pour gérer tes événements, consulter tes billets et accéder à ton dashboard.
              </p>

              <div className="mt-8 grid gap-4">
                <div className="rounded-2xl border border-slate-700 bg-slate-700 p-4">
                  <div className="text-sm font-semibold text-white">Rapide</div>
                  <div className="text-sm text-slate-300 mt-1">Accès instantané à tes événements.</div>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-slate-700 p-4">
                  <div className="text-sm font-semibold text-white">Sécurisé</div>
                  <div className="text-sm text-slate-300 mt-1">Sessions et permissions gérées proprement.</div>
                </div>
              </div>

              <div className="mt-10 text-sm text-slate-400">
                Pas de compte ?{" "}
                <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300">
                  Créer un compte
                </Link>
              </div>
            </div>
          </div>

          {/* Right form */}
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <div className="rounded-3xl border border-slate-700 bg-slate-800 p-6 sm:p-8 shadow-sm">
                <div className="text-center">
                  <h2 className="text-2xl font-extrabold tracking-tight text-white">Connexion</h2>
                  <p className="mt-1 text-sm text-slate-400">Bon retour parmi nous</p>
                </div>

                {bannerError && (
                  <div className="mt-6 rounded-2xl border border-red-900 bg-red-950 px-4 py-3 text-sm text-red-400">
                    {bannerError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-white" htmlFor="email">
                      Email
                    </label>

                    <div className="relative mt-1">
                      <svg
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 12H8m8 0l-8 0m12-7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2z"
                        />
                      </svg>

                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isLoading}
                        placeholder="john@example.com"
                        autoComplete="email"
                        className={[
                          "w-full rounded-xl border bg-slate-700 py-2.5 pl-10 pr-3 text-white shadow-sm",
                          "placeholder:text-slate-500",
                          "focus:outline-none focus:ring-4 focus:ring-indigo-900 focus:border-indigo-500",
                          "disabled:opacity-60",
                          errors.email ? "border-red-700 focus:border-red-600 focus:ring-red-900" : "border-slate-600",
                        ].join(" ")}
                      />
                    </div>

                    {errors.email && <div className="mt-1 text-sm text-red-400">{errors.email}</div>}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-semibold text-white" htmlFor="password">
                      Mot de passe
                    </label>

                    <div className="relative mt-1">
                      <svg
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 11c1.1 0 2 .9 2 2v2h-4v-2c0-1.1.9-2 2-2zm6 2v6H6v-6a6 6 0 1112 0z"
                        />
                      </svg>

                      <input
                        id="password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={isLoading}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className={[
                          "w-full rounded-xl border bg-slate-700 py-2.5 pl-10 pr-3 text-white shadow-sm",
                          "placeholder:text-slate-500",
                          "focus:outline-none focus:ring-4 focus:ring-indigo-900 focus:border-indigo-500",
                          "disabled:opacity-60",
                          errors.password ? "border-red-700 focus:border-red-600 focus:ring-red-900" : "border-slate-600",
                        ].join(" ")}
                      />
                    </div>

                    {errors.password && <div className="mt-1 text-sm text-red-400">{errors.password}</div>}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white shadow-sm
                               hover:bg-indigo-500 transition disabled:opacity-60
                               focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-900"
                  >
                    {isLoading ? "Connexion..." : "Se connecter"}
                  </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-400">
                  Pas encore de compte ?{" "}
                  <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300">
                    S&apos;inscrire
                  </Link>
                </div>

                <div className="mt-4 text-center">
                  <Link to="/" className="text-sm text-slate-500 hover:text-slate-400">
                    ← Retour à l'accueil
                  </Link>
                </div>
              </div>

              <p className="mt-4 text-center text-xs text-slate-500">
                © {new Date().getFullYear()} Rifle. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}