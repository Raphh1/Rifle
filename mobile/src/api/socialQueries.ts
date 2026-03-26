import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { api } from "./axiosClient";
import type {
  FavoriteEvent,
  FavoriteStatus,
  FriendFavorite,
  Review,
  EventRating,
  CreateReviewRequest,
  Friend,
  FriendRequest,
  SearchUser,
  Room,
  RoomDetail,
  CreateRoomRequest,
  Message,
  MessagesResponse,
  Notification,
  UnreadCount,
  CreateReportRequest,
  Report,
} from "../types/social";
import type { PaginatedResponse } from "../types/api";

// ============ FAVORITES ============

export const useFavoriteStatus = (eventId: string) => {
  return useQuery({
    queryKey: ["favorite", eventId],
    queryFn: async () => {
      const res = await api.get<FavoriteStatus>(`/events/${eventId}/favorite/status`);
      return res.data;
    },
    enabled: !!eventId,
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, isFavorited }: { eventId: string; isFavorited: boolean }) => {
      if (isFavorited) {
        await api.delete(`/events/${eventId}/favorite`);
      } else {
        await api.post(`/events/${eventId}/favorite`);
      }
    },
    onMutate: async ({ eventId, isFavorited }) => {
      await queryClient.cancelQueries({ queryKey: ["favorite", eventId] });
      const previous = queryClient.getQueryData<FavoriteStatus>(["favorite", eventId]);
      queryClient.setQueryData(["favorite", eventId], { isFavorited: !isFavorited });
      return { previous, eventId };
    },
    onError: (_err, _vars, context) => {
      if (context) {
        queryClient.setQueryData(["favorite", context.eventId], context.previous);
      }
    },
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: ["favorite", vars.eventId] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
};

export const useMyFavorites = (page = 1) => {
  return useQuery({
    queryKey: ["favorites", page],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<FavoriteEvent>>("/me/favorites", {
        params: { page, limit: 12 },
      });
      return res.data;
    },
  });
};

export const useFriendsFavorites = (eventId: string) => {
  return useQuery({
    queryKey: ["favorites", "friends", eventId],
    queryFn: async () => {
      const res = await api.get<FriendFavorite[]>(`/events/${eventId}/favorites/friends`);
      return res.data;
    },
    enabled: !!eventId,
  });
};

// ============ REVIEWS ============

export const useEventReviews = (eventId: string, page = 1, sort = "recent") => {
  return useQuery({
    queryKey: ["reviews", eventId, page, sort],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Review>>(`/events/${eventId}/reviews`, {
        params: { page, limit: 10, sort },
      });
      return res.data;
    },
    enabled: !!eventId,
  });
};

export const useEventRating = (eventId: string) => {
  return useQuery({
    queryKey: ["rating", eventId],
    queryFn: async () => {
      const res = await api.get<EventRating>(`/events/${eventId}/rating`);
      return res.data;
    },
    enabled: !!eventId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, data }: { eventId: string; data: CreateReviewRequest }) => {
      const res = await api.post<Review>(`/events/${eventId}/reviews`, data);
      return res.data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", vars.eventId] });
      queryClient.invalidateQueries({ queryKey: ["rating", vars.eventId] });
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, data }: { eventId: string; data: CreateReviewRequest }) => {
      const res = await api.put<Review>(`/events/${eventId}/reviews`, data);
      return res.data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", vars.eventId] });
      queryClient.invalidateQueries({ queryKey: ["rating", vars.eventId] });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (eventId: string) => {
      await api.delete(`/events/${eventId}/reviews`);
    },
    onSuccess: (_data, eventId) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", eventId] });
      queryClient.invalidateQueries({ queryKey: ["rating", eventId] });
    },
  });
};

// ============ FRIENDS ============

export const useFriends = () => {
  return useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      const res = await api.get<Friend[]>("/friends");
      return res.data;
    },
  });
};

export const useFriendRequests = () => {
  return useQuery({
    queryKey: ["friends", "requests"],
    queryFn: async () => {
      const res = await api.get<FriendRequest[]>("/friends/requests");
      return res.data;
    },
  });
};

export const useSearchUsers = (query: string) => {
  return useQuery({
    queryKey: ["users", "search", query],
    queryFn: async () => {
      const res = await api.get<SearchUser[]>("/friends/search", { params: { q: query } });
      return res.data;
    },
    enabled: query.length >= 2,
  });
};

