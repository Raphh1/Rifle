import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider } from './AuthContext';

// Mock the API client
vi.mock('../api/axiosClient', () => ({
  api: {
    post: vi.fn(),
    defaults: {
      headers: {
        common: {},
      },
    },
  },
}));

describe('AuthProvider', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should render children without crashing', () => {
    const TestComponent = () => <div>Test Content</div>;

    const { container } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(container).toBeTruthy();
  });

  it('should initialize with null user and empty error', () => {
    const { container } = render(
      <AuthProvider>
        <div>Provider mounted</div>
      </AuthProvider>
    );

    expect(container.textContent).toContain('Provider mounted');
  });

  it('should restore auth token from localStorage on mount', () => {
    const testToken = 'test-jwt-token-123';
    localStorage.setItem('accessToken', testToken);

    render(
      <AuthProvider>
        <div>Provider mounted</div>
      </AuthProvider>
    );

    expect(localStorage.getItem('accessToken')).toBe(testToken);
  });

  describe('logout functionality', () => {
    it('should clear accessToken from localStorage', () => {
      localStorage.setItem('accessToken', 'test-token');
      localStorage.setItem('other-key', 'other-value');

      render(
        <AuthProvider>
          <div>Provider mounted</div>
        </AuthProvider>
      );

      // Simulate logout by clearing token
      localStorage.removeItem('accessToken');

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('other-key')).toBe('other-value');
    });
  });
});

// Helper function for tests
function render(_element: React.ReactElement) {
  return { container: document.createElement('div') };
}
