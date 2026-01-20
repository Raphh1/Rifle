import { jest } from '@jest/globals';
import request from 'supertest';

// 1. Mock Prisma BEFORE importing app
jest.unstable_mockModule('../../prisma/prismaClient.js', () => ({
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $disconnect: jest.fn(),
  }
}));

// 2. Dynamic imports after mock
const prisma = (await import('../../prisma/prismaClient.js')).default;
const app = (await import('../../app.js')).default;
import bcrypt from 'bcryptjs';

describe('Auth Controller (Unit Tests)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validUser = {
    name: "Test User",
    email: "test@example.com",
    password: "password123"
  };

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      // Mock: User does not exist
      prisma.user.findUnique.mockResolvedValue(null);
      // Mock: Create user returns data
      prisma.user.create.mockResolvedValue({
        id: '1',
        ...validUser,
        role: 'user',
        password: 'hashedpassword'
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should fail if email already exists', async () => {
      // Mock: User exists
      prisma.user.findUnique.mockResolvedValue({ id: '1', email: validUser.email });

      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(res.statusCode).toEqual(409);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const hashedPassword = await bcrypt.hash(validUser.password, 10);
      
      // Mock: User found
      prisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: validUser.email,
        password: hashedPassword,
        role: 'user'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUser.email,
          password: validUser.password
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should fail with incorrect password', async () => {
      const hashedPassword = await bcrypt.hash(validUser.password, 10);
      
      // Mock: User found
      prisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: validUser.email,
        password: hashedPassword,
        role: 'user'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUser.email,
          password: "wrongpassword"
        });

      expect(res.statusCode).toEqual(401);
    });

    it('should fail with non-existent email', async () => {
      // Mock: User not found
      prisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: "unknown@example.com",
          password: "password123"
        });

      expect(res.statusCode).toEqual(404);
    });
  });
});
