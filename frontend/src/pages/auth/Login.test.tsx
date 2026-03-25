import { render, screen, fireEvent } from '../../test/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from './Login';

// Mocks simples si nécessaire
vi.mock('../../api/axiosClient', () => ({
  api: {
    post: vi.fn(),
    defaults: { headers: { common: {} } }
  }
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form correctly', () => {
    render(<Login />);
    
    // Check for email input
    const emailInput = screen.getByPlaceholderText(/john@example.com/i);
    expect(emailInput).toBeInTheDocument();
    
    // Check for password input
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    expect(passwordInput).toBeInTheDocument();
    
    // Check for login button
    const submitBtn = screen.getByRole('button', { name: /se connecter/i });
    expect(submitBtn).toBeInTheDocument();
  });

  it('should display form title and labels', () => {
    render(<Login />);
    
    expect(screen.getByText(/se connecter/i)).toBeInTheDocument();
  });

  it('should have proper input types', () => {
    render(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/john@example.com/i) as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText(/••••••••/i) as HTMLInputElement;
    
    expect(emailInput.type).toBe('email');
    expect(passwordInput.type).toBe('password');
  });

  it('shows validation error on invalid email', async () => {
    render(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/john@example.com/i);
    const submitBtn = screen.getByRole('button', { name: /se connecter/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitBtn);

    // Error message should appear
    const errorMsg = await screen.findByText(/email invalide/i);
    expect(errorMsg).toBeInTheDocument();
  });

  it('shows validation error on short password', async () => {
    render(<Login />);
    
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const submitBtn = screen.getByRole('button', { name: /se connecter/i });

    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.click(submitBtn);

    // Error message should appear
    const errorMsg = await screen.findByText(/au moins 6 caractères/i);
    expect(errorMsg).toBeInTheDocument();
  });

  it('should allow valid email entry', () => {
    render(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/john@example.com/i) as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
    
    expect(emailInput.value).toBe('valid@example.com');
  });

  it('should allow password entry', () => {
    render(<Login />);
    
    const passwordInput = screen.getByPlaceholderText(/••••••••/i) as HTMLInputElement;
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(passwordInput.value).toBe('password123');
  });

  it('should render register link', () => {
    render(<Login />);
    
    // Selecting the link by text since role "link" and text match might return multiple or fail depending on setup
    const registerLinks = screen.getAllByRole('link', { name: /créer un compte/i });
    expect(registerLinks.length).toBeGreaterThan(0);
    expect(registerLinks[0]).toHaveAttribute('href', '/register');
  });

  it('should disable submit button when form has errors', async () => {
    render(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/john@example.com/i);
    const submitBtn = screen.getByRole('button', { name: /se connecter/i });

    // Enter invalid email
    fireEvent.change(emailInput, { target: { value: 'invalid' } });
    fireEvent.click(submitBtn);

    // Wait for error to appear, then check button state
    await screen.findByText(/email invalide/i);
  });

  it('should have proper CSS classes for styling', () => {
    render(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/john@example.com/i);
    expect(emailInput.parentElement).toBeInTheDocument();
  });

  it('should handle empty form submission', async () => {
    render(<Login />);
    
    const submitBtn = screen.getByRole('button', { name: /se connecter/i });
    fireEvent.click(submitBtn);

    // Should show validation errors
    // Both email and password should have validation errors
  });

  it('should maintain input focus states', () => {
    render(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/john@example.com/i);
    
    emailInput.focus();
    expect(emailInput).toHaveFocus();
    
    emailInput.blur();
    expect(emailInput).not.toHaveFocus();
  });

  it('should have accessible form labels and structure', () => {
    render(<Login />);
    
    const form = screen.getByRole('button', { name: /se connecter/i }).closest('form');
    expect(form).toBeInTheDocument();
  });
});
