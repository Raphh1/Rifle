import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AdminDashboard,
  AdminUser,
  CancelTicketResponse,
  CategoryOption,
  CreateEventRequest,
  Event,
  EventFilters,
  OrganizerDashboard,
  PaginatedResponse,
  Ticket,
  TicketValidateRequest,
  UpdateEventRequest,
  User,
  ValidateTicketResponse,
  UpdatePasswordRequest,
} from "../types/api";
import { api } from "./axiosClient";

const buildEventParams = (page: number, limit: number, filters: EventFilters = {}) => {
  const params: Record<string, string | number> = { page, limit };

  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.category) params.category = filters.category;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;
  if (filters.priceMin !== undefined && filters.priceMin !== "") params.priceMin = filters.priceMin;
  if (filters.priceMax !== undefined && filters.priceMax !== "") params.priceMax = filters.priceMax;

  return params;
};

export const useEvents = (page = 1, limit = 10, filters: EventFilters = {}) =>
  useQuery({
    queryKey: ["events", page, limit, filters],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Event>>("/events", {
        params: buildEventParams(page, limit, filters),
      });
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });

export const useCategories = () =>
  useQuery({
    queryKey: ["events", "categories"],
    queryFn: async () => {
      const response = await api.get<CategoryOption[]>("/events/categories");
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

export const useEventDetail = (eventId: string) =>
  useQuery({
    queryKey: ["events", eventId],
    queryFn: async () => {
      const response = await api.get<Event>(`/events/${eventId}`);
      return response.data;
    },
    enabled: !!eventId,
  });

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventData: CreateEventRequest | FormData) => {
      const isFormData = eventData instanceof FormData;
      const response = await api.post<Event>(
        "/events",
        eventData,
        isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "organizer"] });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      eventId,
      eventData,
    }: {
      eventId: string;
      eventData: UpdateEventRequest | FormData;
    }) => {
      const isFormData = eventData instanceof FormData;
      const response = await api.put<Event>(
        `/events/${eventId}`,
        eventData,
        isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined
      );
      return response.data;
    },
    onSuccess: (event) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "organizer"] });
      queryClient.setQueryData(["events", event.id], event);
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const response = await api.delete<{ message: string; cancelledTickets: number }>(`/events/${eventId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "organizer"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "admin"] });
    },
  });
};

export const useUserTickets = () =>
  useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      const response = await api.get<Ticket[]>("/tickets");
      return response.data;
    },
  });

export const useTicketDetail = (ticketId: string) =>
  useQuery({
    queryKey: ["tickets", ticketId],
    queryFn: async () => {
      const response = await api.get<Ticket>(`/tickets/${ticketId}`);
      return response.data;
    },
    enabled: !!ticketId,
  });

export const useValidateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TicketValidateRequest) => {
      const response = await api.post<ValidateTicketResponse>("/tickets/validate", {
        qrCode: data.qrCode,
      });
      return response.data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.setQueryData(["tickets", result.ticket.id], result.ticket);
    },
  });
};

export const useBuyTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const response = await api.post<{ message: string; ticket: Ticket }>("/tickets/buy", {
        eventId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "organizer"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "admin"] });
    },
  });
};

export const useTransferTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticketId, email }: { ticketId: string; email: string }) => {
      const response = await api.post<{ message: string; ticket: Ticket }>(`/tickets/${ticketId}/transfer`, {
        email,
      });
      return response.data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.setQueryData(["tickets", result.ticket.id], result.ticket);
    },
  });
};

export const useCancelTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticketId: string) => {
      const response = await api.patch<CancelTicketResponse>(`/tickets/${ticketId}/cancel`);
      return response.data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "organizer"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "admin"] });
      queryClient.setQueryData(["tickets", result.ticket.id], result.ticket);
    },
  });
};

export const useOrganizerDashboard = () =>
  useQuery({
    queryKey: ["dashboard", "organizer"],
    queryFn: async () => {
      const response = await api.get<OrganizerDashboard>("/dashboard/organizer");
      return response.data;
    },
  });

export const useAdminDashboard = () =>
  useQuery({
    queryKey: ["dashboard", "admin"],
    queryFn: async () => {
      const response = await api.get<AdminDashboard>("/dashboard/admin");
      return response.data;
    },
  });

export const useAdminUsers = () =>
  useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const response = await api.get<AdminUser[]>("/admin/users");
      return response.data;
    },
  });

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const response = await api.post<User>(`/admin/users/${id}/role`, { role });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<{ message: string }>(`/admin/users/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};

// ============ PROFILE ============

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.put<User>("/users/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: async (data: UpdatePasswordRequest) => {
      const response = await api.put<{ message: string }>("/users/me/password", data);
      return response.data;
    },
  });
};

export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await api.delete<{ message: string }>("/users/me");
      return response.data;
    },
  });
};
