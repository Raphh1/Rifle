import { jest } from '@jest/globals';
import request from 'supertest';

// Mock Prisma to avoid import errors with generated client
jest.unstable_mockModule('../prisma/prismaClient.js', () => ({
  default: {
    $disconnect: jest.fn(),
  }
}));

const app = (await import('../app.js')).default;

describe('API Health Check', () => {
  it('should return 200 OK on GET /', async () => {
    const res = await request(app).get('/api/'); // app.js mounts router at /api, but also has root /
    // Check root route in app.js
    const rootRes = await request(app).get('/');
    expect(rootRes.statusCode).toEqual(200);
    expect(rootRes.body).toHaveProperty('message');
  });
});
