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
    const [
      users,
      events,
      ticketsSold,
      soldTickets,
      usersByRole,
      ticketsByStatus,
      cancelledTickets,
      topEvents,
    ] = await Promise.all([
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
      prisma.user.groupBy({
        by: ["role"],
        _count: { role: true },
      }),
      prisma.ticket.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      prisma.ticket.count({
        where: { status: "cancelled" },
      }),
      prisma.event.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          title: true,
          capacity: true,
          price: true,
          date: true,
          _count: {
            select: {
              tickets: {
                where: { status: { in: SOLD_TICKET_STATUSES } },
              },
            },
          },
        },
        orderBy: {
          tickets: { _count: "desc" },
        },
        take: 5,
      }),
    ]);

    const revenues = soldTickets.reduce((sum, ticket) => sum + (ticket.event?.price ?? 0), 0);

    const rolesMap = {};
    for (const row of usersByRole) {
      rolesMap[row.role] = row._count.role;
    }

    const statusMap = {};
    for (const row of ticketsByStatus) {
      statusMap[row.status] = row._count.status;
    }

    const mappedTopEvents = topEvents.map((e) => ({
      id: e.id,
      title: e.title,
      capacity: e.capacity,
      ticketsSold: e._count.tickets,
      revenues: e._count.tickets * e.price,
      date: e.date,
    }));

    return res.status(200).json({
      users,
      events,
      ticketsSold,
      revenues,
      cancelledTickets,
      usersByRole: rolesMap,
      ticketsByStatus: statusMap,
      topEvents: mappedTopEvents,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return res.status(500).json({ error: "Erreur dashboard admin" });
  }
});

export default router;
