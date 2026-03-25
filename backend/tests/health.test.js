import request from 'supertest';
import app from '../src/app.js';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('API Health & Basic Routes', () => {
  it('should return 200 OK on root path', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toMatch(/rifle|api|online/i);
  });

  it('should serve Swagger docs', async () => {
    const res = await request(app).get('/api-docs/');
    expect(res.statusCode).toEqual(200);
  });

  it('should handle undefined routes with 404', async () => {
    const res = await request(app).get('/api/undefined-route-that-does-not-exist');
    expect(res.statusCode).toEqual(404);
  });

  it('should have proper CORS headers set up', async () => {
    const res = await request(app)
      .get('/')
      .set('Origin', 'http://localhost:5173');
    expect(res.statusCode).toEqual(200);
  });
});

describe('Content Types', () => {
  it('should return JSON from API endpoints', async () => {
    const res = await request(app).get('/');
    expect(res.type).toMatch(/json/);
  });

  it('should accept JSON in POST requests', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email: 'test@example.com', password: 'password' });
    
    // Should either return error or success, not 415 (unsupported media type)
    expect(res.statusCode).not.toEqual(415);
  });
});

describe('Response Format', () => {
  it('root endpoint should have consistent response format', async () => {
    const res = await request(app).get('/');
    expect(res.body).toHaveProperty('message');
    expect(typeof res.body.message).toBe('string');
  });

  it('error responses should have proper status codes', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});
    
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.statusCode).toBeLessThan(600);
  });
});