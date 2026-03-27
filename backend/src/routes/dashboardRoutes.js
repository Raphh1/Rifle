import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import prisma from "../prisma/prismaClient.js";
import { SOLD_TICKET_STATUSES } from "../constants/ticketStatus.js";

const router = express.Router();

router.get("/organizer", authenticate, authorize("organizer"), async (req, res) => {
  try {
    const organizerId = req.user.id;

    const events = await prisma.event.findMany({
      where: {
        organizerId,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        capacity: true,
        price: true,
        _count: {
          select: {
            tickets: {
              where: {
                status: { in: SOLD_TICKET_STATUSES },
              },
            },
          },
        },
      },
      orderBy: { date: "desc" },
    });

    const mappedEvents = events.map((event) => {
      const ticketsSold = event._count.tickets;
      const revenues = ticketsSold * event.price;

      return {
        id: event.id,
        title: event.title,
        ticketsSold,
        capacity: event.capacity,
        revenues,
      };
    });

    const eventsCount = mappedEvents.length;
    const ticketsSold = mappedEvents.reduce((sum, event) => sum + event.ticketsSold, 0);
    const revenues = mappedEvents.reduce((sum, event) => sum + event.revenues, 0);

    return res.status(200).json({
      eventsCount,
      ticketsSold,
      revenues,
      events: mappedEvents,
    });
  } catch (error) {
    console.error("Organizer dashboard error:", error);
    return res.status(500).json({ error: "Erreur dashboard organizer" });
  }
});

router.get("/admin", authenticate, authorize("admin"), async (_req, res) => {
  try {
    const [users, events, ticketsSold, soldTickets] = await Promise.all([
      prisma.user.count(),
      prisma.event.count({
        where: {
          deletedAt: null,
        },
      }),
      prisma.ticket.count({
        where: { status: { in: SOLD_TICKET_STATUSES } },
      }),
      prisma.ticket.findMany({
        where: { status: { in: SOLD_TICKET_STATUSES } },
        select: {
          event: { select: { price: true } },
        },
      }),
    ]);

    const revenues = soldTickets.reduce((sum, ticket) => sum + (ticket.event?.price ?? 0), 0);

    return res.status(200).json({
      users,
      events,
      ticketsSold,
      revenues,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return res.status(500).json({ error: "Erreur dashboard admin" });
  }
});

export default router;
