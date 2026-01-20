import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Event,
  Ticket,
  OrganizerDashboard,
  AdminDashboard,
  CreateEventRequest,
  TicketValidateRequest,
  ValidateTicketResponse,
} from "../types/api";
import { api } from "./axiosClient";

// ============ EVENTS ============

export const useEvents = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["events", page, limit],
    queryFn: async () => {
      // Backend returns Event[] directly
      const response = await api.get<Event[]>("/events", { params: { page, limit } });
      return response.data;
    },
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
    mutationFn: async (eventData: CreateEventRequest) => {
      // Backend returns Event directly
      const response = await api.post<Event>(
        "/events",
        eventData
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
