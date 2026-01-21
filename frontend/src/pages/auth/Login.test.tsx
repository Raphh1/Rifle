import { render, screen, fireEvent } from '../../test/test-utils';
import { describe, it, expect, vi } from 'vitest';
import Login from './Login';

// Mocks simples si nécessaire
vi.mock('../../api/axiosClient', () => ({
    api: {
        post: vi.fn(),
        defaults: { headers: { common: {} } }
    }
}));

describe('Login Component', () => {
    it('renders login form correctly', () => {
        render(<Login />);
        expect(screen.getByPlaceholderText(/john@example.com/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
    });

    it('shows validation error on invalid email', async () => {
        render(<Login />);
        
        const emailInput = screen.getByPlaceholderText(/john@example.com/i);
        const submitBtn = screen.getByRole('button', { name: /se connecter/i });

        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.click(submitBtn);

        expect(await screen.findByText(/email invalide/i)).toBeInTheDocument();
    });
});
