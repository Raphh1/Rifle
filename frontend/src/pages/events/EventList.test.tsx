import { render, screen } from '../../test/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { EventList } from './EventList';
import * as queries from '../../api/queries';

// Mock du module queries
vi.mock('../../api/queries', () => ({
    useEvents: vi.fn()
}));

// Mock du AuthContext
vi.mock('../../context/AuthContext', async (importOriginal) => {
    const actual = await importOriginal<Record<string, any>>();
    return {
        ...actual,
        useAuth: () => ({
            user: { role: 'user' }
        })
    };
});

describe('EventList', () => {
    it('renders loading state', () => {
        // @ts-ignore
        queries.useEvents.mockReturnValue({ isLoading: true });
        render(<EventList />);
        expect(screen.getByText(/chargement des événements/i)).toBeInTheDocument();
    });

    it('renders list of events', () => {
        const mockEvents = [
            {
                id: '1',
                title: 'Concert Rock',
                date: new Date().toISOString(),
                location: 'Paris',
                price: 50,
                capacity: 100,
                remaining: 50
            }
        ];

        // @ts-ignore
        queries.useEvents.mockReturnValue({
            isLoading: false,
            data: {
                data: mockEvents,
                meta: { total: 1, page: 1, last_page: 1 }
            }
        });

        render(<EventList />);
        expect(screen.getByText('Concert Rock')).toBeInTheDocument();
        expect(screen.getByText(/Paris/)).toBeInTheDocument();
    });
});
