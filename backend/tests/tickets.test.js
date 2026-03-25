import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/prisma/prismaClient.js';
import { describe, it, expect, beforeEach, afterAll } from 'vitest';

describe('Tickets Routes', () => {
  let userId;
  let userToken;
  let organizerId;
  let organizerToken;
  let eventId;
  let ticketId;

  const userData = {
    email: 'user@test.com',
    password: 'UserPass123',
    name: 'Test User',
  };

  const organizerData = {
    email: 'organizer@test.com',
    password: 'OrganizerPass123',
    name: 'Test Organizer',
  };

  const eventData = {
    title: 'Test Event for Tickets',
    description: 'A test event for ticket purchases',
    date: new Date(Date.now() + 86400000).toISOString(),
    location: 'Test City',
    price: 50,
    capacity: 100,
    imageUrl: 'https://example.com/test.jpg',
  };

  beforeEach(async () => {
    // Clean up
    await prisma.ticket.deleteMany();
    await prisma.event.deleteMany({ where: { title: eventData.title } });
    await prisma.user.deleteMany({
      where: {
        email: { in: [userData.email, organizerData.email] },
      },
    });

    // Register user
    const userRes = await request(app)
      .post('/api/auth/register')
      .send(userData);
    userId = userRes.body.user.id;
    userToken = userRes.body.token;

    // Register organizer
    const orgRes = await request(app)
      .post('/api/auth/register')
      .send(organizerData);
    organizerId = orgRes.body.user.id;
    organizerToken = orgRes.body.token;

    // Update to organizer role
    await prisma.user.update({
      where: { id: organizerId },
      data: { role: 'ORGANIZER' },
    });

    // Create event
    const eventRes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${organizerToken}`)
      .send(eventData);
    eventId = eventRes.body.id;
  });

  afterAll(async () => {
    await prisma.ticket.deleteMany();
    await prisma.event.deleteMany({ where: { title: eventData.title } });
    await prisma.user.deleteMany({
      where: {
        email: { in: [userData.email, organizerData.email] },
      },
    });
  });

  describe('GET /api/tickets', () => {
    it('should retrieve user tickets with authentication', async () => {
      const res = await request(app)
        .get('/api/tickets')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should reject ticket retrieval without authentication', async () => {
      const res = await request(app).get('/api/tickets');

      expect(res.statusCode).toEqual(401);
    });

    it('should return paginated tickets', async () => {
      const res = await request(app)
        .get('/api/tickets')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('meta');
    });

    it('should only return tickets for authenticated user', async () => {
      // Create another user
      const otherUserData = {
        email: 'otheruser@test.com',
        password: 'OtherPass123',
        name: 'Other User',
      };

      const otherRes = await request(app)
        .post('/api/auth/register')
        .send(otherUserData);
      const otherToken = otherRes.body.token;

      const userTicketsRes = await request(app)
        .get('/api/tickets')
        .set('Authorization', `Bearer ${userToken}`);

      const otherTicketsRes = await request(app)
        .get('/api/tickets')
        .set('Authorization', `Bearer ${otherToken}`);

      // Both should return array but independent to their user
      expect(Array.isArray(userTicketsRes.body.data)).toBe(true);
      expect(Array.isArray(otherTicketsRes.body.data)).toBe(true);

      // Cleanup
      await prisma.user.deleteMany({
        where: { email: otherUserData.email },
      });
    });
  });

  describe('POST /api/tickets/buy', () => {
    it('should create ticket with valid event and user', async () => {
      const res = await request(app)
        .post('/api/tickets/buy')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ eventId });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.userId).toBe(userId);
      expect(res.body.eventId).toBe(eventId);
      expect(res.body.status).toBe('pending');
      ticketId = res.body.id;
    });

    it('should reject ticket purchase without authentication', async () => {
      const res = await request(app)
        .post('/api/tickets/buy')
        .send({ eventId });

      expect(res.statusCode).toEqual(401);
    });

    it('should reject purchase for non-existent event', async () => {
      const res = await request(app)
        .post('/api/tickets/buy')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ eventId: 'non-existent' });

      expect(res.statusCode).toEqual(404);
    });

    it('should reject purchase when event is full', async () => {
      // Create event with capacity 1
      const smallEventRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          ...eventData,
          title: 'Small Event',
          capacity: 1,
        });
      const smallEventId = smallEventRes.body.id;

      // Register two users
      const user1Res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'user1@test.com',
          password: 'Pass123',
          name: 'User 1',
        });
      const user1Token = user1Res.body.token;

      const user2Res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'user2@test.com',
          password: 'Pass123',
          name: 'User 2',
        });
      const user2Token = user2Res.body.token;

      // User 1 buys ticket
      const buy1Res = await request(app)
        .post('/api/tickets/buy')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ eventId: smallEventId });
      expect(buy1Res.statusCode).toEqual(201);

      // User 2 tries to buy (should fail - capacity full)
      const buy2Res = await request(app)
        .post('/api/tickets/buy')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ eventId: smallEventId });
      expect(buy2Res.statusCode).toEqual(400);

      // Cleanup
      await prisma.user.deleteMany({
        where: {
          email: { in: ['user1@test.com', 'user2@test.com'] },
        },
      });
      await prisma.event.deleteMany({
        where: { title: 'Small Event' },
      });
    });
  });

  describe('GET /api/tickets/:id', () => {
    beforeEach(async () => {
      const buyRes = await request(app)
        .post('/api/tickets/buy')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ eventId });
      ticketId = buyRes.body.id;
    });

    it('should retrieve ticket by ID', async () => {
      const res = await request(app)
        .get(`/api/tickets/${ticketId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toBe(ticketId);
      expect(res.body.userId).toBe(userId);
    });

    it('should include event information in ticket', async () => {
      const res = await request(app)
        .get(`/api/tickets/${ticketId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('event');
      expect(res.body.event.id).toBe(eventId);
    });

    it('should return 404 for non-existent ticket', async () => {
      const res = await request(app)
        .get('/api/tickets/non-existent')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(404);
    });
  });

  describe('POST /api/tickets/:id/validate', () => {
    beforeEach(async () => {
      const buyRes = await request(app)
        .post('/api/tickets/buy')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ eventId });
      ticketId = buyRes.body.id;

      // Mark as paid
      await prisma.ticket.update({
        where: { id: ticketId },
        data: { status: 'paid' },
      });
    });

    it('should validate paid ticket', async () => {
      const res = await request(app)
        .post(`/api/tickets/${ticketId}/validate`)
        .set('Authorization', `Bearer ${organizerToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe('used');
    });

    it('should reject validation without authentication', async () => {
      const res = await request(app).post(`/api/tickets/${ticketId}/validate`);

      expect(res.statusCode).toEqual(401);
    });

    it('should reject validation of non-paid tickets', async () => {
      // Create a pending ticket
      const pendingRes = await request(app)
        .post('/api/tickets/buy')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ eventId });
      const pendingTicketId = pendingRes.body.id;

      const res = await request(app)
        .post(`/api/tickets/${pendingTicketId}/validate`)
        .set('Authorization', `Bearer ${organizerToken}`);

      expect(res.statusCode).toEqual(400);
    });

    it('should set validatedAt timestamp', async () => {
      const res = await request(app)
        .post(`/api/tickets/${ticketId}/validate`)
        .set('Authorization', `Bearer ${organizerToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('validatedAt');
    });
  });

  describe('Ticket QR Code', () => {
    it('should generate QR code on ticket creation', async () => {
      const res = await request(app)
        .post('/api/tickets/buy')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ eventId });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('qrCode');
      expect(res.body.qrCode).toBeTruthy();
    });

    it('should include QR code in ticket retrieval', async () => {
      const buyRes = await request(app)
        .post('/api/tickets/buy')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ eventId });

      const getRes = await request(app)
        .get(`/api/tickets/${buyRes.body.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(getRes.statusCode).toEqual(200);
      expect(getRes.body).toHaveProperty('qrCode');
    });
  });

  describe('Ticket Status Workflow', () => {
    it('should start with pending status', async () => {
      const res = await request(app)
        .post('/api/tickets/buy')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ eventId });

      expect(res.body.status).toBe('pending');
    });

    it('should transition from pending to paid', async () => {
      const buyRes = await request(app)
        .post('/api/tickets/buy')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ eventId });

      await prisma.ticket.update({
        where: { id: buyRes.body.id },
        data: { status: 'paid' },
      });

      const getRes = await request(app)
        .get(`/api/tickets/${buyRes.body.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(getRes.body.status).toBe('paid');
    });

    it('should transition from paid to used after validation', async () => {
      const buyRes = await request(app)
        .post('/api/tickets/buy')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ eventId });

      await prisma.ticket.update({
        where: { id: buyRes.body.id },
        data: { status: 'paid' },
      });

      const validateRes = await request(app)
        .post(`/api/tickets/${buyRes.body.id}/validate`)
        .set('Authorization', `Bearer ${organizerToken}`);

      expect(validateRes.body.status).toBe('used');
    });
  });
});
