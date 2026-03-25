import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/prisma/prismaClient.js';
import jwt from 'jsonwebtoken';
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { JWT_SECRET } from '../src/middleware/auth.js';

describe('Events Routes', () => {
  let organizerId;
  let organizerToken;
  let eventId;

  const organizerData = {
    email: 'organizer@test.com',
    password: 'OrganizerPass123',
    name: 'Test Organizer',
  };

  const eventData = {
    title: 'Test Concert',
    description: 'A wonderful test concert event',
    date: new Date(Date.now() + 86400000).toISOString(),
    location: 'Test City',
    price: 50,
    capacity: 100,
    imageUrl: 'https://example.com/test.jpg',
  };

  beforeEach(async () => {
    // Clean up
    await prisma.event.deleteMany({ where: { title: eventData.title } });
    await prisma.user.deleteMany({ where: { email: organizerData.email } });

    // Register organizer
    const res = await request(app)
      .post('/api/auth/register')
      .send(organizerData);

    organizerId = res.body.user.id;
    organizerToken = res.body.token;

    // Update user to organizer role
    await prisma.user.update({
      where: { id: organizerId },
      data: { role: 'ORGANIZER' },
    });
  });

  afterAll(async () => {
    await prisma.event.deleteMany({ where: { title: eventData.title } });
    await prisma.user.deleteMany({ where: { email: organizerData.email } });
  });

  describe('GET /api/events', () => {
    beforeEach(async () => {
      // Create test event
      const event = await prisma.event.create({
        data: {
          ...eventData,
          organizerId,
        },
      });
      eventId = event.id;
    });

    it('should retrieve all events without authentication', async () => {
      const res = await request(app).get('/api/events');

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should return paginated events', async () => {
      const res = await request(app).get('/api/events');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('meta');
      expect(res.body.meta).toHaveProperty('page');
      expect(res.body.meta).toHaveProperty('total');
    });

    it('should filter events by location', async () => {
      const res = await request(app)
        .get('/api/events')
        .query({ location: 'Test City' });

      expect(res.statusCode).toEqual(200);
      if (res.body.data.length > 0) {
        expect(res.body.data[0].location).toBe('Test City');
      }
    });
  });

  describe('POST /api/events', () => {
    it('should create event with valid token and data', async () => {
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send(eventData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe(eventData.title);
      expect(res.body.organizerId).toBe(organizerId);
      eventId = res.body.id;
    });

    it('should reject event creation without authentication', async () => {
      const res = await request(app).post('/api/events').send(eventData);

      expect(res.statusCode).toEqual(401);
    });

    it('should reject event creation with missing fields', async () => {
      const incompleteData = {
        title: 'Incomplete Event',
        // Missing other required fields
      };

      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send(incompleteData);

      expect(res.statusCode).toEqual(400);
    });

    it('should reject event with past date', async () => {
      const pastEventData = {
        ...eventData,
        date: new Date(Date.now() - 86400000).toISOString(),
      };

      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send(pastEventData);

      expect(res.statusCode).toEqual(400);
    });

    it('should reject event with invalid price', async () => {
      const invalidEventData = {
        ...eventData,
        price: -50,
      };

      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send(invalidEventData);

      expect(res.statusCode).toEqual(400);
    });

    it('should reject event with invalid capacity', async () => {
      const invalidEventData = {
        ...eventData,
        capacity: 0,
      };

      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send(invalidEventData);

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('GET /api/events/:id', () => {
    beforeEach(async () => {
      const event = await prisma.event.create({
        data: {
          ...eventData,
          organizerId,
        },
      });
      eventId = event.id;
    });

    it('should retrieve event by ID', async () => {
      const res = await request(app).get(`/api/events/${eventId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toBe(eventId);
      expect(res.body.title).toBe(eventData.title);
    });

    it('should return 404 for non-existent event', async () => {
      const res = await request(app).get('/api/events/non-existent-id');

      expect(res.statusCode).toEqual(404);
    });

    it('should include organizer information', async () => {
      const res = await request(app).get(`/api/events/${eventId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('organizer');
      expect(res.body.organizer.id).toBe(organizerId);
    });

    it('should calculate remaining tickets correctly', async () => {
      const res = await request(app).get(`/api/events/${eventId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.remaining).toBe(res.body.capacity);
    });
  });

  describe('PUT /api/events/:id', () => {
    beforeEach(async () => {
      const event = await prisma.event.create({
        data: {
          ...eventData,
          organizerId,
        },
      });
      eventId = event.id;
    });

    it('should update event with valid token', async () => {
      const updatedData = {
        ...eventData,
        title: 'Updated Concert Title',
        price: 75,
      };

      const res = await request(app)
        .put(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.title).toBe('Updated Concert Title');
      expect(res.body.price).toBe(75);
    });

    it('should reject update without authentication', async () => {
      const res = await request(app)
        .put(`/api/events/${eventId}`)
        .send(eventData);

      expect(res.statusCode).toEqual(401);
    });

    it('should reject update by non-organizer', async () => {
      // Create another user (not the organizer)
      const otherUserData = {
        email: 'other@test.com',
        password: 'OtherPass123',
        name: 'Other User',
      };

      const otherRes = await request(app)
        .post('/api/auth/register')
        .send(otherUserData);

      const otherToken = otherRes.body.token;

      // Try to update with other user's token
      const res = await request(app)
        .put(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send(eventData);

      expect(res.statusCode).toEqual(403);

      // Cleanup
      await prisma.user.deleteMany({
        where: { email: otherUserData.email },
      });
    });
  });

  describe('DELETE /api/events/:id', () => {
    beforeEach(async () => {
      const event = await prisma.event.create({
        data: {
          ...eventData,
          organizerId,
        },
      });
      eventId = event.id;
    });

    it('should delete event with valid token', async () => {
      const res = await request(app)
        .delete(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${organizerToken}`);

      expect(res.statusCode).toEqual(200);

      // Verify deletion
      const checkRes = await request(app).get(`/api/events/${eventId}`);
      expect(checkRes.statusCode).toEqual(404);
    });

    it('should reject deletion without authentication', async () => {
      const res = await request(app).delete(`/api/events/${eventId}`);

      expect(res.statusCode).toEqual(401);
    });

    it('should reject deletion by non-organizer', async () => {
      const otherUserData = {
        email: 'other2@test.com',
        password: 'OtherPass123',
        name: 'Other User 2',
      };

      const otherRes = await request(app)
        .post('/api/auth/register')
        .send(otherUserData);

      const otherToken = otherRes.body.token;

      const res = await request(app)
        .delete(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.statusCode).toEqual(403);

      // Cleanup
      await prisma.user.deleteMany({
        where: { email: otherUserData.email },
      });
    });
  });

  describe('Event Validation', () => {
    it('should store event with correct data types', async () => {
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send(eventData);

      expect(res.statusCode).toEqual(201);
      expect(typeof res.body.price).toBe('number');
      expect(typeof res.body.capacity).toBe('number');
      expect(typeof res.body.title).toBe('string');
    });

    it('should maintain event-organizer relationship', async () => {
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send(eventData);

      const eventCheckRes = await request(app).get(`/api/events/${res.body.id}`);

      expect(eventCheckRes.body.organizerId).toBe(organizerId);
      expect(eventCheckRes.body.organizer.id).toBe(organizerId);
    });
  });
});
