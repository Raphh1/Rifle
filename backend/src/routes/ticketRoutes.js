/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Gestion des tickets
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Ticket:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID du ticket
 *         eventId:
 *           type: string
 *           description: ID de l'événement associé
 *         userId:
 *           type: string
 *           description: ID du propriétaire du ticket
 *         status:
 *           type: string
 *           enum: [paid, used, cancelled]
 *           description: État actuel du ticket
 *         qrCode:
 *           type: string
 *           description: Code unique pour la validation (QR Code)
 *         purchaseDate:
 *           type: string
 *           format: date-time
 *           description: Date d'achat
 *         validatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de validation (si utilisé)
 *       example:
 *         id: "ticket-123"
 *         eventId: "event-456"
 *         userId: "user-789"
 *         status: "paid"
 *         qrCode: "VALID-QR-CODE-XYZ"
 *         purchaseDate: "2026-01-20T10:00:00Z"
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
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des tickets de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ticket'
 *       401:
 *         description: Non authentifié
 */
router.get("/", authenticate, getMyTickets);

/**
 * @swagger
 * /tickets:
 *   post:
 *     summary: Permet d'acheter un ticket pour un événement
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
 *                 type: integer
 *                 description: ID de l'événement
 *     responses:
 *       201:
 *         description: Ticket acheté avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Ticket acheté
 *                 ticket:
 *                   $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Événement complet ou invalide
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Événement introuvable
 */
router.post("/", authenticate, buyTicket);

/**
 * @swagger
 * /tickets/validate:
 *   post:
 *     summary: Valider un ticket via son QR Code (Organisateur uniquement)
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
 *               - qrCode
 *             properties:
 *               qrCode:
 *                 type: string
 *                 description: Le code QR du ticket à valider
 *     responses:
 *       200:
 *         description: Ticket validé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ticket:
 *                   $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Ticket déjà validé ou invalide
 *       403:
 *         description: Accès refusé (Vous n'êtes pas l'organisateur)
 *       404:
 *         description: Ticket introuvable
 */
router.post("/validate", authenticate, validateTicket);

export default router;
