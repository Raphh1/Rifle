import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  createEventSchema,
  type LoginFormData,
  type RegisterFormData,
  type CreateEventFormData,
} from './validation';

describe('Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate correct login credentials', () => {
      const validData = {
        email: 'user@example.com',
        password: 'password123',
      };
      expect(() => loginSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      };
      expect(() => loginSchema.parse(invalidData)).toThrow();
    });

    it('should reject password shorter than 6 characters', () => {
      const invalidData = {
        email: 'user@example.com',
        password: 'short',
      };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('au moins 6 caractères');
      }
    });

    it('should reject empty email', () => {
      const invalidData = {
        email: '',
        password: 'password123',
      };
      expect(() => loginSchema.parse(invalidData)).toThrow();
    });

    it('should work with valid safeParse', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123',
      };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
      }
    });
  });

  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };
      expect(() => registerSchema.parse(validData)).not.toThrow();
    });

    it('should reject name shorter than 2 characters', () => {
      const invalidData = {
        name: 'J',
        email: 'john@example.com',
        password: 'password123',
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'not-an-email',
        password: 'password123',
      };
      expect(() => registerSchema.parse(invalidData)).toThrow();
    });

    it('should reject short password', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123',
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept long names and emails', () => {
      const validData = {
        name: 'Jean-Claude Van Damme International Film Festival Director',
        email: 'very.long.email.address.with.many.characters@subdomain.example.com',
        password: 'securepassword123456',
      };
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should return type-safe data after validation', () => {
      const data = {
        name: 'Alice',
        email: 'alice@example.com',
        password: 'alice123secure',
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        const typedData: RegisterFormData = result.data;
        expect(typedData.name).toBe('Alice');
      }
    });
  });

  describe('createEventSchema', () => {
    it('should validate correct event data', () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString(); // +1 day
      const validData = {
        title: 'Amazing Concert',
        description: 'A wonderful concert event with great music',
        date: futureDate,
        location: 'Paris, France',
        price: 49.99,
        capacity: 500,
      };
      expect(() => createEventSchema.parse(validData)).not.toThrow();
    });

    it('should reject title shorter than 3 characters', () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const invalidData = {
        title: 'AB',
        description: 'A wonderful concert event with great music',
        date: futureDate,
        location: 'Paris, France',
        price: 49.99,
        capacity: 500,
      };
      const result = createEventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject description shorter than 10 characters', () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const invalidData = {
        title: 'Concert',
        description: 'Too short',
        date: futureDate,
        location: 'Paris, France',
        price: 49.99,
        capacity: 500,
      };
      const result = createEventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject past dates', () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString(); // -1 day
      const invalidData = {
        title: 'Concert',
        description: 'A wonderful concert event with great music',
        date: pastDate,
        location: 'Paris, France',
        price: 49.99,
        capacity: 500,
      };
      const result = createEventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject location shorter than 3 characters', () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const invalidData = {
        title: 'Concert',
        description: 'A wonderful concert event with great music',
        date: futureDate,
        location: 'NY',
        price: 49.99,
        capacity: 500,
      };
      const result = createEventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject negative price', () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const invalidData = {
        title: 'Concert',
        description: 'A wonderful concert event with great music',
        date: futureDate,
        location: 'Paris, France',
        price: -10,
        capacity: 500,
      };
      const result = createEventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject zero capacity', () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const invalidData = {
        title: 'Concert',
        description: 'A wonderful concert event with great music',
        date: futureDate,
        location: 'Paris, France',
        price: 49.99,
        capacity: 0,
      };
      const result = createEventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should coerce string numbers to numbers', () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const data = {
        title: 'Concert',
        description: 'A wonderful concert event with great music',
        date: futureDate,
        location: 'Paris, France',
        price: '49.99', // string
        capacity: '500', // string
      };
      const result = createEventSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.price).toBe('number');
        expect(typeof result.data.capacity).toBe('number');
      }
    });

    it('should accept free events (price = 0)', () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const validData = {
        title: 'Free Workshop',
        description: 'A wonderful free workshop for everyone interested',
        date: futureDate,
        location: 'Online',
        price: 0,
        capacity: 100,
      };
      const result = createEventSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept very large capacity and price', () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const validData = {
        title: 'Large Festival',
        description: 'The biggest festival in the country with thousands of attendees',
        date: futureDate,
        location: 'Stadium',
        price: 999999.99,
        capacity: 1000000,
      };
      const result = createEventSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should return type-safe event data', () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const data = {
        title: 'Workshop',
        description: 'Learn new skills in this intensive workshop program',
        date: futureDate,
        location: 'Tech Hub',
        price: 99.99,
        capacity: 30,
      };
      const result = createEventSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        const typedData: CreateEventFormData = result.data;
        expect(typedData.title).toBe('Workshop');
        expect(typeof typedData.capacity).toBe('number');
      }
    });
  });
});
