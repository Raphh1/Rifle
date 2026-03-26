/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestion des profils utilisateurs
 */

import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { getProfile, updateProfile, deleteProfile, getAllUsers } from "../controllers/userController.js";

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
 * /users/me:
 *   put:
 *     summary: Met à jour le profil de l'utilisateur connecté
 *     tags: [Users]
 */
router.put("/me", authenticate, updateProfile);

/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: Supprime le compte de l'utilisateur connecté
 *     tags: [Users]
 */
router.delete("/me", authenticate, deleteProfile);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Récupère tous les utilisateurs (admin uniquement)
 *     tags: [Users]
 */
router.get("/", authenticate, authorize("admin"), getAllUsers);

export default router;
