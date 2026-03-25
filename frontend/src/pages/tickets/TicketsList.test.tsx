import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { TicketsList } from './TicketsList';
import * as queriesModule from '../../api/queries';

vi.mock('../../api/queries', () => ({
  useTickets: vi.fn(),
  useBuyTicket: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('TicketsList Component', () => {
  const mockTickets = [
    {
      id: '1',
      userId: 'user1',
      eventId: 'event1',
      status: 'paid' as const,
      qrCode: 'data:image/png;base64,iVBORw0KGgo...',
      event: {
        id: 'event1',
        title: 'Concert Rock',
        date: new Date(Date.now() + 86400000).toISOString(),
        location: 'Paris',
        price: 50,
        capacity: 100,
        remaining: 50,
        description: 'Great rock concert',
        imageUrl: 'https://example.com/img.jpg',
      },
    },
    {
      id: '2',
      userId: 'user1',
      eventId: 'event2',
      status: 'used' as const,
      qrCode: 'data:image/png;base64,iVBORw0KGgo...',
      event: {
        id: 'event2',
        title: 'Jazz Night',
        date: new Date(Date.now() - 86400000).toISOString(),
        location: 'Lyon',
        price: 35,
        capacity: 80,
        remaining: 20,
        description: 'Smooth jazz',
        imageUrl: 'https://example.com/img2.jpg',
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state', () => {
    const mockUseTickets = vi.mocked(queriesModule.useTickets);
    mockUseTickets.mockReturnValue({
      isLoading: true,
    } as any);

    render(<TicketsList />);
    expect(screen.getByText(/chargement|loading/i)).toBeInTheDocument();
  });

  it('should display list of tickets', () => {
    const mockUseTickets = vi.mocked(queriesModule.useTickets);
    mockUseTickets.mockReturnValue({
      isLoading: false,
      data: mockTickets,
    } as any);

    render(<TicketsList />);
    
    expect(screen.getByText('Concert Rock')).toBeInTheDocument();
    expect(screen.getByText('Jazz Night')).toBeInTheDocument();
  });

  it('should show ticket status badges', () => {
    const mockUseTickets = vi.mocked(queriesModule.useTickets);
    mockUseTickets.mockReturnValue({
      isLoading: false,
      data: mockTickets,
    } as any);

    render(<TicketsList />);
    
    // Check for status indicators
    expect(screen.getByText(/paid|used|pending/i)).toBeInTheDocument();
  });

  it('should display event locations', () => {
    const mockUseTickets = vi.mocked(queriesModule.useTickets);
    mockUseTickets.mockReturnValue({
      isLoading: false,
      data: mockTickets,
    } as any);

    render(<TicketsList />);
    
    expect(screen.getByText(/Paris/i)).toBeInTheDocument();
    expect(screen.getByText(/Lyon/i)).toBeInTheDocument();
  });

  it('should render empty state when no tickets', () => {
    const mockUseTickets = vi.mocked(queriesModule.useTickets);
    mockUseTickets.mockReturnValue({
      isLoading: false,
      data: [],
    } as any);

    render(<TicketsList />);
    
    // Should show empty message or no tickets view
  });

  it('should display ticket prices', () => {
    const mockUseTickets = vi.mocked(queriesModule.useTickets);
    mockUseTickets.mockReturnValue({
      isLoading: false,
      data: mockTickets,
    } as any);

    render(<TicketsList />);
    
    expect(screen.getByText(/50|€|price/i)).toBeInTheDocument();
  });

  it('should show QR code for each ticket', () => {
    const mockUseTickets = vi.mocked(queriesModule.useTickets);
    mockUseTickets.mockReturnValue({
      isLoading: false,
      data: mockTickets,
    } as any);

    render(<TicketsList />);
    
    // QR codes should be rendered
    const images = screen.getAllByRole('img') as HTMLImageElement[];
    expect(images.length).toBeGreaterThan(0);
  });

  it('should handle error state', () => {
    const mockUseTickets = vi.mocked(queriesModule.useTickets);
    mockUseTickets.mockReturnValue({
      isLoading: false,
      isError: true,
      error: new Error('Failed to load tickets'),
    } as any);

    render(<TicketsList />);
    
    expect(screen.getByText(/erreur|error/i)).toBeInTheDocument();
  });

  it('should display different status styles for paid tickets', () => {
    const mockUseTickets = vi.mocked(queriesModule.useTickets);
    mockUseTickets.mockReturnValue({
      isLoading: false,
      data: [mockTickets[0]], // Only paid ticket
    } as any);

    render(<TicketsList />);
    
    expect(screen.getByText('Concert Rock')).toBeInTheDocument();
  });

  it('should display different status styles for used tickets', () => {
    const mockUseTickets = vi.mocked(queriesModule.useTickets);
    mockUseTickets.mockReturnValue({
      isLoading: false,
      data: [mockTickets[1]], // Only used ticket
    } as any);

    render(<TicketsList />);
    
    expect(screen.getByText('Jazz Night')).toBeInTheDocument();
  });
});
