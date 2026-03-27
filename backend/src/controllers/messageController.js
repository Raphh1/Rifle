import prisma from "../prisma/prismaClient.js";

// GET /rooms/:roomId/messages
export const getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const cursor = req.query.cursor;
    const limit = parseInt(req.query.limit) || 50;

    // Check membership
    const member = await prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId: req.user.id } },
    });
    if (!member) return res.status(403).json({ error: "Vous n'êtes pas membre" });

    // Get blocked users to filter
    const blocks = await prisma.block.findMany({
      where: { blockerId: req.user.id },
      select: { blockedId: true },
    });
    const blockedIds = blocks.map((b) => b.blockedId);

    const where = {
      roomId,
      deletedAt: null,
      senderId: { notIn: blockedIds },
    };

    const messages = await prisma.message.findMany({
      where,
      take: limit,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { createdAt: "desc" },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        parent: {
          select: {
            id: true,
            content: true,
            sender: { select: { id: true, name: true } },
          },
        },
        reactions: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });

    // Group reactions by emoji
    const data = messages.reverse().map((msg) => {
      const reactionMap = {};
      msg.reactions.forEach((r) => {
        if (!reactionMap[r.emoji]) reactionMap[r.emoji] = { emoji: r.emoji, count: 0, users: [] };
        reactionMap[r.emoji].count++;
        reactionMap[r.emoji].users.push(r.user);
      });

      return {
        ...msg,
        reactions: Object.values(reactionMap),
      };
    });

    const nextCursor = messages.length === limit ? messages[0].id : null;

    res.json({ data, nextCursor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// POST /rooms/:roomId/messages (REST fallback)
export const sendMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { content, parentId } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Message vide" });
    }

    // Check membership
    const member = await prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId: req.user.id } },
    });
    if (!member) return res.status(403).json({ error: "Vous n'êtes pas membre" });

    const message = await prisma.message.create({
      data: {
        roomId,
        senderId: req.user.id,
        content: content.trim(),
        parentId: parentId || null,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        parent: {
          select: {
            id: true,
            content: true,
            sender: { select: { id: true, name: true } },
          },
        },
      },
    });

    res.status(201).json({ ...message, reactions: [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// PUT /messages/:messageId
export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    if (!content?.trim()) return res.status(400).json({ error: "Contenu requis" });

    const message = await prisma.message.findUnique({ where: { id: messageId } });
    if (!message) return res.status(404).json({ error: "Message introuvable" });
    if (message.senderId !== req.user.id) return res.status(403).json({ error: "Non autorisé" });
    if (message.deletedAt) return res.status(400).json({ error: "Message supprimé" });

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: { content: content.trim() },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        parent: { select: { id: true, content: true, sender: { select: { id: true, name: true } } } },
        reactions: { include: { user: { select: { id: true, name: true } } } },
      },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// DELETE /messages/:messageId
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        room: {
          include: { event: { select: { organizerId: true } } },
        },
      },
    });
    if (!message) return res.status(404).json({ error: "Message introuvable" });

    // Check permission
    const isOwner = message.senderId === req.user.id;
    const isOrganizer = message.room.event.organizerId === req.user.id;
    const isAppAdmin = req.user.role === "admin";

    const roomMember = await prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId: message.roomId, userId: req.user.id } },
    });
    const isRoomMod = roomMember?.role === "admin" || roomMember?.role === "moderator";

    if (!isOwner && !isOrganizer && !isAppAdmin && !isRoomMod) {
      return res.status(403).json({ error: "Action non autorisée" });
    }

    // Soft delete
    await prisma.message.update({
      where: { id: messageId },
      data: { deletedAt: new Date() },
    });

    res.json({ message: "Message supprimé" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// POST /messages/:messageId/reactions
export const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    if (!emoji) return res.status(400).json({ error: "Emoji requis" });

    const message = await prisma.message.findUnique({ where: { id: messageId } });
    if (!message) return res.status(404).json({ error: "Message introuvable" });

    // Check membership
    const member = await prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId: message.roomId, userId: req.user.id } },
    });
    if (!member) return res.status(403).json({ error: "Vous n'êtes pas membre" });

    const existing = await prisma.reaction.findUnique({
      where: { messageId_userId_emoji: { messageId, userId: req.user.id, emoji } },
    });

    if (existing) {
      // Toggle off
      await prisma.reaction.delete({ where: { id: existing.id } });
      return res.json({ message: "Réaction retirée" });
    }

    const reaction = await prisma.reaction.create({
      data: { messageId, userId: req.user.id, emoji },
    });

    res.status(201).json(reaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
