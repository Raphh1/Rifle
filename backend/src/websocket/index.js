import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../middleware/auth.js";
import prisma from "../prisma/prismaClient.js";

export function setupWebSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  // Auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Token manquant"));

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error("Token invalide"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;

    // Join personal notification channel
    socket.join(`user:${userId}`);

    // ===== ROOM EVENTS =====

    socket.on("room:join", async (roomId, callback) => {
      try {
        const member = await prisma.roomMember.findUnique({
          where: { roomId_userId: { roomId, userId } },
        });
        if (!member) {
          if (typeof callback === "function") callback({ error: "Not a member" });
          return;
        }

        socket.join(`room:${roomId}`);
        socket.to(`room:${roomId}`).emit("room:user_joined", { userId, roomId });

        if (typeof callback === "function") callback({ success: true });

        // Mark all messages as read (non-blocking)
        prisma.roomMember.update({
          where: { roomId_userId: { roomId, userId } },
          data: { lastReadAt: new Date() },
        }).catch((err) => console.error("lastReadAt update error", err));
      } catch (err) {
        console.error("room:join error", err);
        if (typeof callback === "function") callback({ error: "Server error" });
      }
    });

    socket.on("room:leave", (roomId) => {
      socket.leave(`room:${roomId}`);
      socket.to(`room:${roomId}`).emit("room:user_left", { userId, roomId });
    });

    // ===== MESSAGE EVENTS =====

    socket.on("message:send", async (data) => {
      try {
        const { roomId, content, parentId } = data;
        if (!content || !content.trim()) return;

        const member = await prisma.roomMember.findUnique({
          where: { roomId_userId: { roomId, userId } },
        });
        if (!member) return;

        const message = await prisma.message.create({
          data: {
            roomId,
            senderId: userId,
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

        io.to(`room:${roomId}`).emit("message:new", {
          ...message,
          reactions: [],
        });

        // Notify room members who are not connected to this room
        const members = await prisma.roomMember.findMany({
          where: { roomId, userId: { not: userId } },
          select: { userId: true },
        });

        const room = await prisma.room.findUnique({
          where: { id: roomId },
          select: { name: true, eventId: true },
        });

        for (const m of members) {
          // Send notification via socket
          io.to(`user:${m.userId}`).emit("notification:new", {
            type: "new_message",
            title: room.name,
            body: `${socket.user.name || "Quelqu'un"}: ${content.substring(0, 100)}`,
            data: { roomId, eventId: room.eventId },
          });
        }
      } catch (err) {
        console.error("message:send error", err);
      }
    });

    // ===== REACTION EVENTS =====

    socket.on("message:reaction", async (data) => {
      try {
        const { messageId, emoji } = data;
        if (!messageId || !emoji) return;

        const message = await prisma.message.findUnique({
          where: { id: messageId },
          select: { roomId: true },
        });
        if (!message) return;

        const member = await prisma.roomMember.findUnique({
          where: { roomId_userId: { roomId: message.roomId, userId } },
        });
        if (!member) return;

        const existing = await prisma.reaction.findUnique({
          where: { messageId_userId_emoji: { messageId, userId, emoji } },
        });

        if (existing) {
          await prisma.reaction.delete({ where: { id: existing.id } });
        } else {
          await prisma.reaction.create({
            data: { messageId, userId, emoji },
          });
        }

        // Fetch updated reactions for this message
        const reactions = await prisma.reaction.findMany({
          where: { messageId },
          include: { user: { select: { id: true, name: true } } },
        });

        const reactionMap = {};
        reactions.forEach((r) => {
          if (!reactionMap[r.emoji]) reactionMap[r.emoji] = { emoji: r.emoji, count: 0, users: [] };
          reactionMap[r.emoji].count++;
          reactionMap[r.emoji].users.push(r.user);
        });

        io.to(`room:${message.roomId}`).emit("message:reaction:update", {
          messageId,
          reactions: Object.values(reactionMap),
        });
      } catch (err) {
        console.error("message:reaction error", err);
      }
    });

    // ===== TYPING EVENTS =====

    socket.on("typing:start", (roomId) => {
      socket.to(`room:${roomId}`).emit("typing", { userId, name: socket.user.name });
    });

    socket.on("typing:stop", (roomId) => {
      socket.to(`room:${roomId}`).emit("typing:stop", { userId });
    });

    socket.on("disconnect", () => {
      // Cleanup if needed
    });
  });

  return io;
}
