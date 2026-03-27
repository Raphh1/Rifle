export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
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

export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "organizer" | "admin";
  createdAt?: string;
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

export type EventCategory =
  | "concert"
  | "conference"
  | "festival"
  | "sport"
  | "theatre"
  | "exposition"
  | "autre";

export interface CategoryOption {
  value: EventCategory;
  label: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  capacity: number;
  remaining: number;
  category: EventCategory;
  imageUrl?: string | null;
  deletedAt?: string | null;
  organizer?: Pick<User, "id" | "name" | "email">;
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
  imageUrl?: string;
}

export type UpdateEventRequest = CreateEventRequest;

export type TicketStatus = "paid" | "pending" | "used" | "cancelled";

export interface Ticket {
  id: string;
  userId: string;
  eventId: string;
  status: TicketStatus;
  qrCode?: string | null;
  purchaseDate?: string;
  validatedAt?: string | null;
  event?: Event;
  user?: User;
}

export interface TicketValidateRequest {
  qrCode: string;
}

export interface ValidateTicketResponse {
  message: string;
  ticket: Ticket;
}

export interface CancelTicketResponse {
  message: string;
  ticket: Ticket;
}

export interface AdminUser extends User {
  createdAt: string;
}

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

export interface AdminTopEvent {
  id: string;
  title: string;
  capacity: number;
  ticketsSold: number;
  revenues: number;
  date: string;
}

export interface AdminDashboard {
  users: number;
  events: number;
  ticketsSold: number;
  revenues: number;
  cancelledTickets: number;
  usersByRole: Record<string, number>;
  ticketsByStatus: Record<string, number>;
  topEvents: AdminTopEvent[];
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}