export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      await api.post(`/friends/request/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });
};

export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (friendshipId: string) => {
      await api.put(`/friends/request/${friendshipId}/accept`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useDeclineFriendRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (friendshipId: string) => {
      await api.put(`/friends/request/${friendshipId}/decline`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useRemoveFriend = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/friends/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });
};

export const useFriendEvents = (userId: string) => {
  return useQuery({
    queryKey: ["friends", userId, "events"],
    queryFn: async () => {
      const res = await api.get(`/friends/${userId}/events`);
      return res.data;
    },
    enabled: !!userId,
  });
};

// ============ ROOMS ============

export const useEventRooms = (eventId: string) => {
  return useQuery({
    queryKey: ["rooms", "event", eventId],
    queryFn: async () => {
      const res = await api.get<Room[]>(`/events/${eventId}/rooms`);
      return res.data;
    },
    enabled: !!eventId,
  });
};

export const useMyRooms = () => {
  return useQuery({
    queryKey: ["rooms", "me"],
    queryFn: async () => {
      const res = await api.get<Room[]>("/rooms/me");
      return res.data;
    },
  });
};

export const useRoomDetail = (roomId: string) => {
  return useQuery({
    queryKey: ["rooms", roomId],
    queryFn: async () => {
      const res = await api.get<RoomDetail>(`/rooms/${roomId}`);
      return res.data;
    },
    enabled: !!roomId,
  });
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, data }: { eventId: string; data: CreateRoomRequest }) => {
      const res = await api.post<Room>(`/events/${eventId}/rooms`, data);
      return res.data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["rooms", "event", vars.eventId] });
      queryClient.invalidateQueries({ queryKey: ["rooms", "me"] });
    },
  });
};

export const useJoinRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (roomId: string) => {
      await api.post(`/rooms/${roomId}/join`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
};

export const useJoinRoomByCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (inviteCode: string) => {
      const res = await api.post(`/rooms/join/${inviteCode}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
};

export const useInviteToRoom = () => {
  return useMutation({
    mutationFn: async ({ roomId, userIds }: { roomId: string; userIds: string[] }) => {
      await api.post(`/rooms/${roomId}/invite`, { userIds });
    },
  });
};

export const useLeaveRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (roomId: string) => {
      await api.delete(`/rooms/${roomId}/leave`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
};

export const useDeleteRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (roomId: string) => {
      await api.delete(`/rooms/${roomId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
};

export const useKickMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ roomId, userId }: { roomId: string; userId: string }) => {
      await api.delete(`/rooms/${roomId}/members/${userId}`);
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["rooms", vars.roomId] });
    },
  });
};

// ============ MESSAGES ============

export const useRoomMessages = (roomId: string) => {
  return useQuery({
    queryKey: ["messages", roomId],
    queryFn: async () => {
      const res = await api.get<MessagesResponse>(`/rooms/${roomId}/messages`);
      return res.data;
    },
    enabled: !!roomId,
    refetchInterval: false,
  });
};

export const useSendMessage = () => {
  return useMutation({
    mutationFn: async ({ roomId, content, parentId }: { roomId: string; content: string; parentId?: string }) => {
      const res = await api.post<Message>(`/rooms/${roomId}/messages`, { content, parentId });
      return res.data;
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (messageId: string) => {
      await api.delete(`/messages/${messageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
};

export const useToggleReaction = () => {
  return useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      await api.post(`/messages/${messageId}/reactions`, { emoji });
    },
  });
};

// ============ NOTIFICATIONS ============

export const useNotifications = (page = 1) => {
  return useQuery({
    queryKey: ["notifications", page],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Notification>>("/notifications", {
        params: { page, limit: 20 },
      });
      return res.data;
    },
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: async () => {
      const res = await api.get<UnreadCount>("/notifications/unread-count");
      return res.data;
    },
    refetchInterval: 30000, // Poll every 30s
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.put("/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

// ============ MODERATION ============

export const useCreateReport = () => {
  return useMutation({
    mutationFn: async (data: CreateReportRequest) => {
      await api.post("/reports", data);
    },
  });
};

export const useBlockUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      await api.post(`/blocks/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
};

export const useUnblockUser = () => {
  return useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/blocks/${userId}`);
    },
  });
};
