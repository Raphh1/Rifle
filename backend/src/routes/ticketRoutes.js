/**
 * Routes pour la gestion des tickets.
 * 
 * @module routes/ticketRoutes
 * 
 * @requires express
 * @requires ../middleware/auth.js
 * @requires ../controllers/ticketController.js
 * 
 * Définit les routes suivantes :
 * 
 * - POST /tickets/:id/transfer : Transfère un ticket à un autre utilisateur.
 *   - Authentification requise.
 *   - Corps de requête : { email: string }
 *   - Paramètre d'URL : id (string) - ID du ticket à transférer.
 *   - Réponses : 200 (succès), 404 (ticket ou destinataire introuvable).
 * 
 * - GET /tickets : Récupère les tickets de l'utilisateur connecté.
 *   - Authentification requise.
 *   - Réponse : 200 (liste des tickets).
 * 
 * - POST /tickets/buy : Permet d'acheter un ticket pour un événement.
 *   - Authentification requise.
 *   - Corps de requête : { eventId: string }
 *   - Réponse : 201 (ticket acheté avec succès).
 * 
 * - POST /tickets/validate : Valide un ticket (organisateur ou admin uniquement).
 *   - Authentification et autorisation requises (organizer, admin).
 *   - Corps de requête : { qrCode: string }
 *   - Réponses : 200 (ticket validé), 400 (déjà validé ou invalide), 403 (non autorisé).
 * 
 * - GET /tickets/:id : Récupère un ticket par son ID (propriétaire, organisateur ou admin).
 *   - Authentification requise.
 *   - Paramètre d'URL : id (string) - ID du ticket.
 *   - Réponse : 200 (ticket trouvé).
 * 
 * Toutes les routes nécessitent un token d'authentification (bearerAuth).
 */
/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Gestion des tickets
 */

/**
 * @swagger
 * /tickets/{id}:
 *   get:
 *     summary: Récupère un ticket par son ID (propriétaire, organisateur ou admin)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du ticket à récupérer
 *     responses:
 *       200:
 *         description: Ticket trouvé
 *       404:
 *         description: Ticket non trouvé
 */

import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import * as ticketController from "../controllers/ticketController.js";

const router = express.Router();

/**
 * @swagger
 * /tickets/{id}/transfer:
 *   post:
 *     summary: Transférer un ticket à un autre utilisateur
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du ticket à transférer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email du destinataire
 *     responses:
 *       200:
 *         description: Ticket transféré avec succès
 *       404:
 *         description: Ticket ou destinataire introuvable
 */
router.post("/:id/transfer", authenticate, ticketController.transferTicket);

/**
 * @swagger
 * /tickets:
 *   get:
 *     summary: Récupère les tickets de l'utilisateur connecté
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des tickets
 */
router.get("/", authenticate, ticketController.getMyTickets);

/**
 * @swagger
 * /tickets/buy:
 *   post:
 *     summary: Permet d'acheter un ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *             properties:
 *               eventId:
 *                 type: string
 *                 description: ID de l'événement
 *     responses:
 *       201:
 *         description: Ticket acheté avec succès
 */
router.post("/buy", authenticate, ticketController.buyTicket);

/**
 * @swagger
 * /tickets/validate:
 *   post:
 *     summary: Valider un ticket (Organisateur/Admin)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
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
router.post("/validate", authenticate, authorize("organizer", "admin"), ticketController.validateTicket);

/**
 * Récupère un ticket par ID (propriétaire / organizer / admin)
 */
router.get("/:id", authenticate, ticketController.getTicketById);

export default router;