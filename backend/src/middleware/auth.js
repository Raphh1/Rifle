import jwt from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Vérifie le token JWT
export const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ success: false, error: "Token manquant" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: "Token invalide" });
  }
};

// Vérifie les rôles autorisés
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Non authentifié" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: "Accès refusé" });
    }

    next();
  };
};
