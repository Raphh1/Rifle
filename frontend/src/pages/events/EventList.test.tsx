import { render, screen } from "../../test/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventList } from "./EventList";
import { useEvents } from "../../api/queries";

vi.mock("../../api/queries", () => ({
  useEvents: vi.fn(),
}));

vi.mock("../../context/useAuth", () => ({
  useAuth: () => ({ user: { role: "user", name: "Test" } }),
}));

describe("EventList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state", () => {
    // @ts-expect-error - useEvents est mocké via vi.fn()
    useEvents.mockReturnValue({ isLoading: true });

    render(<EventList />);
    expect(screen.getByText(/chargement des événements/i)).toBeInTheDocument();
  });

  it("renders list of events", () => {
    const mockEvents = [
      {
        id: "1",
        title: "Concert Rock",
        date: new Date().toISOString(),
        location: "Paris",
        price: 50,
        capacity: 100,
        remaining: 50,
      },
    ];

    // @ts-expect-error - useEvents est mocké via vi.fn()
    useEvents.mockReturnValue({
      isLoading: false,
      isError: false,
      error: null,
      data: {
        data: mockEvents,
        meta: { total: 1, page: 1, last_page: 1 },
      },
    });

    render(<EventList />);
    expect(screen.getByText("Concert Rock")).toBeInTheDocument();
    expect(screen.getByText(/Paris/)).toBeInTheDocument();
  });
});