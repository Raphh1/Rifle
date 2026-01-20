import request from 'supertest';
import app from '../app.js';

describe('API Health Check', () => {
  it('should return 200 OK on GET /', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message');
  });
});
