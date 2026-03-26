import prisma from "../prisma/prismaClient.js";

// POST /events/:eventId/rooms
export const createRoom = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { name, visibility } = req.body;

    if (!name) return res.status(400).json({ error: "Nom de la room requis" });

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ error: "Événement introuvable" });

    const room = await prisma.room.create({
      data: {
        name,
        eventId,
        creatorId: req.user.id,
        visibility: visibility || "public",
      },
    });

    // Auto-join creator as admin
    await prisma.roomMember.create({
      data: { roomId: room.id, userId: req.user.id, role: "admin" },
    });

    res.status(201).json(room);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// GET /events/:eventId/rooms
export const getEventRooms = async (req, res) => {
  try {
    const { eventId } = req.params;

    const rooms = await prisma.room.findMany({
      where: {
        eventId,
        OR: [
          { visibility: "public" },
          { members: { some: { userId: req.user?.id } } },
          { creatorId: req.user?.id },
        ],
      },
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
        _count: { select: { members: true, messages: true } },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { content: true, createdAt: true, sender: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = rooms.map((room) => ({
      ...room,
      membersCount: room._count.members,
      messagesCount: room._count.messages,
      lastMessage: room.messages[0] || null,
      messages: undefined,
      _count: undefined,
    }));

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// GET /rooms/:roomId
export const getRoomDetail = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
        event: { select: { id: true, title: true, organizerId: true } },
        members: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
        _count: { select: { messages: true } },
      },
    });

    if (!room) return res.status(404).json({ error: "Room introuvable" });

    // Check access for private rooms
    if (room.visibility === "private") {
      const isMember = room.members.some((m) => m.userId === req.user.id);
      const isOrganizer = room.event.organizerId === req.user.id;
      const isAdmin = req.user.role === "admin";
      if (!isMember && !isOrganizer && !isAdmin) {
        return res.status(403).json({ error: "Accès refusé" });
      }
    }

    res.json(room);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// POST /rooms/:roomId/join
export const joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) return res.status(404).json({ error: "Room introuvable" });
    if (room.visibility === "private") {
      return res.status(403).json({ error: "Cette room est privée" });
    }

    const existing = await prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId: req.user.id } },
    });
    if (existing) return res.status(409).json({ error: "Déjà membre" });

    const member = await prisma.roomMember.create({
      data: { roomId, userId: req.user.id },
    });

    res.status(201).json(member);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// POST /rooms/join/:inviteCode
export const joinRoomByCode = async (req, res) => {
  try {
    const { inviteCode } = req.params;

    const room = await prisma.room.findUnique({ where: { inviteCode } });
    if (!room) return res.status(404).json({ error: "Code d'invitation invalide" });

    const existing = await prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId: room.id, userId: req.user.id } },
    });
    if (existing) return res.status(409).json({ error: "Déjà membre" });

    const member = await prisma.roomMember.create({
      data: { roomId: room.id, userId: req.user.id },
    });

    res.status(201).json({ room, member });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// POST /rooms/:roomId/invite
export const inviteToRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userIds } = req.body; // array of user IDs

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: "Liste d'utilisateurs requise" });
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { members: true },
    });
    if (!room) return res.status(404).json({ error: "Room introuvable" });

    // Check inviter is member
    const isMember = room.members.some((m) => m.userId === req.user.id);
    if (!isMember) return res.status(403).json({ error: "Vous n'êtes pas membre" });

    const existingMemberIds = room.members.map((m) => m.userId);
    const newUserIds = userIds.filter((id) => !existingMemberIds.includes(id));

    if (newUserIds.length === 0) {
      return res.status(409).json({ error: "Tous les utilisateurs sont déjà membres" });
    }

    await prisma.roomMember.createMany({
      data: newUserIds.map((userId) => ({ roomId, userId })),
    });

    // Notify invited users
    await prisma.notification.createMany({
      data: newUserIds.map((userId) => ({
        userId,
        type: "room_invite",
        title: "Invitation à une room",
        body: `${req.user.name || "Quelqu'un"} vous a invité dans "${room.name}"`,
        data: { roomId, eventId: room.eventId },
      })),
    });

    res.json({ message: `${newUserIds.length} utilisateur(s) invité(s)` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// DELETE /rooms/:roomId/leave
export const leaveRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const member = await prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId: req.user.id } },
    });
    if (!member) return res.status(404).json({ error: "Vous n'êtes pas membre" });

    await prisma.roomMember.delete({
      where: { roomId_userId: { roomId, userId: req.user.id } },
    });

    res.json({ message: "Vous avez quitté la room" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// DELETE /rooms/:roomId
export const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { event: { select: { organizerId: true } } },
    });
    if (!room) return res.status(404).json({ error: "Room introuvable" });

    const isCreator = room.creatorId === req.user.id;
    const isOrganizer = room.event.organizerId === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isCreator && !isOrganizer && !isAdmin) {
      return res.status(403).json({ error: "Action non autorisée" });
    }

    await prisma.room.delete({ where: { id: roomId } });

    res.json({ message: "Room supprimée" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// DELETE /rooms/:roomId/members/:userId
export const kickMember = async (req, res) => {
  try {
    const { roomId, userId } = req.params;

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { event: { select: { organizerId: true } } },
    });
    if (!room) return res.status(404).json({ error: "Room introuvable" });

    // Check permission
    const requesterMember = await prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId: req.user.id } },
    });
    const isRoomAdmin = requesterMember?.role === "admin" || requesterMember?.role === "moderator";
    const isOrganizer = room.event.organizerId === req.user.id;
    const isAppAdmin = req.user.role === "admin";
    if (!isRoomAdmin && !isOrganizer && !isAppAdmin) {
      return res.status(403).json({ error: "Action non autorisée" });
    }

    const member = await prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });
    if (!member) return res.status(404).json({ error: "Membre introuvable" });

    await prisma.roomMember.delete({
      where: { roomId_userId: { roomId, userId } },
    });

    res.json({ message: "Membre exclu" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// GET /rooms/me
export const getMyRooms = async (req, res) => {
  try {
    const memberships = await prisma.roomMember.findMany({
      where: { userId: req.user.id },
      include: {
        room: {
          include: {
            event: { select: { id: true, title: true } },
            creator: { select: { id: true, name: true, avatar: true } },
            _count: { select: { members: true, messages: true } },
            messages: {
              take: 1,
              orderBy: { createdAt: "desc" },
              select: { content: true, createdAt: true, sender: { select: { name: true } } },
            },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });

    const data = memberships.map((m) => ({
      ...m.room,
      myRole: m.role,
      membersCount: m.room._count.members,
      messagesCount: m.room._count.messages,
      lastMessage: m.room.messages[0] || null,
      messages: undefined,
      _count: undefined,
    }));

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
