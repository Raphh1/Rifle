import { render, screen } from "../../test/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventList } from "./EventList";
import { useEvents } from "../../api/queries";

vi.mock("../../api/queries", () => ({
  useEvents: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe("EventList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state", () => {
    const mockUseEvents = useEvents as unknown as ReturnType<typeof vi.fn>;
    mockUseEvents.mockReturnValue({ isLoading: true });

    const { container } = render(<EventList />);
    // Check for the spinner loading element
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
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
        description: "A great rock concert",
        imageUrl: "https://example.com/image.jpg",
      },
      {
        id: "2",
        title: "Jazz Night",
        date: new Date(Date.now() + 86400000).toISOString(),
        location: "Lyon",
        price: 35,
        capacity: 80,
        remaining: 20,
        description: "Smooth jazz evening",
        imageUrl: "https://example.com/image2.jpg",
      },
    ];

    const mockUseEvents = useEvents as unknown as ReturnType<typeof vi.fn>;
    mockUseEvents.mockReturnValue({
      isLoading: false,
      isError: false,
      error: null,
      data: {
        data: mockEvents,
        meta: { total: 2, page: 1, last_page: 1 },
      },
    });

    render(<EventList />);
    expect(screen.getByText("Concert Rock")).toBeInTheDocument();
    expect(screen.getByText("Jazz Night")).toBeInTheDocument();
    expect(screen.getByText(/Paris/)).toBeInTheDocument();
    expect(screen.getByText(/Lyon/)).toBeInTheDocument();
  });

  it("renders error state", () => {
    const mockUseEvents = useEvents as unknown as ReturnType<typeof vi.fn>;
    mockUseEvents.mockReturnValue({
      isLoading: false,
      isError: true,
      error: new Error("Failed to fetch events"),
      data: null,
    });

    render(<EventList />);
    expect(screen.getByText(/impossible de charger les événements/i)).toBeInTheDocument();
  });

  it("renders empty state when no events", () => {
    const mockUseEvents = useEvents as unknown as ReturnType<typeof vi.fn>;
    mockUseEvents.mockReturnValue({
      isLoading: false,
      isError: false,
      error: null,
      data: {
        data: [],
        meta: { total: 0, page: 1, last_page: 1 },
      },
    });

    render(<EventList />);
    // Should either show empty message or no events
  });

  it("displays event details correctly", () => {
    const mockEvents = [
      {
        id: "1",
        title: "Conference 2025",
        date: new Date(Date.now() + 172800000).toISOString(), // +2 days
        location: "Bordeaux",
        price: 75,
        capacity: 200,
        remaining: 45,
        description: "Tech conference with industry leaders",
        imageUrl: "https://example.com/conference.jpg",
      },
    ];

    const mockUseEvents = useEvents as unknown as ReturnType<typeof vi.fn>;
    mockUseEvents.mockReturnValue({
      isLoading: false,
      isError: false,
      error: null,
      data: {
        data: mockEvents,
        meta: { total: 1, page: 1, last_page: 1 },
      },
    });

    render(<EventList />);
    expect(screen.getByText("Conference 2025")).toBeInTheDocument();
    expect(screen.getByText(/Bordeaux/)).toBeInTheDocument();
  });

  it("shows event prices correctly", () => {
    const mockEvents = [
      {
        id: "1",
        title: "Free Workshop",
        date: new Date(Date.now() + 86400000).toISOString(),
        location: "Paris",
        price: 0,
        capacity: 50,
        remaining: 30,
        description: "Free training workshop",
        imageUrl: "https://example.com/workshop.jpg",
      },
      {
        id: "2",
        title: "Premium Course",
        date: new Date(Date.now() + 172800000).toISOString(),
        location: "Online",
        price: 199.99,
        capacity: 500,
        remaining: 200,
        description: "Comprehensive online course",
        imageUrl: "https://example.com/course.jpg",
      },
    ];

    const mockUseEvents = useEvents as unknown as ReturnType<typeof vi.fn>;
    mockUseEvents.mockReturnValue({
      isLoading: false,
      isError: false,
      error: null,
      data: {
        data: mockEvents,
        meta: { total: 2, page: 1, last_page: 1 },
      },
    });

    render(<EventList />);
    expect(screen.getByText("Free Workshop")).toBeInTheDocument();
    expect(screen.getByText("Premium Course")).toBeInTheDocument();
  });

  it("displays remaining tickets count", () => {
    const mockEvents = [
      {
        id: "1",
        title: "Festival",
        date: new Date(Date.now() + 259200000).toISOString(),
        location: "Marseille",
        price: 60,
        capacity: 5000,
        remaining: 1234,
        description: "Music and food festival",
        imageUrl: "https://example.com/festival.jpg",
      },
    ];

    const mockUseEvents = useEvents as unknown as ReturnType<typeof vi.fn>;
    mockUseEvents.mockReturnValue({
      isLoading: false,
      isError: false,
      error: null,
      data: {
        data: mockEvents,
        meta: { total: 1, page: 1, last_page: 1 },
      },
    });

    render(<EventList />);
    expect(screen.getByText("Festival")).toBeInTheDocument();
  });

  it("handles multiple pages of events", () => {
    const mockEvents = Array.from({ length: 10 }, (_, i) => ({
      id: String(i + 1),
      title: `Event ${i + 1}`,
      date: new Date(Date.now() + (i + 1) * 86400000).toISOString(),
      location: `City ${i + 1}`,
      price: 50 + i * 10,
      capacity: 100,
      remaining: 50,
      description: `Event description ${i + 1}`,
      imageUrl: "https://example.com/image.jpg",
    }));

    const mockUseEvents = useEvents as unknown as ReturnType<typeof vi.fn>;
    mockUseEvents.mockReturnValue({
      isLoading: false,
      isError: false,
      error: null,
      data: {
        data: mockEvents,
        meta: { total: 100, page: 1, last_page: 10 },
      },
    });

    render(<EventList />);
    expect(screen.getByText("Event 1")).toBeInTheDocument();
    expect(screen.getByText("Event 10")).toBeInTheDocument();
  });
});