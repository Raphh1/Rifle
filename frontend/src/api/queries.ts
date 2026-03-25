import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Event,
  Ticket,
  PaginatedResponse,
  OrganizerDashboard,
  AdminDashboard,
  AdminUser,
  CreateEventRequest,
  TicketValidateRequest,
  ValidateTicketResponse,
} from "../types/api";
import { api } from "./axiosClient";

// ============ EVENTS ============

export const useEvents = (page = 1, limit = 10, search = "") => {
  return useQuery({
    queryKey: ["events", page, limit, search],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Event>>("/events", {
        params: { page, limit, search },
      });
      return response.data;
    },
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });
};

export const useEventDetail = (eventId: string) => {
  return useQuery({
    queryKey: ["events", eventId],
    queryFn: async () => {
      // Backend returns Event directly
      const response = await api.get<Event>(`/events/${eventId}`);
      return response.data;
    },
    enabled: !!eventId,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (eventData: CreateEventRequest | FormData) => {
      // Backend returns Event directly
      const isFormData = eventData instanceof FormData;
      const response = await api.post<Event>(
        "/events",
        eventData,
        isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

// ============ TICKETS ============

export const useUserTickets = () => {
  return useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      // Backend returns Ticket[] directly
      const response = await api.get<Ticket[]>("/tickets");
      return response.data;
    },
  });
};

export const useTicketDetail = (ticketId: string) => {
  return useQuery({
    queryKey: ["tickets", ticketId],
    queryFn: async () => {
      // Backend returns Ticket directly
      const response = await api.get<Ticket>(
        `/tickets/${ticketId}`
      );
      return response.data;
    },
    enabled: !!ticketId,
  });
};

export const useValidateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: TicketValidateRequest) => {
      const response = await api.post<ValidateTicketResponse>(
        `/tickets/validate`,
        { qrCode: data.qrCode }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
};

export const useBuyTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (eventId: string) => {
      // Backend returns { message, ticket }
      const response = await api.post<{ message: string; ticket: Ticket }>(
        `/tickets/buy`,
        { eventId }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
};

export const useTransferTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ticketId, email }: { ticketId: string; email: string }) => {
      const response = await api.post(`/tickets/${ticketId}/transfer`, { email });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
};

// ============ DASHBOARD ============

export const useOrganizerDashboard = () => {
  return useQuery({
    queryKey: ["dashboard", "organizer"],
    queryFn: async () => {
      const response = await api.get<OrganizerDashboard>(
        "/dashboard/organizer"
      );
      return response.data;
    },
  });
};

export const useAdminDashboard = () => {
  return useQuery({
    queryKey: ["dashboard", "admin"],
    queryFn: async () => {
      const response = await api.get<AdminDashboard>(
        "/dashboard/admin"
      );
      return response.data;
    },
  });
};

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const response = await api.get<AdminUser[]>("/admin/users");
      return response.data;
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const response = await api.post<AdminUser>(`/admin/users/${id}/role`, { role });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};
