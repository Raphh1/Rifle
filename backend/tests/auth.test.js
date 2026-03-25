import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/prisma/prismaClient.js';
import bcrypt from 'bcryptjs';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';

describe('Authentication Routes', () => {
  const testUser = {
    email: 'test.auth@example.com',
    password: 'TestPassword123',
    name: 'Test User Auth',
  };

  let userId;
  let authToken;

  beforeEach(async () => {
    // Clean up test data before each test
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
  });

  afterAll(async () => {
    // Clean up after all tests
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({
          email: testUser.email,
          password: testUser.password,
          name: testUser.name,
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user.name).toBe(testUser.name);
      expect(res.body.user.role).toBe('user');
    });

    it('should reject registration with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: testUser.email,
          // missing password and name
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject duplicate email registration', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      // Second registration with same email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          name: 'Different Name',
        });

      expect(res.statusCode).toEqual(409);
      expect(res.body).toHaveProperty('error');
    });

    it('should hash password before storing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toEqual(201);

      const user = await prisma.user.findUnique({
        where: { email: testUser.email },
      });

      expect(user).toBeTruthy();
      expect(user.password).not.toBe(testUser.password);
      expect(user.password).toBeTruthy();

      // Verify password hash works
      const isValidPassword = await bcrypt.compare(testUser.password, user.password);
      expect(isValidPassword).toBe(true);
    });

    it('should return a valid JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toEqual(201);
      expect(res.body.token).toBeTruthy();
      
      // JWT should have 3 parts separated by dots
      const tokenParts = res.body.token.split('.');
      expect(tokenParts.length).toBe(3);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Register a test user before each login test
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(testUser.email);
      authToken = res.body.token;
    });

    it('should reject login with non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'somepassword',
        });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123',
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject login with missing credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          // missing password
        });

      expect(res.statusCode).toEqual(400);
    });

    it('should return valid JWT token on successful login', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.token).toBeTruthy();

      const tokenParts = res.body.token.split('.');
      expect(tokenParts.length).toBe(3);
    });
  });

  describe('Auth Middleware', () => {
    beforeEach(async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      authToken = res.body.token;
    });

    it('should allow requests with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).not.toEqual(401);
      expect(res.statusCode).not.toEqual(403);
    });

    it('should reject requests without token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.statusCode).toEqual(401);
    });

    it('should reject requests with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(res.statusCode).toEqual(401);
    });

    it('should reject requests with malformed Bearer header', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'InvalidFormat');

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('User Data Integrity', () => {
    it('should store user with correct default role', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.body.user.role).toBe('user');

      const user = await prisma.user.findUnique({
        where: { email: testUser.email },
      });

      expect(user?.role).toBe('USER');
    });

    it('should create user with unique ID', async () => {
      const res1 = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      const user2Data = {
        ...testUser,
        email: 'different.email@example.com',
      };

      const res2 = await request(app)
        .post('/api/auth/register')
        .send(user2Data);

      expect(res1.body.user.id).not.toBe(res2.body.user.id);

      // Cleanup
      await prisma.user.deleteMany({
        where: { email: user2Data.email },
      });
    });
  });
});
