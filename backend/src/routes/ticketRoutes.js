/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Gestion des tickets
 */

import express from "express";
import { authenticate } from "../middleware/auth.js";
import { getMyTickets, buyTicket, validateTicket } from "../controllers/ticketController.js";

const router = express.Router();

/**
 * @swagger
 * /tickets:
 *   get:
 *     summary: Récupère les tickets de l'utilisateur connecté
 *     tags: [Tickets]
 *     responses:
 *       200:
 *         description: Liste des tickets
 */
router.get("/", authenticate, getMyTickets);

/**
 * @swagger
 * /tickets:
 *   post:
 *     summary: Permet d'acheter un ticket
 *     tags: [Tickets]
 *     responses:
 *       201:
 *         description: Ticket acheté avec succès
 */
router.post("/", authenticate, buyTicket);

/**
 * @swagger
 * /tickets/validate:
 *   post:
 *     summary: Valider un ticket (Organisateur/Admin)
 *     tags: [Tickets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               qrCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ticket validé
 *       400:
 *         description: Déjà validé ou invalide
 *       403:
 *         description: Non autorisé
 */
router.post("/validate", authenticate, validateTicket);

export default router;
