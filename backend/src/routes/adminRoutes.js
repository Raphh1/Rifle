import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { updateUserRole, getAllUsers, deleteUser } from "../controllers/adminController.js";

const router = express.Router();

// Middleware global pour ce routeur : authentifié + admin requis
// Attention : assure-toi que ton enum Role dans la DB contient bien "admin" (minuscule)
router.use(authenticate, authorize("admin"));

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Récupérer tous les utilisateurs (Admin seulement)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 */
router.get("/users", getAllUsers);

/**
 * @swagger
 * /admin/users/{id}/role:
 *   post:
 *     summary: Changer le rôle d'un utilisateur
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, organizer, admin]
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour
 */
router.post("/users/:id/role", updateUserRole);

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur (Admin seulement)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur supprimé
 */
router.delete("/users/:id", deleteUser);

export default router;
