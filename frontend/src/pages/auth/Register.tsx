import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { registerSchema, type RegisterFormData } from "../../utils/validation";
import { ZodError } from "zod";

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
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    setErrors({});

    try {
      const validatedData = registerSchema.parse(formData);
      await register(validatedData.name, validatedData.email, validatedData.password);
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

  const bannerError = generalError || authError;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center py-8 px-4 sm:px-6 lg:px-8 relative">
      {/* Background Orbs inside a fixed container to prevent scrollbar issues */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px]" />
      </div>

      <div className="w-full max-w-7xl relative z-10 my-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left marketing panel */}
          <div className="hidden lg:block animate-slide-up">
            <div className="relative group rounded-3xl border border-slate-700/50 bg-slate-900/40 backdrop-blur-xl p-8 shadow-2xl transition-all duration-300 hover:border-slate-600/50 hover:shadow-indigo-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-blue-500/5 rounded-3xl pointer-events-none" />
              
              <div className="relative z-10">
                <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-300 shadow-sm backdrop-blur-md">
                  <span className="flex h-2 w-2 rounded-full bg-indigo-400 mr-2 animate-pulse"></span>
                  Rifle • Crée ton compte
                </div>

                <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white mb-3">
                  Rejoins Rifle <span className="inline-block animate-[bounce_2s_infinite]">✨</span>
                </h1>

                <p className="text-base text-slate-300 leading-relaxed mb-6">
                  Crée ton compte pour acheter des billets, suivre tes événements et accéder au dashboard dans une interface optimisée.
                </p>

                <div className="grid gap-3">
                  <div className="group/feature flex items-center space-x-4 rounded-2xl border border-slate-700/40 bg-slate-800/40 p-3 transition-all hover:bg-slate-800/60 hover:-translate-y-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 group-hover/feature:bg-indigo-500 group-hover/feature:text-white transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">Simple</div>
                      <div className="text-xs text-slate-400">Inscription en quelques secondes.</div>
                    </div>
                  </div>

                  <div className="group/feature flex items-center space-x-4 rounded-2xl border border-slate-700/40 bg-slate-800/40 p-3 transition-all hover:bg-slate-800/60 hover:-translate-y-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 group-hover/feature:bg-blue-500 group-hover/feature:text-white transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">Pratique</div>
                      <div className="text-xs text-slate-400">Accès rapide à tes tickets et événements.</div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-sm text-slate-400">
                  Déjà un compte ?{" "}
                  <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                    Se connecter
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right form */}
          <div className="flex justify-center animate-slide-up" style={{ animationDelay: '150ms' }}>
            <div className="w-full max-w-md">
              <div className="relative rounded-3xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
                <div className="text-center mb-6">
                  <div className="mx-auto h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center mb-3 shadow-lg shadow-indigo-500/25">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-white">Créer un compte</h2>
                  <p className="mt-1 text-sm text-slate-400">Rejoignez la communauté Rifle</p>
                </div>

                {bannerError && (
                  <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-center animate-fade-in">
                    <svg className="h-5 w-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {bannerError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="name">
                      Nom complet
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                        <svg className="h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={isLoading}
                        placeholder="John Doe"
                        autoComplete="name"
                        className={[
                          "block w-full rounded-xl border bg-slate-800/50 py-2.5 pl-10 pr-3 text-white shadow-sm transition-colors",
                          "placeholder:text-slate-500",
                          "focus:outline-none focus:ring-2 focus:border-indigo-500",
                          "disabled:opacity-50",
                          errors.name ? "border-red-500/50 focus:ring-red-500" : "border-slate-700 focus:ring-indigo-500",
                        ].join(" ")}
                      />
                    </div>
                    {errors.name && <div className="mt-1 text-sm text-red-400 animate-fade-in">{errors.name}</div>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="email">
                      Email
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                        <svg className="h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 0l-8 0m12-7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2z" />
                        </svg>
                      </div>
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
                          "block w-full rounded-xl border bg-slate-800/50 py-2.5 pl-10 pr-3 text-white shadow-sm transition-colors",
                          "placeholder:text-slate-500",
                          "focus:outline-none focus:ring-2 focus:border-indigo-500",
                          "disabled:opacity-50",
                          errors.email ? "border-red-500/50 focus:ring-red-500" : "border-slate-700 focus:ring-indigo-500",
                        ].join(" ")}
                      />
                    </div>
                    {errors.email && <div className="mt-1 text-sm text-red-400 animate-fade-in">{errors.email}</div>}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="password">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                        <svg className="h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.1 0 2 .9 2 2v2h-4v-2c0-1.1.9-2 2-2zm6 2v6H6v-6a6 6 0 1112 0z" />
                        </svg>
                      </div>
                      <input
                        id="password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={isLoading}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className={[
                          "block w-full rounded-xl border bg-slate-800/50 py-2.5 pl-10 pr-3 text-white shadow-sm transition-colors",
                          "placeholder:text-slate-500",
                          "focus:outline-none focus:ring-2 focus:border-indigo-500",
                          "disabled:opacity-50",
                          errors.password ? "border-red-500/50 focus:ring-red-500" : "border-slate-700 focus:ring-indigo-500",
                        ].join(" ")}
                      />
                    </div>
                    {errors.password && <div className="mt-1 text-sm text-red-400 animate-fade-in">{errors.password}</div>}
                  </div>

                  {/* Submit */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group relative w-full flex justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2.5 font-semibold text-white shadow-lg shadow-indigo-500/25
                                 hover:from-indigo-500 hover:to-blue-500 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0
                                 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                    >
                      {isLoading ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        "S'inscrire"
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-6 relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700/50" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-slate-900 px-4 text-slate-400 rounded-full">Déjà membre ?</span>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <Link
                    to="/login"
                    className="w-full inline-flex justify-center items-center rounded-xl border border-slate-600 bg-slate-800/50 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700/50 transition-colors"
                  >
                    Se connecter
                  </Link>
                </div>

                <div className="mt-4 text-center">
                  <Link to="/" className="text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors">
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