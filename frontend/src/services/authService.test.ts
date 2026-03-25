import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './authService';

// Mock axios
const mockGet = vi.hoisted(() => vi.fn());
const mockPost = vi.hoisted(() => vi.fn());

vi.mock('axios', () => {
  return {
    default: {
      create: vi.fn(() => ({
        post: mockPost,
        get: mockGet,
      }))
    }
  };
});

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user and return token', async () => {
      const mockUser = {
        id: '1',
        email: 'newuser@example.com',
        name: 'New User',
        role: 'user',
      };

      mockPost.mockResolvedValueOnce({
        data: {
          token: 'jwt-token-123',
          user: mockUser,
        },
      });

      const result = await authService.register('newuser@example.com', 'password123', 'New User');

      expect(result.user).toEqual(mockUser);
      expect(result.accessToken).toBe('jwt-token-123');
      expect(mockPost).toHaveBeenCalledWith(
        '/auth/register',
        expect.objectContaining({
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
        })
      );
    });

    it('should throw error on registration failure', async () => {
      mockPost.mockRejectedValueOnce(
        new Error('Email already exists')
      );

      await expect(
        authService.register('existing@example.com', 'password123', 'User')
      ).rejects.toThrow('Email already exists');
    });

    it('should handle server error during registration', async () => {
      mockPost.mockRejectedValueOnce(
        new Error('Server error')
      );

      await expect(
        authService.register('user@example.com', 'password123', 'User')
      ).rejects.toThrow('Server error');
    });
  });

  describe('login', () => {
    it('should login user and return token', async () => {
      const mockUser = {
        id: '1',
        email: 'user@example.com',
        name: 'Test User',
        role: 'user',
      };

      mockPost.mockResolvedValueOnce({
        data: {
          token: 'jwt-token-456',
          user: mockUser,
        },
      });

      const result = await authService.login('user@example.com', 'password123');

      expect(result.user).toEqual(mockUser);
      expect(result.accessToken).toBe('jwt-token-456');
      expect(mockPost).toHaveBeenCalledWith(
        '/auth/login',
        expect.objectContaining({
          email: 'user@example.com',
          password: 'password123',
        })
      );
    });

    it('should throw error on invalid credentials', async () => {
      mockPost.mockRejectedValueOnce(
        new Error('Invalid credentials')
      );

      await expect(
        authService.login('user@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error on non-existent user', async () => {
      mockPost.mockRejectedValueOnce(
        new Error('User not found')
      );

      await expect(
        authService.login('nonexistent@example.com', 'password123')
      ).rejects.toThrow('User not found');
    });
  });

  describe('refreshToken', () => {
    it('should return new access token', async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            accessToken: 'new-jwt-token-789',
          },
        },
      });

      const result = await authService.refreshToken();

      expect(result).toBe('new-jwt-token-789');
      expect(mockPost).toHaveBeenCalledWith('/auth/refresh');
    });

    it('should throw error when refresh token is invalid', async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          success: false,
          error: 'Refresh token expired',
        },
      });

      await expect(authService.refreshToken()).rejects.toThrow(
        'Refresh token expired'
      );
    });

    it('should throw error when refresh request fails', async () => {
      mockPost.mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(authService.refreshToken()).rejects.toThrow('Network error');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user data', async () => {
      const mockUser = {
        id: '1',
        email: 'user@example.com',
        name: 'Test User',
        role: 'user' as const,
      };

      mockGet.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockUser,
        },
      });

      const result = await authService.getCurrentUser('valid-token');

      expect(result).toEqual(mockUser);
      expect(mockGet).toHaveBeenCalledWith(
        '/auth/me',
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer valid-token',
          },
        })
      );
    });

    it('should throw error if user is not authenticated', async () => {
      mockGet.mockResolvedValueOnce({
        data: {
          success: false,
          error: 'Unauthorized',
        },
      });

      await expect(authService.getCurrentUser('invalid-token')).rejects.toThrow(
        'Unauthorized'
      );
    });

    it('should throw error if request fails', async () => {
      mockGet.mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(authService.getCurrentUser('token')).rejects.toThrow(
        'Network error'
      );
    });
  });
});
