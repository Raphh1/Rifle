import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Event,
  Ticket,
  OrganizerDashboard,
  AdminDashboard,
  CreateEventRequest,
  TicketValidateRequest,
  ValidateTicketResponse,
  ApiResponse,
  PaginationInfo,
} from "../types/api";
import { api } from "./axiosClient";

// ============ EVENTS ============

export const useEvents = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["events", page, limit],
    queryFn: async () => {
      const response = await api.get<
        ApiResponse<{ data: Event[]; pagination: PaginationInfo }>
      >("/events", { params: { page, limit } });
      return response.data.data;
    },
  });
};

export const useEventDetail = (eventId: string) => {
  return useQuery({
    queryKey: ["events", eventId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Event>>(`/events/${eventId}`);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || "Failed to fetch event");
      }
      return response.data.data;
    },
    enabled: !!eventId,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (eventData: CreateEventRequest) => {
      const response = await api.post<ApiResponse<Event>>(
        "/events",
        eventData
      );
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || "Failed to create event");
      }
      return response.data.data;
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
      const response = await api.get<ApiResponse<Ticket[]>>("/tickets");
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || "Failed to fetch tickets");
      }
      return response.data.data;
    },
  });
};

export const useTicketDetail = (ticketId: string) => {
  return useQuery({
    queryKey: ["tickets", ticketId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Ticket>>(
        `/tickets/${ticketId}`
      );
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || "Failed to fetch ticket");
      }
      return response.data.data;
    },
    enabled: !!ticketId,
  });
};

export const useValidateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: TicketValidateRequest) => {
      const response = await api.post<ApiResponse<ValidateTicketResponse>>(
        `/tickets/${data.ticketId}/validate`,
        {}
      );
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || "Failed to validate ticket");
      }
      return response.data.data;
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
      const response = await api.post<ApiResponse<{ checkoutUrl: string }>>(
        `/tickets/buy`,
        { eventId }
      );
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || "Failed to buy ticket");
      }
      return response.data.data;
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
      const response = await api.get<ApiResponse<OrganizerDashboard>>(
        "/dashboard/organizer"
      );
      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.error || "Failed to fetch organizer dashboard"
        );
      }
      return response.data.data;
    },
  });
};

export const useAdminDashboard = () => {
  return useQuery({
    queryKey: ["dashboard", "admin"],
    queryFn: async () => {
      const response = await api.get<ApiResponse<AdminDashboard>>(
        "/dashboard/admin"
      );
      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.error || "Failed to fetch admin dashboard"
        );
      }
      return response.data.data;
    },
  });
};
