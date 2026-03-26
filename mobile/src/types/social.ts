import type { Event, User, PaginatedResponse } from "./api";

// ============ FAVORITES ============

export interface FavoriteEvent extends Event {
  favoritesCount: number;
  favoritedAt: string;
}

export interface FavoriteStatus {
  isFavorited: boolean;
}

export interface FriendFavorite {
  id: string;
  name: string;
  avatar?: string;
}

// ============ REVIEWS ============

export interface Review {
  id: string;
  userId: string;
  eventId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface EventRating {
  average: number;
  count: number;
  distribution: Record<number, number>;
}

export interface CreateReviewRequest {
  rating: number;
  comment?: string;
}

// ============ FRIENDS ============

export interface Friend {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
  sender: Friend;
}

export interface SearchUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// ============ ROOMS ============

export type RoomVisibility = "public" | "private";
export type RoomRole = "member" | "moderator" | "admin";

export interface RoomLastMessage {
  content: string;
  createdAt: string;
  sender: { name: string };
}

export interface Room {
  id: string;
  name: string;
  eventId: string;
  creatorId: string;
  visibility: RoomVisibility;
  inviteCode?: string;
  createdAt: string;
  creator: { id: string; name: string; avatar?: string };
  event?: { id: string; title: string };
  membersCount: number;
  messagesCount: number;
  lastMessage: RoomLastMessage | null;
  myRole?: RoomRole;
}

export interface RoomDetail {
  id: string;
  name: string;
  eventId: string;
  creatorId: string;
  visibility: RoomVisibility;
  inviteCode?: string;
  createdAt: string;
  creator: { id: string; name: string; avatar?: string };
  event: { id: string; title: string; organizerId: string };
  members: RoomMember[];
  _count: { messages: number };
}

export interface RoomMember {
  id: string;
  roomId: string;
  userId: string;
  role: RoomRole;
  joinedAt: string;
  user: { id: string; name: string; avatar?: string };
}

export interface CreateRoomRequest {
  name: string;
  visibility: RoomVisibility;
}

// ============ MESSAGES ============

export interface ReactionGroup {
  emoji: string;
  count: number;
  users: { id: string; name: string }[];
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  parentId?: string;
  createdAt: string;
  deletedAt?: string;
  sender: { id: string; name: string; avatar?: string };
  parent?: {
    id: string;
    content: string;
    sender: { id: string; name: string };
  } | null;
  reactions: ReactionGroup[];
}

export interface MessagesResponse {
  data: Message[];
  nextCursor: string | null;
}

// ============ NOTIFICATIONS ============

export type NotificationType =
  | "friend_request"
  | "friend_accepted"
  | "room_invite"
  | "new_message"
  | "event_reminder"
  | "review_received";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  data?: Record<string, string>;
  read: boolean;
  createdAt: string;
}

export interface UnreadCount {
  count: number;
}

// ============ MODERATION ============

export type ReportReason = "spam" | "harassment" | "inappropriate" | "other";

export interface CreateReportRequest {
  targetType: "message" | "user" | "review";
  targetId: string;
  reason: ReportReason;
  details?: string;
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: string;
  targetId: string;
  reason: ReportReason;
  details?: string;
  resolved: boolean;
  createdAt: string;
  reporter: { id: string; name: string; email: string };
}
