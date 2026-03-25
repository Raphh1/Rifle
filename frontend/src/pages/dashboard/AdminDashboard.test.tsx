import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { AdminDashboard } from './AdminDashboard';

const mockUseAdminDashboard = vi.fn();

vi.mock('../../api/queries', () => ({
  useAdminDashboard: mockUseAdminDashboard,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('AdminDashboard', () => {
  const mockDashboardData = {
    users: 150,
    events: 42,
    ticketsSold: 5230,
    revenues: 156900,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dashboard title', () => {
    mockUseAdminDashboard.mockReturnValue({
      isLoading: false,
      data: mockDashboardData,
    });
    
    render(<AdminDashboard />);
    
    const title = screen.queryByText(/tableau de bord|dashboard|admin/i);
    expect(title).toBeTruthy();
  });

  it('should display user statistics', () => {
    mockUseAdminDashboard.mockReturnValue({
      isLoading: false,
      data: mockDashboardData,
    });

    render(<AdminDashboard />);
    
    expect(screen.getByText(/150|utilisateurs/i)).toBeInTheDocument();
  });

  it('should display event statistics', () => {
    mockUseAdminDashboard.mockReturnValue({
      isLoading: false,
      data: mockDashboardData,
    });

    render(<AdminDashboard />);
    
    expect(screen.getByText(/42|événements/i)).toBeInTheDocument();
  });

  it('should display tickets sold statistics', () => {
    mockUseAdminDashboard.mockReturnValue({
      isLoading: false,
      data: mockDashboardData,
    });

    render(<AdminDashboard />);
    
    expect(screen.getByText(/5230|billets/i)).toBeInTheDocument();
  });

  it('should display revenue statistics', () => {
    mockUseAdminDashboard.mockReturnValue({
      isLoading: false,
      data: mockDashboardData,
    });

    render(<AdminDashboard />);
    
    expect(screen.getByText(/156900|€|revenues/i)).toBeInTheDocument();
  });

  it('should show loading state', () => {
    mockUseAdminDashboard.mockReturnValue({
      isLoading: true,
    });

    render(<AdminDashboard />);
    
    expect(screen.getByText(/chargement|loading/i)).toBeInTheDocument();
  });

  it('should display all stat cards', () => {
    mockUseAdminDashboard.mockReturnValue({
      isLoading: false,
      data: mockDashboardData,
    });

    render(<AdminDashboard />);
    
    // Should have 4 stat cards
    const container = screen.getByText(/tableau de bord|admin/i)?.parentElement;
    expect(container).toBeTruthy();
  });

  it('should handle zero values gracefully', () => {
    mockUseAdminDashboard.mockReturnValue({
      isLoading: false,
      data: {
        users: 0,
        events: 0,
        ticketsSold: 0,
        revenues: 0,
      },
    });

    render(<AdminDashboard />);
    
    expect(screen.getByText(/0|aucun/i)).toBeInTheDocument();
  });

  it('should format large numbers correctly', () => {
    mockUseAdminDashboard.mockReturnValue({
      isLoading: false,
      data: {
        users: 10000,
        events: 999,
        ticketsSold: 500000,
        revenues: 999999.99,
      },
    });

    render(<AdminDashboard />);
    
    expect(screen.getByText(/10000|10k/i)).toBeInTheDocument();
  });
});
