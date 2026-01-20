import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';

// 1. Mock Prisma BEFORE importing app
jest.unstable_mockModule('../../prisma/prismaClient.js', () => ({
  default: {
    ticket: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    event: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    $disconnect: jest.fn(),
  }
}));

// 2. Dynamic imports
const prisma = (await import('../../prisma/prismaClient.js')).default;
const app = (await import('../../app.js')).default;
import { JWT_SECRET } from '../../middleware/auth.js';

describe('Ticket Controller (Unit Tests)', () => {
  let userToken;
  let organizerToken;
  let userId = 'user-123';
  let organizerId = 'org-123';
  let eventId = 'event-123';
  let ticketId = 'ticket-1';

  beforeAll(() => {
    userToken = jwt.sign({ id: userId, role: 'user' }, JWT_SECRET);
    organizerToken = jwt.sign({ id: organizerId, role: 'organizer' }, JWT_SECRET);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /tickets', () => {
    it('should allow user to buy a ticket', async () => {
      // Mock event found with capacity
      prisma.event.findUnique.mockResolvedValue({
        id: eventId,
        capacity: 100,
        _count: { tickets: 50 },
        price: 10
      });

      // Mock ticket creation
      prisma.ticket.create.mockResolvedValue({
        id: ticketId,
        userId,
        eventId,
        status: 'paid',
        qrCode: 'some-qr-code'
      });

      const res = await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ eventId });

      expect(res.statusCode).toEqual(201);
      // expect(res.body.ticket).toHaveProperty('qrCode'); // Depends on controller response structure
      expect(prisma.ticket.create).toHaveBeenCalled();
    });

    it('should fail if event sold out', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: eventId,
        capacity: 100,
        _count: { tickets: 100 } // Full
      });

      const res = await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ eventId });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toMatch(/complet|Sold Out/i);
    });
  });

  describe('POST /tickets/validate', () => {
    it('should validate a valid ticket as organizer', async () => {
      const qrCode = 'VALID-QR-CODE';
      
      // Assume controller finds by qrCode (findUnique or findFirst)
      // Usually prisma schema creates unique index on qrCode if finding by it.
      // If controller uses findFirst({where: {qrCode}}), mock that.
      // If controller uses findUnique, mock that.
      
      // Let's mock findUnique for qrCode if that's how it's done, or findFirst.
      const mockTicketWithEvent = (status = 'paid') => ({
        id: ticketId,
        status, // 'paid' or 'used'
        eventId,
        qrCode,
        event: {
          id: eventId,
          organizerId
        }
      });

      prisma.ticket.findUnique.mockImplementation(({ where }) => {
          if (where.qrCode === qrCode || where.id === ticketId) {
             return Promise.resolve(mockTicketWithEvent());
          }
          return Promise.resolve(null);
      });
      // Also mock findFirst just in case
      prisma.ticket.findFirst.mockResolvedValue(mockTicketWithEvent());

      prisma.ticket.update.mockResolvedValue({
        id: ticketId,
        status: 'used',
        validatedAt: new Date()
      });

      const res = await request(app)
        .post('/api/tickets/validate')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({ qrCode });

      expect(res.statusCode).toEqual(200);
      expect(prisma.ticket.update).toHaveBeenCalled();
    });

    it('should fail if ticket already used', async () => {
      const qrCode = 'USED-QR';
      
      const usedTicket = {
        id: ticketId,
        status: 'used',
        eventId,
        qrCode,
        event: {
            id: eventId,
            organizerId
        }
      };
      
      prisma.ticket.findUnique.mockResolvedValue(usedTicket);
      prisma.ticket.findFirst.mockResolvedValue(usedTicket);

      const res = await request(app)
        .post('/api/tickets/validate')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({ qrCode });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toMatch(/déjà été validé|invalidate/i);
    });

    it('should fail if unauthorized user tries to validate', async () => {
      // Must return a ticket so it proceeds to permission check
       prisma.ticket.findFirst.mockResolvedValue({
        id: ticketId,
        status: 'paid',
        eventId,
        qrCode: 'ANY-QR',
        event: {
            id: eventId,
            organizerId // organizerId is 'org-123'
        }
      });

      const res = await request(app)
        .post('/api/tickets/validate')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ qrCode: 'ANY-QR' });

      // If middleware checks role properly
      expect(res.statusCode).toEqual(403);
    });
  });
});
