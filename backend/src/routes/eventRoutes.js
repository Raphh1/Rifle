/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Gestion des événements
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       required:
 *         - title
 *         - date
 *         - location
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-généré de l'événement
 *         title:
 *           type: string
 *           description: Titre de l'événement
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date et heure de l'événement
 *         location:
 *           type: string
 *           description: Lieu où se déroule l'événement
 *         organizerId:
 *           type: integer
 *           description: ID de l'organisateur
 *       example:
 *         id: 1
 *         title: "Festival Rifle"
 *         date: "2025-12-15T19:00:00Z"
 *         location: "Bordeaux"
 *         organizerId: 2
 */

import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";

const router = express.Router();

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Liste tous les événements (paginé)
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numéro de la page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Terme de recherche (titre, location, description)
 *     responses:
 *       200:
 *         description: Liste des événements avec pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     last_page:
 *                       type: integer
 */
router.get("/", getAllEvents);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Récupère un événement par son ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'événement
 *     responses:
 *       200:
 *         description: Détails d'un événement
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Événement introuvable
 */
router.get("/:id", getEventById);

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Crée un nouvel événement (organisateur ou admin)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       201:
 *         description: Événement créé avec succès
 *       401:
 *         description: Non autorisé
 */
router.post("/", authenticate, createEvent);

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Met à jour un événement existant
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'événement
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       200:
 *         description: Événement mis à jour
 *       404:
 *         description: Événement introuvable
 */
router.put("/:id", authenticate, updateEvent);

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Supprime un événement
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'événement à supprimer
 *     responses:
 *       200:
 *         description: Événement supprimé
 *       404:
 *         description: Événement introuvable
 */
router.delete("/:id", authenticate, deleteEvent);

export default router;
