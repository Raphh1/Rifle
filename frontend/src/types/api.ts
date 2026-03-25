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

export interface PaginationMeta {
  total: number;
  page: number;
  last_page: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ============ EVENTS ============

export type EventCategory = "concert" | "conference" | "festival" | "sport" | "theatre" | "exposition" | "autre";

export interface CategoryOption {
  value: EventCategory;
  label: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date
  location: string;
  price: number;
  capacity: number;
  remaining: number;
  category: EventCategory;
  imageUrl: string;
  organizer?: {
    id: string;
    name: string;
  };
}

export interface EventFilters {
  search?: string;
  category?: EventCategory | "";
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number | "";
  priceMax?: number | "";
}

export interface CreateEventRequest {
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  capacity: number;
  category: EventCategory;
  imageUrl: string;
}

export type UpdateEventRequest = CreateEventRequest;

export interface EventListResponse {
  data: Event[];
  pagination: PaginationInfo;
}

// ============ TICKETS ============

export type TicketStatus = "paid" | "pending" | "used";

export interface Ticket {
  id: string;
  userId: string;
  eventId: string;
  status: TicketStatus;
  qrCode: string; // base64 or url
  event?: Event;
  user?: User;
  validatedAt?: string;
}

export interface TicketValidateRequest {
  qrCode: string;
}

export interface CheckoutResponse {
  checkoutUrl: string;
  ticket?: Ticket; // Pour le mode simulation
  message?: string;
}

export interface ValidateTicketResponse {
  message: string;
  ticket: Ticket;
}


// ============ ADMIN ============

export interface AdminUser extends User {
  createdAt: string;
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
