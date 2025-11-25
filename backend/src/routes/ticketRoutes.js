/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Gestion des tickets
 */

import express from "express";
import { authenticate } from "../middleware/auth.js";
import { getMyTickets, buyTicket } from "../controllers/ticketController.js";

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

export default router;
