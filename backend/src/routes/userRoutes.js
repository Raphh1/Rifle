/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestion des profils utilisateurs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID unique de l'utilisateur
 *         name:
 *           type: string
 *           description: Nom complet
 *         email:
 *           type: string
 *           format: email
 *           description: Adresse email
 *         role:
 *           type: string
 *           enum: [user, organizer, admin]
 *           description: Rôle de l'utilisateur
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création du compte
 *       example:
 *         id: "cm64..."
 *         name: "Jean Dupont"
 *         email: "jean.dupont@example.com"
 *         role: "user"
 *         createdAt: "2026-01-20T10:00:00Z"
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
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Non authentifié - Token manquant ou invalide
 */
router.get("/me", authenticate, getProfile);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Récupère tous les utilisateurs (Admin uniquement)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé - Réservé aux administrateurs
 */
router.get("/", authenticate, authorize("admin"), getAllUsers);

export default router;
