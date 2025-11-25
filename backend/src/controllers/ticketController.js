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

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ error: "Événement introuvable" });

    const ticket = await prisma.ticket.create({
      data: {
        userId: req.user.id,
        eventId,
        status: "paid",
        purchaseDate: new Date(),
      },
    });

    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};
