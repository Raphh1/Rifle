import prisma from "../prisma/prismaClient.js";

// POST /friends/request/:userId
export const sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user.id) {
      return res.status(400).json({ error: "Impossible de s'ajouter soi-même" });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) return res.status(404).json({ error: "Utilisateur introuvable" });

    // Check if blocked
    const blocked = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: req.user.id, blockedId: userId },
          { blockerId: userId, blockedId: req.user.id },
        ],
      },
    });
    if (blocked) return res.status(403).json({ error: "Action impossible" });

    // Check existing friendship in both directions
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: req.user.id, receiverId: userId },
          { senderId: userId, receiverId: req.user.id },
        ],
      },
    });

    if (existing) {
      if (existing.status === "accepted") {
        return res.status(409).json({ error: "Vous êtes déjà amis" });
      }
      if (existing.status === "pending") {
        return res.status(409).json({ error: "Demande déjà envoyée" });
      }
      // If declined, allow re-sending by updating
      if (existing.status === "declined") {
        const updated = await prisma.friendship.update({
          where: { id: existing.id },
          data: { senderId: req.user.id, receiverId: userId, status: "pending" },
        });

        await prisma.notification.create({
          data: {
            userId,
            type: "friend_request",
            title: "Demande d'ami",
            body: `${req.user.name || "Quelqu'un"} vous a envoyé une demande d'ami`,
            data: { friendshipId: updated.id, senderId: req.user.id },
          },
        });

        return res.status(201).json(updated);
      }
    }

    const friendship = await prisma.friendship.create({
      data: { senderId: req.user.id, receiverId: userId },
    });

    await prisma.notification.create({
      data: {
        userId,
        type: "friend_request",
        title: "Demande d'ami",
        body: `${req.user.name || "Quelqu'un"} vous a envoyé une demande d'ami`,
        data: { friendshipId: friendship.id, senderId: req.user.id },
      },
    });

    res.status(201).json(friendship);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// PUT /friends/request/:friendshipId/accept
export const acceptFriendRequest = async (req, res) => {
  try {
    const { friendshipId } = req.params;

    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });
    if (!friendship) return res.status(404).json({ error: "Demande introuvable" });
    if (friendship.receiverId !== req.user.id) {
      return res.status(403).json({ error: "Action non autorisée" });
    }
    if (friendship.status !== "pending") {
      return res.status(400).json({ error: "Demande déjà traitée" });
    }

    const updated = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: "accepted" },
    });

    await prisma.notification.create({
      data: {
        userId: friendship.senderId,
        type: "friend_accepted",
        title: "Demande acceptée",
        body: `${req.user.name || "Quelqu'un"} a accepté votre demande d'ami`,
        data: { friendshipId: updated.id },
      },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// PUT /friends/request/:friendshipId/decline
export const declineFriendRequest = async (req, res) => {
  try {
    const { friendshipId } = req.params;

    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });
    if (!friendship) return res.status(404).json({ error: "Demande introuvable" });
    if (friendship.receiverId !== req.user.id) {
      return res.status(403).json({ error: "Action non autorisée" });
    }

    const updated = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: "declined" },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// DELETE /friends/:userId
export const removeFriend = async (req, res) => {
  try {
    const { userId } = req.params;

    const friendship = await prisma.friendship.findFirst({
      where: {
        status: "accepted",
        OR: [
          { senderId: req.user.id, receiverId: userId },
          { senderId: userId, receiverId: req.user.id },
        ],
      },
    });

    if (!friendship) return res.status(404).json({ error: "Ami introuvable" });

    await prisma.friendship.delete({ where: { id: friendship.id } });

    res.json({ message: "Ami supprimé" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// GET /friends
export const getFriends = async (req, res) => {
  try {
    const friendships = await prisma.friendship.findMany({
      where: {
        status: "accepted",
        OR: [{ senderId: req.user.id }, { receiverId: req.user.id }],
      },
      include: {
        sender: { select: { id: true, name: true, email: true, avatar: true } },
        receiver: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    const friends = friendships.map((f) =>
      f.senderId === req.user.id ? f.receiver : f.sender,
    );

    res.json(friends);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// GET /friends/requests
export const getPendingRequests = async (req, res) => {
  try {
    const requests = await prisma.friendship.findMany({
      where: { receiverId: req.user.id, status: "pending" },
      include: {
        sender: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// GET /friends/:userId/events
export const getFriendEvents = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify friendship
    const friendship = await prisma.friendship.findFirst({
      where: {
        status: "accepted",
        OR: [
          { senderId: req.user.id, receiverId: userId },
          { senderId: userId, receiverId: req.user.id },
        ],
      },
    });
    if (!friendship) return res.status(403).json({ error: "Vous n'êtes pas amis" });

    const tickets = await prisma.ticket.findMany({
      where: { userId, status: { in: ["paid", "used"] } },
      include: {
        event: {
          include: {
            organizer: { select: { name: true } },
            _count: { select: { tickets: true } },
          },
        },
      },
      orderBy: { event: { date: "asc" } },
    });

    const events = tickets.map((t) => ({
      ...t.event,
      remaining: t.event.capacity - t.event._count.tickets,
    }));

    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// GET /users/search?q=...
export const searchUsers = async (req, res) => {
  try {
    const q = req.query.q || "";
    if (q.length < 2) return res.json([]);

    const users = await prisma.user.findMany({
      where: {
        id: { not: req.user.id },
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, email: true, avatar: true },
      take: 20,
    });

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
