import prisma from "../prisma/prismaClient.js";

export const getAllEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const category = req.query.category || "";
    const dateFrom = req.query.dateFrom || "";
    const dateTo = req.query.dateTo || "";
    const priceMin = req.query.priceMin ? parseFloat(req.query.priceMin) : null;
    const priceMax = req.query.priceMax ? parseFloat(req.query.priceMax) : null;

    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category) {
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
        orderBy: { date: 'asc' },
        include: { 
          organizer: { select: { name: true, email: true } },
          _count: { select: { tickets: true } }
        },
      }),
      prisma.event.count({ where })
    ]);

    const eventsWithRemaining = events.map(event => ({
      ...event,
      remaining: event.capacity - event._count.tickets
    }));

    res.json({
      data: eventsWithRemaining,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: { 
        organizer: true, 
        tickets: true,
        _count: {
          select: { tickets: true }
        }
      },
    });
    
    if (!event) return res.status(404).json({ error: "Événement introuvable" });

    // Calculer les places restantes
    const eventWithRemaining = {
      ...event,
      remaining: event.capacity - event._count.tickets
    };

    res.json(eventWithRemaining);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const getCategories = async (_req, res) => {
  const categories = [
    { value: 'concert', label: 'Concert' },
    { value: 'conference', label: 'Conférence' },
    { value: 'festival', label: 'Festival' },
    { value: 'sport', label: 'Sport' },
    { value: 'theatre', label: 'Théâtre' },
    { value: 'exposition', label: 'Exposition' },
    { value: 'autre', label: 'Autre' },
  ];
  res.json(categories);
};

export const createEvent = async (req, res) => {
  try {
    const { title, description, date, location, price, capacity, category } = req.body;
    let imageUrl = req.body.imageUrl || ""; // Fallback

    // Si on a uploadé un fichier, on crée le chemin complet
    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        location,
        price: parseFloat(price),
        capacity: parseInt(capacity),
        category: category || 'autre',
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
    const { title, description, date, location, price, capacity, category, imageUrl } = req.body;

    // Vérification des droits : Organisateur de l'événement ou Admin
    const existingEvent = await prisma.event.findUnique({ where: { id } });
    if (!existingEvent) return res.status(404).json({ error: "Événement introuvable" });

    if (existingEvent.organizerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Action non autorisée" });
    }

    const event = await prisma.event.update({
      where: { id },
      data: { title, description, date, location, price, capacity, category, imageUrl },
    });

    res.json(event);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérification des droits : Organisateur de l'événement ou Admin
    const existingEvent = await prisma.event.findUnique({ where: { id } });
    if (!existingEvent) return res.status(404).json({ error: "Événement introuvable" });

    if (existingEvent.organizerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Action non autorisée" });
    }

    await prisma.event.delete({ where: { id } });
    res.json({ message: "Événement supprimé" });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};
