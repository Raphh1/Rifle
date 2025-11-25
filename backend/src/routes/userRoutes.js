/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestion des profils utilisateurs
 */

import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { getProfile, getAllUsers } from "../controllers/userController.js";

const router = express.Router();

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Récupère le profil de l'utilisateur connecté
 *     tags: [Users]
 */
router.get("/me", authenticate, getProfile);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Récupère tous les utilisateurs (admin uniquement)
 *     tags: [Users]
 */
router.get("/", authenticate, authorize("admin"), getAllUsers);

export default router;
