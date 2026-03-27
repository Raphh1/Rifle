import { useState, useRef, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useUpdateProfile, useUpdatePassword, useDeleteAccount } from "../../api/queries";

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ src, name }: { src?: string; name: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="h-24 w-24 rounded-full object-cover ring-4 ring-indigo-500/30"
      />
    );
  }
  return (
    <div className="h-24 w-24 rounded-full bg-indigo-600 flex items-center justify-center text-3xl font-bold text-white ring-4 ring-indigo-500/30">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// ─── Delete confirmation modal ────────────────────────────────────────────────

function DeleteModal({ onConfirm, onCancel, isPending }: {
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl max-w-md w-full mx-4 p-6 space-y-4 animate-[fade-in_0.15s_ease]">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Supprimer le compte</h3>
            <p className="text-sm text-slate-400">Cette action est irréversible.</p>
          </div>
        </div>
        <p className="text-sm text-slate-300">
          Toutes vos données (billets, événements) seront définitivement supprimées.
          Êtes-vous sûr de vouloir continuer ?
        </p>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 rounded-xl border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition disabled:opacity-50"
          >
            {isPending ? "Suppression…" : "Oui, supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function ProfilePage() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  // ── Info form state ──
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user?.avatar);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [infoSuccess, setInfoSuccess] = useState<string | null>(null);
  const [infoError, setInfoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Password form state ──
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);

  // ── Delete modal ──
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const updateProfile = useUpdateProfile();
  const updatePassword = useUpdatePassword();
  const deleteAccount = useDeleteAccount();

  // ── Avatar picker ──
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // ── Submit info ──
  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoError(null);
    setInfoSuccess(null);

    const formData = new FormData();
    if (name !== user?.name) formData.append("name", name);
    if (email !== user?.email) formData.append("email", email);
    if (avatarFile) formData.append("avatar", avatarFile);

    if (![...formData.entries()].length) {
      setInfoError("Aucune modification détectée.");
      return;
    }

    try {
      await updateProfile.mutateAsync(formData);
      await refreshUser();
      setAvatarFile(null);
      setInfoSuccess("Profil mis à jour avec succès.");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setInfoError(msg ?? "Une erreur est survenue.");
    }
  };

  // ── Submit password ──
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    if (newPassword !== confirmPassword) {
      setPwdError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (newPassword.length < 6) {
      setPwdError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    try {
      const res = await updatePassword.mutateAsync({ currentPassword, newPassword });
      setPwdSuccess(res.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setPwdError(msg ?? "Une erreur est survenue.");
    }
  };

  // ── Delete account ──
  const handleDeleteConfirm = async () => {
    try {
      await deleteAccount.mutateAsync();
      logout();
      navigate("/login");
    } catch {
      setShowDeleteModal(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-[fade-in_0.2s_ease,slide-up_0.2s_ease]">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
          Mon profil
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          Gérez vos informations personnelles et la sécurité de votre compte.
        </p>
      </div>

      {/* ── Section 1 : Identité ── */}
      <section className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 space-y-6">
        <h2 className="text-base font-semibold text-white border-b border-slate-700 pb-3">
          Informations personnelles
        </h2>

        {/* Avatar */}
        <div className="flex items-center gap-5">
          <Avatar src={avatarPreview} name={name || user.name} />
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition"
            >
              Changer la photo
            </button>
            <p className="text-xs text-slate-500">JPG, PNG, WebP — 5 Mo max</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        {/* Rôle (read-only) */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Rôle</span>
          <span className="rounded-full bg-indigo-500/15 px-3 py-0.5 text-xs font-semibold text-indigo-300 capitalize">
            {user.role}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleInfoSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nom</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="Votre nom"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="votre@email.com"
            />
            {email !== user.email && (
              <p className="text-xs text-amber-400 mt-1">
                Une validation email sera requise lors de l&apos;activation des notifications.
              </p>
            )}
          </div>

          {infoError && <p className="text-sm text-red-400">{infoError}</p>}
          {infoSuccess && <p className="text-sm text-emerald-400">{infoSuccess}</p>}

          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateProfile.isPending ? "Enregistrement…" : "Enregistrer les modifications"}
          </button>
        </form>
      </section>

      {/* ── Section 2 : Sécurité ── */}
      <section className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 space-y-5">
        <h2 className="text-base font-semibold text-white border-b border-slate-700 pb-3">
          Changer le mot de passe
        </h2>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Mot de passe actuel
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Confirmer le nouveau mot de passe
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>

          {pwdError && <p className="text-sm text-red-400">{pwdError}</p>}
          {pwdSuccess && <p className="text-sm text-emerald-400">{pwdSuccess}</p>}

          <button
            type="submit"
            disabled={updatePassword.isPending}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updatePassword.isPending ? "Mise à jour…" : "Changer le mot de passe"}
          </button>
        </form>
      </section>

      {/* ── Section 3 : Zone dangereuse ── */}
      <section className="bg-slate-900 border border-red-500/20 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-red-400 border-b border-red-500/20 pb-3">
          Zone dangereuse
        </h2>
        <p className="text-sm text-slate-400">
          La suppression de votre compte est définitive. Tous vos billets et données associées
          seront effacés sans possibilité de récupération.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400
                     hover:bg-red-500/20 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-red-500/30"
        >
          Supprimer mon compte
        </button>
      </section>

      {showDeleteModal && (
        <DeleteModal
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
          isPending={deleteAccount.isPending}
        />
      )}
    </div>
  );
}
