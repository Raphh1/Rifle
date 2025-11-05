/**
 * API Contract Types
 * Defines all request/response types for the Rifle API
 */

// ============ COMMON ============

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginationInfo {
  page: number;
  totalPages: number;
}

// ============ AUTH ============

export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "organizer" | "admin";
}

export interface AuthData {
  user: User;
  accessToken: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

// ============ EVENTS ============

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date
  location: string;
  price: number;
  capacity: number;
  remaining: number;
  imageUrl: string;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  capacity: number;
  imageUrl: string;
}

export interface UpdateEventRequest extends CreateEventRequest {}

export interface EventListResponse {
  data: Event[];
  pagination: PaginationInfo;
}

// ============ TICKETS ============

export type TicketStatus = "paid" | "pending" | "used";

export interface Ticket {
  id: string;
  eventId: string;
  status: TicketStatus;
  qrCode: string; // base64 or url
}

export interface CheckoutResponse {
  checkoutUrl: string;
}

export interface ValidateTicketResponse {
  ticketId: string;
  valid: boolean;
}

// ============ DASHBOARD ============

export interface EventDashboardData {
  id: string;
  title: string;
  ticketsSold: number;
  capacity: number;
  revenues: number;
}

export interface OrganizerDashboard {
  eventsCount: number;
  ticketsSold: number;
  revenues: number;
  events: EventDashboardData[];
}

export interface AdminDashboard {
  users: number;
  events: number;
  ticketsSold: number;
  revenues: number;
}
