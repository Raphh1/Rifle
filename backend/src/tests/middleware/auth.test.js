import { jest } from '@jest/globals';

// Mock jsonwebtoken
jest.unstable_mockModule('jsonwebtoken', () => ({
    default: {
        verify: jest.fn(),
        sign: jest.fn(), // If needed, though not used in middleware
    }
}));

const { authenticate, authorize } = await import('../../middleware/auth.js');
const jwt = (await import('jsonwebtoken')).default;

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      user: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should return 401 if no token provided', () => {
      authenticate(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "Token manquant" }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next() if token is valid', () => {
      req.headers.authorization = 'Bearer valid-token';
      const decodedUser = { id: 1, role: 'user' };
      jwt.verify.mockReturnValue(decodedUser);

      authenticate(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', expect.any(String));
      expect(req.user).toEqual(decodedUser);
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', () => {
      req.headers.authorization = 'Bearer invalid-token';
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "Token invalide" }));
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    it('should return 401 if req.user is missing', () => {
      const middleware = authorize('admin');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "Non authentifié" }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if user role is not allowed', () => {
        req.user = { role: 'user' };
        const middleware = authorize('admin');
        middleware(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "Accès refusé" }));
        expect(next).not.toHaveBeenCalled();
      });

    it('should call next() if user role is allowed', () => {
      req.user = { role: 'admin' };
      const middleware = authorize('admin');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should allow multiple roles', () => {
        req.user = { role: 'editor' };
        const middleware = authorize('admin', 'editor');
        middleware(req, res, next);
  
        expect(next).toHaveBeenCalled();
    });
  });
});