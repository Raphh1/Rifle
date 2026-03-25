import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './authService';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as unknown as { create: any };

describe('Auth Service', () => {
  let mockApiClient: any;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Create mock API client
    mockApiClient = {
      post: vi.fn(),
      get: vi.fn(),
    };

    // Mock axios.create to return our mock client
    mockedAxios.create.mockReturnValue(mockApiClient);
  });

  describe('register', () => {
    it('should register a new user and return token', async () => {
      const mockUser = {
        id: '1',
        email: 'newuser@example.com',
        name: 'New User',
        role: 'user',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: {
          token: 'jwt-token-123',
          user: mockUser,
        },
      });

      const result = await authService.register('newuser@example.com', 'password123', 'New User');

      expect(result.user).toEqual(mockUser);
      expect(result.accessToken).toBe('jwt-token-123');
      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/auth/register',
        expect.objectContaining({
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
        })
      );
    });

    it('should throw error on registration failure', async () => {
      mockApiClient.post.mockRejectedValueOnce(
        new Error('Email already exists')
      );

      await expect(
        authService.register('existing@example.com', 'password123', 'User')
      ).rejects.toThrow('Email already exists');
    });

    it('should handle server error during registration', async () => {
      mockApiClient.post.mockRejectedValueOnce(
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

      mockApiClient.post.mockResolvedValueOnce({
        data: {
          token: 'jwt-token-456',
          user: mockUser,
        },
      });

      const result = await authService.login('user@example.com', 'password123');

      expect(result.user).toEqual(mockUser);
      expect(result.accessToken).toBe('jwt-token-456');
      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/auth/login',
        expect.objectContaining({
          email: 'user@example.com',
          password: 'password123',
        })
      );
    });

    it('should throw error on invalid credentials', async () => {
      mockApiClient.post.mockRejectedValueOnce(
        new Error('Invalid credentials')
      );

      await expect(
        authService.login('user@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error on non-existent user', async () => {
      mockApiClient.post.mockRejectedValueOnce(
        new Error('User not found')
      );

      await expect(
        authService.login('nonexistent@example.com', 'password123')
      ).rejects.toThrow('User not found');
    });
  });

  describe('refreshToken', () => {
    it('should return new access token', async () => {
      mockApiClient.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            accessToken: 'new-jwt-token-789',
          },
        },
      });

      const result = await authService.refreshToken();

      expect(result).toBe('new-jwt-token-789');
      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/refresh');
    });

    it('should throw error when refresh token is invalid', async () => {
      mockApiClient.post.mockResolvedValueOnce({
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
      mockApiClient.post.mockRejectedValueOnce(
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

      mockApiClient.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockUser,
        },
      });

      const result = await authService.getCurrentUser('valid-token');

      expect(result).toEqual(mockUser);
      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/auth/me',
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer valid-token',
          },
        })
      );
    });

    it('should throw error if user is not authenticated', async () => {
      mockApiClient.get.mockResolvedValueOnce({
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
      mockApiClient.get.mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(authService.getCurrentUser('token')).rejects.toThrow(
        'Network error'
      );
    });
  });
});
