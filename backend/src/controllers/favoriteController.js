import prisma from "../prisma/prismaClient.js";

// POST /events/:eventId/favorite
export const addFavorite = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ error: "Événement introuvable" });

    const existing = await prisma.favorite.findUnique({
      where: { userId_eventId: { userId: req.user.id, eventId } },
    });
    if (existing) return res.status(409).json({ error: "Déjà en favoris" });

    const favorite = await prisma.favorite.create({
      data: { userId: req.user.id, eventId },
    });

    res.status(201).json(favorite);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// DELETE /events/:eventId/favorite
export const removeFavorite = async (req, res) => {
  try {
    const { eventId } = req.params;

    const existing = await prisma.favorite.findUnique({
      where: { userId_eventId: { userId: req.user.id, eventId } },
    });
    if (!existing) return res.status(404).json({ error: "Favori introuvable" });

    await prisma.favorite.delete({
      where: { userId_eventId: { userId: req.user.id, eventId } },
    });

    res.json({ message: "Favori retiré" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// GET /users/me/favorites
export const getMyFavorites = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [favorites, total] = await prisma.$transaction([
      prisma.favorite.findMany({
        where: { userId: req.user.id },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          event: {
            include: {
              organizer: { select: { name: true, email: true } },
              _count: { select: { tickets: true, favorites: true } },
            },
          },
        },
      }),
      prisma.favorite.count({ where: { userId: req.user.id } }),
    ]);

    const data = favorites.map((f) => ({
      ...f.event,
      remaining: f.event.capacity - f.event._count.tickets,
      favoritesCount: f.event._count.favorites,
      favoritedAt: f.createdAt,
    }));

    res.json({
      data,
      meta: { total, page, last_page: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// GET /events/:eventId/favorites/friends
export const getFriendsFavorites = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Get accepted friends
    const friendships = await prisma.friendship.findMany({
      where: {
        status: "accepted",
        OR: [{ senderId: req.user.id }, { receiverId: req.user.id }],
      },
    });

    const friendIds = friendships.map((f) =>
      f.senderId === req.user.id ? f.receiverId : f.senderId,
    );

    const friendFavorites = await prisma.favorite.findMany({
      where: { eventId, userId: { in: friendIds } },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    res.json(friendFavorites.map((f) => f.user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// GET /events/:eventId/favorite/status
export const getFavoriteStatus = async (req, res) => {
  try {
    const { eventId } = req.params;
    const existing = await prisma.favorite.findUnique({
      where: { userId_eventId: { userId: req.user.id, eventId } },
    });
    res.json({ isFavorited: !!existing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
