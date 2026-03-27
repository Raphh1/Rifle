import prisma from "../prisma/prismaClient.js";
import { CANCELLABLE_TICKET_STATUSES } from "../constants/ticketStatus.js";
import { publicEventInclude, eventWithRemaining } from "../utils/eventPayload.js";

const CATEGORY_OPTIONS = [
  { value: "concert", label: "Concert" },
  { value: "conference", label: "Conférence" },
  { value: "festival", label: "Festival" },
  { value: "sport", label: "Sport" },
  { value: "theatre", label: "Théâtre" },
  { value: "exposition", label: "Exposition" },
  { value: "autre", label: "Autre" },
];

const EVENT_CATEGORIES = new Set(CATEGORY_OPTIONS.map((category) => category.value));

const parseEventPayload = (req) => {
  const { title, description, date, location, price, capacity, category } = req.body;
  let imageUrl = req.body.imageUrl || "";

  if (req.file) {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
  }

  const parsedDate = date ? new Date(date) : null;
  const parsedPrice = price === undefined || price === null || price === "" ? NaN : Number(price);
  const parsedCapacity = capacity === undefined || capacity === null || capacity === "" ? NaN : Number(capacity);

  return {
    title: title?.trim(),
    description: description?.trim(),
    date: parsedDate,
    location: location?.trim(),
    price: parsedPrice,
    capacity: parsedCapacity,
    category: category || "autre",
    imageUrl,
  };
};

const validateEventPayload = (payload) => {
  if (!payload.title || !payload.description || !payload.location || !payload.date) {
    return "Champs manquants";
  }

  if (Number.isNaN(payload.date.getTime())) {
    return "Date invalide";
  }

  if (payload.date <= new Date()) {
    return "La date doit être dans le futur";
  }

  if (!Number.isFinite(payload.price) || payload.price < 0) {
    return "Le prix doit être positif";
  }

  if (!Number.isInteger(payload.capacity) || payload.capacity < 1) {
    return "La capacité doit être au moins 1";
  }

  if (!EVENT_CATEGORIES.has(payload.category)) {
    return "Catégorie invalide";
  }

  return null;
};

export const getAllEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
    const category = req.query.category || "";
    const dateFrom = req.query.dateFrom || "";
    const dateTo = req.query.dateTo || "";
    const priceMin = req.query.priceMin ? parseFloat(req.query.priceMin) : null;
    const priceMax = req.query.priceMax ? parseFloat(req.query.priceMax) : null;

    const skip = (page - 1) * limit;
    const where = { deletedAt: null };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category && EVENT_CATEGORIES.has(category)) {
      where.category = category;
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    if (priceMin !== null || priceMax !== null) {
      where.price = {};
      if (priceMin !== null) where.price.gte = priceMin;
      if (priceMax !== null) where.price.lte = priceMax;
    }

    const [events, total] = await prisma.$transaction([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: "asc" },
        include: publicEventInclude,
      }),
      prisma.event.count({ where }),
    ]);

    res.json({
      data: events.map(eventWithRemaining),
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await prisma.event.findFirst({
      where: {
        id: req.params.id,
        deletedAt: null,
      },
      include: publicEventInclude,
    });

    if (!event) {
      return res.status(404).json({ error: "Événement introuvable" });
    }

    res.json(eventWithRemaining(event));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const getCategories = async (_req, res) => {
  res.json(CATEGORY_OPTIONS);
};

export const createEvent = async (req, res) => {
  try {
    const payload = parseEventPayload(req);
    const validationError = validateEventPayload(payload);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const event = await prisma.event.create({
      data: {
        ...payload,
        organizerId: req.user.id,
      },
      include: publicEventInclude,
    });

    res.status(201).json(eventWithRemaining(event));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const existingEvent = await prisma.event.findUnique({ where: { id } });

    if (!existingEvent || existingEvent.deletedAt) {
      return res.status(404).json({ error: "Événement introuvable" });
    }

    if (existingEvent.organizerId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Action non autorisée" });
    }

    const payload = parseEventPayload(req);
    const validationError = validateEventPayload(payload);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const event = await prisma.event.update({
      where: { id },
      data: payload,
      include: publicEventInclude,
    });

    res.json(eventWithRemaining(event));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const existingEvent = await prisma.event.findUnique({ where: { id } });

    if (!existingEvent || existingEvent.deletedAt) {
      return res.status(404).json({ error: "Événement introuvable" });
    }

    if (existingEvent.organizerId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Action non autorisée" });
    }

    const deletedAt = new Date();

    await prisma.$transaction([
      prisma.ticket.updateMany({
        where: {
          eventId: id,
          status: {
            in: CANCELLABLE_TICKET_STATUSES,
          },
        },
        data: {
          status: "cancelled",
        },
      }),
      prisma.event.update({
        where: { id },
        data: {
          deletedAt,
        },
      }),
    ]);

    const cancelledTickets = await prisma.ticket.count({
      where: {
        eventId: id,
        status: "cancelled",
      },
    });

    res.json({
      message: "Événement supprimé. Les billets actifs ont été annulés et remboursés.",
      cancelledTickets,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
