import prisma from "../prisma/prismaClient.js";

export const getAllEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: { organizer: { select: { name: true, email: true } } },
    });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: { organizer: true, tickets: true },
    });
    if (!event) return res.status(404).json({ error: "Événement introuvable" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const createEvent = async (req, res) => {
  try {
    const { title, description, date, location, price, capacity, imageUrl } = req.body;

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        location,
        price: parseFloat(price),
        capacity: parseInt(capacity),
        imageUrl,
        organizerId: req.user.id,
      },
    });

    res.status(201).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, location, price, capacity, imageUrl } = req.body;

    const event = await prisma.event.update({
      where: { id },
      data: { title, description, date, location, price, capacity, imageUrl },
    });

    res.json(event);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    await prisma.event.delete({ where: { id: req.params.id } });
    res.json({ message: "Événement supprimé" });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};
