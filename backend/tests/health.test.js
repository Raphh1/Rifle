import request from 'supertest';
import app from '../src/app.js';

describe('API Health Check', () => {
  it('should return 200 OK on root path', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'API Rifle en ligne 🚀');
  });

  it('should serve Swagger docs', async () => {
    const res = await request(app).get('/api-docs/');
    expect(res.statusCode).toEqual(200);
  });
});