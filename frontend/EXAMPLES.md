// ============ EXEMPLES D'UTILISATION ============

// 1. UTILISER L'AUTHENTIFICATION
// ============================================

import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, login, register, logout, isLoading, error } = useAuth();

  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password123');
      // Utilisateur connecté ✅
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div>
      {user ? (
        <>
          <p>Bienvenue {user.name}</p>
          <button onClick={logout}>Déconnexion</button>
        </>
      ) : (
        <button onClick={handleLogin}>Connexion</button>
      )}
    </div>
  );
}


// 2. RÉCUPÉRER LES ÉVÉNEMENTS
// ============================

import { useEvents } from '@/api/queries';
import { useState } from 'react';

function EventsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useEvents(page, 10);

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;

  return (
    <div>
      {data?.data.map(event => (
        <div key={event.id}>
          <h3>{event.title}</h3>
          <p>{event.price}€</p>
        </div>
      ))}
    </div>
  );
}


// 3. CRÉER UN ÉVÉNEMENT
// ======================

import { useCreateEvent } from '@/api/queries';
import { useState } from 'react';

function CreateEventPage() {
  const createEventMutation = useCreateEvent();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    price: 0,
    capacity: 1,
    imageUrl: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createEventMutation.mutateAsync(formData);
      // Événement créé et liste actualisée ✅
    } catch (err) {
      console.error('Creation failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      />
      <button type="submit" disabled={createEventMutation.isPending}>
        {createEventMutation.isPending ? 'Création...' : 'Créer'}
      </button>
    </form>
  );
}


// 4. UTILISER LES ROUTES PROTÉGÉES
// ==================================

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminDashboard } from '@/pages/dashboard/AdminDashboard';

// Dans router/index.tsx
export const router = createBrowserRouter([
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute 
        element={<AdminDashboard />} 
        requiredRole="admin" 
      />
    ),
  },
]);

// Comportement:
// - Pas connecté → redirection vers /login
// - Role !== admin → redirection vers /unauthorized


// 5. VALIDER UN FORMULAIRE
// ==========================

import { loginSchema } from '@/utils/validation';
import { z } from 'zod';

function LoginForm() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validation
      const validData = loginSchema.parse(formData);
      console.log('Données valides:', validData);
      
      // Envoyer au serveur
      await login(validData.email, validData.password);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors = err.flatten().fieldErrors;
        setErrors(fieldErrors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      {errors.email && <span>{errors.email}</span>}
      
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      {errors.password && <span>{errors.password}</span>}
      
      <button type="submit">Connexion</button>
    </form>
  );
}


// 6. UTILISER LA PAGINATION
// ===========================

import { useEvents } from '@/api/queries';
import { useState } from 'react';

function EventList() {
  const [page, setPage] = useState(1);
  const { data } = useEvents(page, 10);

  return (
    <div>
      {/* Afficher les événements */}
      <div>
        {data?.data.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
      
      {/* Pagination */}
      <div>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
          Précédent
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={data?.data.length < 10}>
          Suivant
        </button>
      </div>
    </div>
  );
}


// 7. AFFICHER LES BILLETS
// ========================

import { useUserTickets } from '@/api/queries';

function MyTickets() {
  const { data: tickets, isLoading } = useUserTickets();

  if (isLoading) return <div>Chargement des billets...</div>;

  return (
    <div>
      {tickets?.map(ticket => (
        <div key={ticket.id}>
          <h3>{ticket.event?.title}</h3>
          <img src={ticket.qrCode} alt="QR Code" />
          <p>Statut: {ticket.status}</p>
          {ticket.status === 'paid' && (
            <a href={`/tickets/${ticket.id}/validate`}>Valider</a>
          )}
        </div>
      ))}
    </div>
  );
}


// 8. AFFICHAGE CONDITIONNEL PAR RÔLE
// ====================================

import { useAuth } from '@/context/AuthContext';

function Navigation() {
  const { user } = useAuth();

  return (
    <nav>
      <a href="/events">Événements</a>
      
      {user?.role === 'organizer' && (
        <>
          <a href="/create-event">Créer</a>
          <a href="/dashboard">Dashboard</a>
        </>
      )}
      
      {user?.role === 'admin' && (
        <a href="/dashboard">Admin</a>
      )}
    </nav>
  );
}


// 9. GESTION DES ERREURS API
// ============================

import { api } from '@/api/axiosClient';

async function fetchData() {
  try {
    const response = await api.get('/events');
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      // Token expiré - l'interceptor gère le refresh
      console.log('Session expirée');
    } else if (error.response?.status === 403) {
      // Accès refusé
      console.log('Accès refusé');
    } else if (error.response?.status === 404) {
      // Ressource non trouvée
      console.log('Non trouvé');
    } else {
      console.error('Erreur:', error.message);
    }
  }
}


// 10. UTILISER REACT QUERY DIRECTEMENT
// ======================================

import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/axiosClient';

function MyComponent() {
  // Query simple
  const { data, isLoading } = useQuery({
    queryKey: ['custom', 'data'],
    queryFn: async () => {
      const response = await api.get('/custom-endpoint');
      return response.data;
    }
  });

  return <div>{isLoading ? 'Loading...' : JSON.stringify(data)}</div>;
}


// 11. CRÉER UN HOOK PERSONNALISÉ
// ================================

import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/api/axiosClient';

export const useCustomData = () => {
  return useQuery({
    queryKey: ['customData'],
    queryFn: async () => {
      const response = await api.get('/custom-data');
      return response.data.data;
    }
  });
};

export const useUpdateCustomData = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.put('/custom-data', data);
      return response.data;
    }
  });
};


// 12. NAVIGUER APRÈS UNE ACTION
// ==============================

import { useNavigate } from 'react-router-dom';
import { useCreateEvent } from '@/api/queries';

function CreateEventPage() {
  const navigate = useNavigate();
  const createEventMutation = useCreateEvent();

  const handleCreate = async (eventData) => {
    try {
      await createEventMutation.mutateAsync(eventData);
      // Succès - naviguer vers la liste des événements
      navigate('/events', { replace: true });
    } catch (err) {
      console.error('Erreur:', err);
      // Rester sur la page
    }
  };

  return <form onSubmit={(e) => handleCreate(formData)} />;
}
