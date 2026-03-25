import { useAdminUsers, useUpdateUserRole } from "../../api/queries";
import { useAuth } from "../../context/useAuth";

const ROLE_LABELS: Record<string, string> = {
  user: "Utilisateur",
  organizer: "Organisateur",
  admin: "Admin",
};

const ROLE_BADGE: Record<string, string> = {
  user: "bg-slate-700/60 text-slate-300 border-slate-600/50",
  organizer: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  admin: "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

export function AdminUsers() {
  const { user: currentUser } = useAuth();
  const { data: users, isLoading, isError, error } = useAdminUsers();
  const updateRole = useUpdateUserRole();

  if (isLoading) {
    return (
      <div className="flex justify-center p-12 animate-fade-in">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (isError || !users) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-500 backdrop-blur-sm animate-fade-in">
        <div className="flex items-center gap-3">
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">
            Erreur : {error instanceof Error ? error.message : "Impossible de charger les utilisateurs"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl animate-fade-in">
      {/* Header */}
      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Gestion des utilisateurs
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mt-2 font-medium">
          {users.length} utilisateur{users.length !== 1 ? "s" : ""} inscrit{users.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Table */}
      <section
        className="animate-slide-up overflow-hidden rounded-3xl border border-slate-700/50 bg-slate-900/40 backdrop-blur-xl shadow-2xl relative"
        style={{ animationDelay: "100ms" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-blue-500/5 pointer-events-none" />

        <div className="p-6 sm:p-8 border-b border-slate-700/50 relative z-10">
          <h2 className="text-xl font-extrabold text-white">Tous les utilisateurs</h2>
          <p className="text-sm text-slate-400 mt-1">Modifiez les rôles directement depuis le tableau</p>
        </div>

        {users.length === 0 ? (
          <div className="p-12 text-center text-slate-400 relative z-10 flex flex-col items-center">
            <div className="mx-auto h-16 w-16 mb-4 rounded-full bg-slate-800/80 border border-slate-700/50 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-slate-300">Aucun utilisateur</p>
          </div>
        ) : (
          <div className="overflow-x-auto relative z-10">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-800/30">
                <tr className="text-left text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  <th className="px-6 py-4">Nom</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Rôle actuel</th>
                  <th className="px-6 py-4 whitespace-nowrap">Inscrit le</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  const isPending = updateRole.isPending && (updateRole.variables as { id: string })?.id === u.id;

                  return (
                    <tr key={u.id} className="group hover:bg-slate-800/40 transition-all duration-200">
                      <td className="px-6 py-5">
                        <div className="font-medium text-white group-hover:text-indigo-300 transition-colors">
                          {u.name}
                          {isSelf && (
                            <span className="ml-2 text-xs text-slate-500 font-normal">(vous)</span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-5 text-slate-400">{u.email}</td>

                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${ROLE_BADGE[u.role] ?? ROLE_BADGE.user}`}>
                          {ROLE_LABELS[u.role] ?? u.role}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-slate-400 whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-6 py-5">
                        {isSelf ? (
                          <span className="text-xs text-slate-600 italic">Non modifiable</span>
                        ) : (
                          <div className="relative">
                            <select
                              value={u.role}
                              disabled={isPending}
                              onChange={(e) => updateRole.mutate({ id: u.id, role: e.target.value })}
                              className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200
                                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                                         disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                              <option value="user">Utilisateur</option>
                              <option value="organizer">Organisateur</option>
                              <option value="admin">Admin</option>
                            </select>
                            {isPending && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
