import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';

// Mock Prisma
jest.unstable_mockModule('../../prisma/prismaClient.js', () => ({
  default: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    $disconnect: jest.fn(),
  }
}));

const prisma = (await import('../../prisma/prismaClient.js')).default;
const app = (await import('../../app.js')).default;
import { JWT_SECRET } from '../../middleware/auth.js';

describe('User Controller (Unit Tests)', () => {
  let userToken;
  let adminToken;
  let userId = 'user-123';
  let adminId = 'admin-123';

  beforeAll(() => {
    userToken = jwt.sign({ id: userId, role: 'user' }, JWT_SECRET);
    adminToken = jwt.sign({ id: adminId, role: 'admin' }, JWT_SECRET);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /users/me', () => {
    it('should return current user profile', async () => {
      const mockUser = {
        id: userId,
        name: "Test User",
        email: "test@example.com",
        role: "user",
        createdAt: new Date().toISOString()
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.email).toEqual(mockUser.email);
      expect(prisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: userId } })
      );
    });

    it('should fail if not authenticated', async () => {
      const res = await request(app).get('/api/users/me');
      expect(res.statusCode).toEqual(401);
    });
  });

  describe('GET /users', () => {
    // Assuming this route is protected (e.g., admin only). 
    // Checking routes file is needed to confirm permissions.
    // If it's public (unlikely for getAllUsers), I'll adjust.
    // Based on typical patterns, it's often Admin only.
    
    it('should return list of users', async () => {
      const mockUsers = [
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' }
      ];

      prisma.user.findMany.mockResolvedValue(mockUsers);

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`); // Assuming admin access 

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBe(2);
      expect(prisma.user.findMany).toHaveBeenCalled();
    });
  });
});