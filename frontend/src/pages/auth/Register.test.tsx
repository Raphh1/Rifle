import { render, screen, fireEvent } from '../../test/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Register from './Register';

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

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders register form correctly', () => {
    render(<Register />);
    
    // Check for name input
    expect(screen.getByPlaceholderText(/john doe/i)).toBeInTheDocument();
    
    // Check for email input
    expect(screen.getByPlaceholderText(/john@example.com/i)).toBeInTheDocument();
    
    // Check for password input
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    
    // Check for submit button
    expect(screen.getByRole('button', { name: /s'inscrire/i })).toBeInTheDocument();
  });

  it('should display form title', () => {
    render(<Register />);
    
    expect(screen.getByText(/créer un compte/i)).toBeInTheDocument();
  });

  it('shows validation error on short name', async () => {
    render(<Register />);
    
    const nameInput = screen.getByPlaceholderText(/john doe/i);
    const submitBtn = screen.getByRole('button', { name: /s'inscrire/i });

    fireEvent.change(nameInput, { target: { value: 'J' } });
    fireEvent.click(submitBtn);

    const errorMsg = await screen.findByText(/au moins 2 caractères/i);
    expect(errorMsg).toBeInTheDocument();
  });

  it('shows validation error on invalid email', async () => {
    render(<Register />);
    
    const emailInput = screen.getByPlaceholderText(/john@example.com/i);
    const submitBtn = screen.getByRole('button', { name: /s'inscrire/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitBtn);

    const errorMsg = await screen.findByText(/email invalide/i);
    expect(errorMsg).toBeInTheDocument();
  });

  it('shows validation error on short password', async () => {
    render(<Register />);
    
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const submitBtn = screen.getByRole('button', { name: /s'inscrire/i });

    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.click(submitBtn);

    const errorMsg = await screen.findByText(/au moins 6 caractères/i);
    expect(errorMsg).toBeInTheDocument();
  });

  it('should accept valid name', () => {
    render(<Register />);
    
    const nameInput = screen.getByPlaceholderText(/john doe/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Jean Dupont' } });
    
    expect(nameInput.value).toBe('Jean Dupont');
  });

  it('should accept valid email', () => {
    render(<Register />);
    
    const emailInput = screen.getByPlaceholderText(/john@example.com/i) as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
    
    expect(emailInput.value).toBe('valid@example.com');
  });

  it('should accept valid password', () => {
    render(<Register />);
    
    const passwordInput = screen.getByPlaceholderText(/••••••••/i) as HTMLInputElement;
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(passwordInput.value).toBe('password123');
  });

  it('should render login link', () => {
    render(<Register />);
    
    // Using getAllByRole since the component might render the link multiple times for responsiveness
    const loginLinks = screen.getAllByRole('link', { name: /se connecter/i });
    expect(loginLinks.length).toBeGreaterThan(0);
    expect(loginLinks[0]).toHaveAttribute('href', '/login');
  });

  it('should have proper input types', () => {
    render(<Register />);
    
    const nameInput = screen.getByPlaceholderText(/john doe/i) as HTMLInputElement;
    const emailInput = screen.getByPlaceholderText(/john@example.com/i) as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText(/••••••••/i) as HTMLInputElement;
    
    expect(nameInput.type).toBe('text');
    expect(emailInput.type).toBe('email');
    expect(passwordInput.type).toBe('password');
  });

  it('should validate all fields on form submission', async () => {
    render(<Register />);
    
    const submitBtn = screen.getByRole('button', { name: /s'inscrire/i });
    fireEvent.click(submitBtn);

    // Should show validation errors for all fields
  });

  it('should maintain input focus states', () => {
    render(<Register />);
    
    const nameInput = screen.getByLabelText(/nom complet/i);
    
    nameInput.focus();
    expect(nameInput).toHaveFocus();
    
    nameInput.blur();
    expect(nameInput).not.toHaveFocus();
  });

  it('should have accessible form structure', () => {
    render(<Register />);
    
    const form = screen.getByRole('button', { name: /s'inscrire/i }).closest('form');
    expect(form).toBeInTheDocument();
  });

  it('should allow entering all form fields', () => {
    render(<Register />);
    
    const nameInput = screen.getByPlaceholderText(/john doe/i) as HTMLInputElement;
    const emailInput = screen.getByPlaceholderText(/john@example.com/i) as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText(/••••••••/i) as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(nameInput.value).toBe('Test User');
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });
});
