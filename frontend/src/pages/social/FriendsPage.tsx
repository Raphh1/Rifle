import { useState } from "react";
import {
  useFriends,
  useFriendRequests,
  useSearchUsers,
  useSendFriendRequest,
  useAcceptFriendRequest,
  useDeclineFriendRequest,
  useRemoveFriend,
} from "../../api/socialQueries";

export function FriendsPage() {
  const [tab, setTab] = useState<"friends" | "requests" | "search">("friends");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: friends, isLoading: friendsLoading } = useFriends();
  const { data: requests } = useFriendRequests();
  const { data: searchResults } = useSearchUsers(searchQuery);
  const sendRequest = useSendFriendRequest();
  const acceptRequest = useAcceptFriendRequest();
  const declineRequest = useDeclineFriendRequest();
  const removeFriend = useRemoveFriend();

  const tabs = [
    { key: "friends" as const, label: "Amis", count: friends?.length },
    { key: "requests" as const, label: "Demandes", count: requests?.length },
    { key: "search" as const, label: "Rechercher" },
  ];

  return (
    <div className="animate-fade-in relative z-10 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Amis</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
              tab === t.key ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {t.label}
            {t.count ? (
              <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">{t.count}</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Friends List */}
      {tab === "friends" && (
        <div className="space-y-3">
          {friendsLoading ? (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            </div>
          ) : !friends?.length ? (
            <p className="text-slate-400 text-center py-10">Aucun ami pour le moment</p>
          ) : (
            friends.map((friend) => (
              <div key={friend.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold">
                    {friend.avatar ? (
                      <img src={friend.avatar} alt={friend.name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      friend.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{friend.name}</p>
                    <p className="text-slate-400 text-sm">{friend.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFriend.mutate(friend.id)}
                  className="text-sm text-red-400 hover:text-red-300 transition px-3 py-1.5 rounded-lg hover:bg-red-500/10"
                >
                  Retirer
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Friend Requests */}
      {tab === "requests" && (
        <div className="space-y-3">
          {!requests?.length ? (
            <p className="text-slate-400 text-center py-10">Aucune demande en attente</p>
          ) : (
            requests.map((req) => (
              <div key={req.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold">
                    {req.sender.avatar ? (
                      <img src={req.sender.avatar} alt={req.sender.name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      req.sender.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{req.sender.name}</p>
                    <p className="text-slate-400 text-sm">{req.sender.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => acceptRequest.mutate(req.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition"
                  >
                    Accepter
                  </button>
                  <button
                    onClick={() => declineRequest.mutate(req.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-600 transition"
                  >
                    Refuser
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Search */}
      {tab === "search" && (
        <div>
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
          />
          <div className="space-y-3">
            {searchResults?.map((user) => {
              const isFriend = friends?.some((f) => f.id === user.id);
              return (
                <div key={user.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-slate-400 text-sm">{user.email}</p>
                    </div>
                  </div>
                  {isFriend ? (
                    <span className="text-sm text-emerald-400 px-3 py-1.5">Ami</span>
                  ) : (
                    <button
                      onClick={() => sendRequest.mutate(user.id)}
                      disabled={sendRequest.isPending}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition disabled:opacity-50"
                    >
                      Ajouter
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
