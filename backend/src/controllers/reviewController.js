import prisma from "../prisma/prismaClient.js";

// POST /events/:eventId/reviews
export const createReview = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "La note doit être entre 1 et 5" });
    }

    // Check event exists and is past
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ error: "Événement introuvable" });
    if (new Date(event.date) > new Date()) {
      return res.status(400).json({ error: "Vous ne pouvez noter qu'un événement passé" });
    }

    // Check user has a validated ticket
    const ticket = await prisma.ticket.findFirst({
      where: { userId: req.user.id, eventId, status: "used" },
    });
    if (!ticket) {
      return res.status(403).json({ error: "Vous devez avoir participé à cet événement" });
    }

    // Check no existing review
    const existing = await prisma.review.findUnique({
      where: { userId_eventId: { userId: req.user.id, eventId } },
    });
    if (existing) {
      return res.status(409).json({ error: "Vous avez déjà laissé un avis" });
    }

    const review = await prisma.review.create({
      data: { userId: req.user.id, eventId, rating: parseInt(rating), comment },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    // Notify organizer
    await prisma.notification.create({
      data: {
        userId: event.organizerId,
        type: "review_received",
        title: "Nouvel avis",
        body: `${req.user.name || "Un utilisateur"} a laissé un avis sur "${event.title}"`,
        data: { eventId, reviewId: review.id },
      },
    });

    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// GET /events/:eventId/reviews
export const getEventReviews = async (req, res) => {
  try {
    const { eventId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || "recent"; // recent, rating_high, rating_low
    const skip = (page - 1) * limit;

    let orderBy;
    switch (sort) {
      case "rating_high":
        orderBy = { rating: "desc" };
        break;
      case "rating_low":
        orderBy = { rating: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const [reviews, total] = await prisma.$transaction([
      prisma.review.findMany({
        where: { eventId },
        skip,
        take: limit,
        orderBy,
        include: { user: { select: { id: true, name: true, avatar: true } } },
      }),
      prisma.review.count({ where: { eventId } }),
    ]);

    res.json({
      data: reviews,
      meta: { total, page, last_page: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// GET /events/:eventId/rating
export const getEventRating = async (req, res) => {
  try {
    const { eventId } = req.params;

    const stats = await prisma.review.aggregate({
      where: { eventId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    // Distribution
    const distribution = await prisma.review.groupBy({
      by: ["rating"],
      where: { eventId },
      _count: { rating: true },
    });

    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distribution.forEach((d) => {
      dist[d.rating] = d._count.rating;
    });

    res.json({
      average: stats._avg.rating ? Math.round(stats._avg.rating * 10) / 10 : 0,
      count: stats._count.rating,
      distribution: dist,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// PUT /events/:eventId/reviews
export const updateReview = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { rating, comment } = req.body;

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: "La note doit être entre 1 et 5" });
    }

    const existing = await prisma.review.findUnique({
      where: { userId_eventId: { userId: req.user.id, eventId } },
    });
    if (!existing) return res.status(404).json({ error: "Avis introuvable" });

    const review = await prisma.review.update({
      where: { userId_eventId: { userId: req.user.id, eventId } },
      data: {
        ...(rating && { rating: parseInt(rating) }),
        ...(comment !== undefined && { comment }),
      },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    res.json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// DELETE /events/:eventId/reviews
export const deleteReview = async (req, res) => {
  try {
    const { eventId } = req.params;

    const existing = await prisma.review.findUnique({
      where: { userId_eventId: { userId: req.user.id, eventId } },
    });
    if (!existing) return res.status(404).json({ error: "Avis introuvable" });

    await prisma.review.delete({
      where: { userId_eventId: { userId: req.user.id, eventId } },
    });

    res.json({ message: "Avis supprimé" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
