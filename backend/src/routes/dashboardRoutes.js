import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const router = express.Router();

const SOLD_STATUSES = ["paid", "used"]; // on compte "vendu" si payé ou utilisé

// GET /api/dashboard/organizer
router.get("/organizer", authenticate, authorize("organizer"), async (req, res) => {
  try {
    const organizerId = req.user.id;

    // 1) Récupère les events de l'organisateur + agrégat tickets vendus
    const events = await prisma.event.findMany({
      where: { organizerId },
      select: {
        id: true,
        title: true,
        capacity: true,
        price: true,
        _count: {
          select: {
            tickets: {
              where: { status: { in: SOLD_STATUSES } },
            },
          },
        },
      },
      orderBy: { date: "desc" },
    });

    const mappedEvents = events.map((e) => {
      const ticketsSold = e._count.tickets;
      const revenues = ticketsSold * e.price;

      return {
        id: e.id,
        title: e.title,
        ticketsSold,
        capacity: e.capacity,
        revenues,
      };
    });

    const eventsCount = mappedEvents.length;
    const ticketsSold = mappedEvents.reduce((sum, e) => sum + e.ticketsSold, 0);
    const revenues = mappedEvents.reduce((sum, e) => sum + e.revenues, 0);

    return res.status(200).json({
      eventsCount,
      ticketsSold,
      revenues,
      events: mappedEvents,
    });
  } catch (error) {
    console.error("Organizer dashboard error:", error);
    return res.status(500).json({ success: false, error: "Erreur dashboard organizer" });
  }
});

// GET /api/dashboard/admin
router.get("/admin", authenticate, authorize("admin"), async (req, res) => {
  try {
    const [users, events] = await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
    ]);

    // tickets vendus (paid/used)
    const ticketsSold = await prisma.ticket.count({
      where: { status: { in: SOLD_STATUSES } },
    });

    // revenus = somme(event.price) pour chaque ticket vendu
    // Prisma ne peut pas "sum" sur relation directe facilement sans raw,
    // donc on récupère les tickets vendus avec le prix event (select minimal)
    const soldTickets = await prisma.ticket.findMany({
      where: { status: { in: SOLD_STATUSES } },
      select: {
        event: { select: { price: true } },
      },
    });

    const revenues = soldTickets.reduce((sum, t) => sum + (t.event?.price ?? 0), 0);

    return res.status(200).json({
      users,
      events,
      ticketsSold,
      revenues,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return res.status(500).json({ success: false, error: "Erreur dashboard admin" });
  }
});

export default router;