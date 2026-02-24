import prisma from "../prisma/prismaClient.js";

export const getMyTickets = async (req, res) => {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { userId: req.user.id },
      include: { event: true },
    });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const buyTicket = async (req, res) => {
  try {
    const { eventId } = req.body;

    // Utilisation d'une transaction Prisma pour garantir l'atomicité
    // (Vérification du stock + Achat en une seule opération indivisible)
    const result = await prisma.$transaction(async (tx) => {
      // 1. Récupérer l'événement en "lockant" virtuellement le stock
      const event = await tx.event.findUnique({
        where: { id: eventId },
        include: {
          _count: {
            select: { tickets: true }
          }
        }
      });

      if (!event) throw new Error("Événement introuvable");

      // 2. Vérification stricte de la capacité (Stock épuisé ?)
      const placesVendues = event._count.tickets;
      if (placesVendues >= event.capacity) {
        throw new Error("SOLD_OUT"); // Erreur spécifique pour le frontend
      }

      // 3. Génération d'un QR Code unique et sécurisé
      // Format : EVT_ID-USER_ID-TIMESTAMP-RANDOM
      const uniqueQrString = `${eventId.slice(0, 4)}-${req.user.id.slice(0, 4)}-${Date.now().toString(36).toUpperCase()}`;

      // 4. Création du ticket
      const ticket = await tx.ticket.create({
        data: {
          userId: req.user.id,
          eventId,
          status: "paid", // Simulation: paiement validé immédiat
          purchaseDate: new Date(),
          qrCode: uniqueQrString
        },
      });

      return { ticket, eventTitle: event.title };
    });

    // Si la transaction réussit :
    res.status(201).json({ 
      message: `Billet acheté avec succès pour ${result.eventTitle}`, 
      ticket: result.ticket 
    });

  } catch (err) {
    console.error(err);
    // Gestion fine des erreurs
    if (err.message === "SOLD_OUT") {
      return res.status(409).json({ error: "Désolé, cet événement est complet !" });
    }
    if (err.message === "Événement introuvable") {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: "Erreur lors de l'achat du billet" });
  }
};

export const validateTicket = async (req, res) => {
  try {
    const { qrCode } = req.body;

    if (!qrCode) return res.status(400).json({ error: "QR Code manquant" });

    const ticket = await prisma.ticket.findFirst({
      where: { qrCode },
      include: { event: true }
    });

    if (!ticket) return res.status(404).json({ error: "Ticket invalide ou introuvable" });

    // Verify ownership
    if (ticket.event.organizerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Vous n'êtes pas autorisé à valider ce ticket" });
    }

    // Check if already used
    if (ticket.status === 'used' || ticket.validatedAt) {
      return res.status(400).json({ error: "Ce ticket a déjà été validé", ticket });
    }

    // Validate ticket
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: 'used',
        validatedAt: new Date()
      },
      include: {
        event: true,
        user: true
      }
    });

    res.json({ message: "Ticket validé avec succès", ticket: updatedTicket });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const transferTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    if (!email) return res.status(400).json({ error: "Email du destinataire requis" });

    // 1. Récupérer le ticket
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: { event: true, user: true }
    });

    if (!ticket) return res.status(404).json({ error: "Ticket introuvable" });

    // 2. Vérifier la propriété
    if (ticket.userId !== req.user.id) {
      return res.status(403).json({ error: "Ce ticket ne vous appartient pas" });
    }

    // 3. Vérifier le statut (impossible de transférer un ticket déjà utilisé)
    if (ticket.status === 'used' || ticket.validatedAt) {
      return res.status(400).json({ error: "Impossible de transférer un ticket déjà utilisé" });
    }

    // 4. Trouver le destinataire
    const recipient = await prisma.user.findUnique({
      where: { email }
    });

    if (!recipient) return res.status(404).json({ error: "Utilisateur destinataire introuvable" });

    if (recipient.id === req.user.id) {
      return res.status(400).json({ error: "Vous possédez déjà ce ticket" });
    }

    // 5. Effectuer le transfert
    const transferredTicket = await prisma.ticket.update({
      where: { id },
      data: {
        userId: recipient.id
      }
    });

    res.json({ message: `Ticket transféré avec succès à ${recipient.name}`, ticket: transferredTicket });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// GET /tickets/:id
export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: { event: true, user: true },
    });

    if (!ticket) return res.status(404).json({ error: "Ticket introuvable" });

    // Autorisation : propriétaire du ticket OR organisateur de l'événement OR admin
    if (
      ticket.userId !== req.user.id &&
      ticket.event?.organizerId !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};