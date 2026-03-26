import prisma from "../prisma/prismaClient.js";
import {
  ACTIVE_TICKET_STATUSES,
  CANCELLABLE_TICKET_STATUSES,
  SOLD_TICKET_STATUSES,
} from "../constants/ticketStatus.js";

export const getMyTickets = async (req, res) => {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { userId: req.user.id },
      include: {
        event: {
          include: {
            organizer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { purchaseDate: "desc" },
    });

    res.json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const buyTicket = async (req, res) => {
  try {
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({ error: "eventId est requis" });
    }

    const result = await prisma.$transaction(async (tx) => {
      const event = await tx.event.findFirst({
        where: {
          id: eventId,
          deletedAt: null,
        },
        include: {
          _count: {
            select: {
              tickets: {
                where: {
                  status: {
                    in: ACTIVE_TICKET_STATUSES,
                  },
                },
              },
            },
          },
        },
      });

      if (!event) {
        throw new Error("Événement introuvable");
      }

      const activeTickets = event._count.tickets;
      if (activeTickets >= event.capacity) {
        throw new Error("SOLD_OUT");
      }

      const uniqueQrString = `${eventId.slice(0, 4)}-${req.user.id.slice(0, 4)}-${Date.now()
        .toString(36)
        .toUpperCase()}`;

      const ticket = await tx.ticket.create({
        data: {
          userId: req.user.id,
          eventId,
          status: "paid",
          purchaseDate: new Date(),
          qrCode: uniqueQrString,
        },
        include: {
          event: true,
        },
      });

      return { ticket, eventTitle: event.title };
    });

    res.status(201).json({
      message: `Billet acheté avec succès pour ${result.eventTitle}`,
      ticket: result.ticket,
    });
  } catch (err) {
    console.error(err);
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

    if (!qrCode) {
      return res.status(400).json({ error: "QR Code manquant" });
    }

    const ticket = await prisma.ticket.findFirst({
      where: { qrCode },
      include: {
        event: true,
      },
    });

    if (!ticket || !ticket.event || ticket.event.deletedAt) {
      return res.status(404).json({ error: "Ticket invalide ou introuvable" });
    }

    if (ticket.event.organizerId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Vous n'êtes pas autorisé à valider ce ticket" });
    }

    if (ticket.status === "cancelled") {
      return res.status(400).json({ error: "Ce ticket a été annulé", ticket });
    }

    if (ticket.status === "used" || ticket.validatedAt) {
      return res.status(400).json({ error: "Ce ticket a déjà été validé", ticket });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: "used",
        validatedAt: new Date(),
      },
      include: {
        event: {
          include: {
            organizer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        user: true,
      },
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

    if (!email) {
      return res.status(400).json({ error: "Email du destinataire requis" });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: { event: true, user: true },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket introuvable" });
    }

    if (ticket.userId !== req.user.id) {
      return res.status(403).json({ error: "Ce ticket ne vous appartient pas" });
    }

    if (ticket.status === "used" || ticket.validatedAt) {
      return res.status(400).json({ error: "Impossible de transférer un ticket déjà utilisé" });
    }

    if (ticket.status === "cancelled") {
      return res.status(400).json({ error: "Impossible de transférer un ticket annulé" });
    }

    const recipient = await prisma.user.findUnique({
      where: { email },
    });

    if (!recipient) {
      return res.status(404).json({ error: "Utilisateur destinataire introuvable" });
    }

    if (recipient.id === req.user.id) {
      return res.status(400).json({ error: "Vous possédez déjà ce ticket" });
    }

    const transferredTicket = await prisma.ticket.update({
      where: { id },
      data: {
        userId: recipient.id,
      },
      include: {
        event: true,
        user: true,
      },
    });

    res.json({
      message: `Ticket transféré avec succès à ${recipient.name}`,
      ticket: transferredTicket,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const cancelTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        event: true,
        user: true,
      },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket introuvable" });
    }

    if (ticket.userId !== req.user.id) {
      return res.status(403).json({ error: "Ce ticket ne vous appartient pas" });
    }

    if (ticket.status === "used") {
      return res.status(400).json({ error: "Impossible d'annuler un ticket déjà utilisé" });
    }

    if (ticket.status === "cancelled") {
      return res.status(400).json({ error: "Ce ticket est déjà annulé" });
    }

    if (!CANCELLABLE_TICKET_STATUSES.includes(ticket.status)) {
      return res.status(400).json({ error: "Ce ticket ne peut pas être annulé" });
    }

    const cancelledTicket = await prisma.ticket.update({
      where: { id },
      data: {
        status: "cancelled",
      },
      include: {
        event: true,
        user: true,
      },
    });

    res.json({
      message: "Billet annulé et remboursé avec succès",
      ticket: cancelledTicket,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        event: {
          include: {
            organizer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        user: true,
      },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket introuvable" });
    }

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

export const getTicketStatsForAdmin = async () =>
  prisma.ticket.findMany({
    where: {
      status: {
        in: SOLD_TICKET_STATUSES,
      },
    },
    select: {
      event: { select: { price: true } },
    },
  });
