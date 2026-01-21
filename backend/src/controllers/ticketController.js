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

    // Récupérer l'événement avec le compte des tickets vendus
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { tickets: true }
        }
      }
    });

    if (!event) return res.status(404).json({ error: "Événement introuvable" });

    // Vérification de la capacité (Sold Out)
    if (event._count.tickets >= event.capacity) {
      return res.status(400).json({ error: "Événement complet (Sold Out)" });
    }

    // Simulation de paiement réussi directement
    // Dans un vrai cas, on créerait une session Stripe ici
    const ticket = await prisma.ticket.create({
      data: {
        userId: req.user.id,
        eventId,
        status: "paid", // On valide directement le paiement
        purchaseDate: new Date(),
        qrCode: `TICKET-${Math.random().toString(36).substr(2, 9).toUpperCase()}` // Génération simple de code
      },
    });

    res.status(201).json({ 
      message: "Ticket acheté avec succès (Simulation)", 
      ticket 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
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

    // Vérification : Seul l'organisateur de l'événement ou un admin peut valider
    if (ticket.event.organizerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Vous n'êtes pas autorisé à valider ce ticket" });
    }

    // Vérifier si déjà utilisé
    if (ticket.status === 'used' || ticket.validatedAt) {
      return res.status(400).json({ error: "Ce ticket a déjà été validé" });
    }

    // Valider le ticket
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: 'used',
        validatedAt: new Date()
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
