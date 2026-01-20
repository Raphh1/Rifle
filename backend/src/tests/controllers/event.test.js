import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';

// 1. Mock Prisma BEFORE importing app
jest.unstable_mockModule('../../prisma/prismaClient.js', () => ({
  default: {
    event: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $disconnect: jest.fn(),
  }
}));

// 2. Dynamic imports
const prisma = (await import('../../prisma/prismaClient.js')).default;
const app = (await import('../../app.js')).default;
import { JWT_SECRET } from '../../middleware/auth.js';

describe('Event Controller (Unit Tests)', () => {
  let organizerToken;
  let organizerId = 'organizer-123';

  const eventData = {
    title: "Test Event",
    description: "This is a test event",
    date: new Date(Date.now() + 86400000).toISOString(),
    location: "Paris",
    price: 10.50,
    capacity: 100,
    imageUrl: "http://example.com/image.jpg"
  };

  beforeAll(() => {
    organizerToken = jwt.sign({ id: organizerId, role: 'organizer' }, JWT_SECRET);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /events', () => {
    it('should create an event when authenticated as organizer', async () => {
      // Mock create return
      prisma.event.create.mockResolvedValue({
        id: 'event-1',
        organizerId,
        ...eventData
      });

      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send(eventData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.title).toEqual(eventData.title);
      expect(prisma.event.create).toHaveBeenCalled();
    });

    it('should fail if not authenticated', async () => {
      const res = await request(app)
        .post('/api/events')
        .send(eventData);

      expect(res.statusCode).toEqual(401);
      expect(prisma.event.create).not.toHaveBeenCalled();
    });
  });

  describe('GET /events', () => {
    it('should list all events', async () => {
      prisma.event.findMany.mockResolvedValue([{ id: '1', ...eventData }]);

      const res = await request(app).get('/api/events');
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBe(1);
    });
  });

  describe('GET /events/:id', () => {
    it('should return event details', async () => {
      prisma.event.findUnique.mockResolvedValue({ id: 'event-1', ...eventData });

      const res = await request(app).get(`/api/events/event-1`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual('event-1');
    });

    it('should return 404 for unknown event', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      const res = await request(app).get('/api/events/unknown');
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('PUT /events/:id', () => {
    it('should update event if owner', async () => {
      // Mock fetching existing event to check ownership
      prisma.event.findUnique.mockResolvedValue({ 
        id: 'event-1', 
        organizerId 
      });

      // Mock update
      prisma.event.update.mockResolvedValue({
        id: 'event-1',
        organizerId,
        ...eventData,
        title: "Updated Title"
      });

      const res = await request(app)
        .put(`/api/events/event-1`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({ title: "Updated Title" });

      expect(res.statusCode).toEqual(200);
      expect(res.body.title).toEqual("Updated Title");
    });
  });

  describe('DELETE /events/:id', () => {
    it('should delete event if owner', async () => {
       // Mock fetching existing event
       prisma.event.findUnique.mockResolvedValue({ 
        id: 'event-1', 
        organizerId 
      });

      prisma.event.delete.mockResolvedValue({});

      const res = await request(app)
        .delete(`/api/events/event-1`)
        .set('Authorization', `Bearer ${organizerToken}`);

      expect(res.statusCode).toEqual(200);
      expect(prisma.event.delete).toHaveBeenCalled();
    });
  });
});
