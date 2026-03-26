/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestion des profils utilisateurs
 */

import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import {
  getProfile,
  updateProfile,
  updatePassword,
  deleteAccount,
  getAllUsers,
} from "../controllers/userController.js";

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
 *     summary: Met à jour le profil (nom, email, avatar)
 *     tags: [Users]
 */
router.put("/me", authenticate, upload.single("avatar"), updateProfile);

/**
 * @swagger
 * /users/me/password:
 *   put:
 *     summary: Change le mot de passe
 *     tags: [Users]
 */
router.put("/me/password", authenticate, updatePassword);

/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: Supprime le compte de l'utilisateur connecté
 *     tags: [Users]
 */
router.delete("/me", authenticate, deleteAccount);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Récupère tous les utilisateurs (admin uniquement)
 *     tags: [Users]
 */
router.get("/", authenticate, authorize("admin"), getAllUsers);

export default router;
