import prisma from "../prisma/prismaClient.js";

// POST /reports
export const createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason, details } = req.body;

    if (!targetType || !targetId || !reason) {
      return res.status(400).json({ error: "targetType, targetId et reason requis" });
    }

    if (!["message", "user", "review"].includes(targetType)) {
      return res.status(400).json({ error: "targetType invalide" });
    }

    if (!["spam", "harassment", "inappropriate", "other"].includes(reason)) {
      return res.status(400).json({ error: "Raison invalide" });
    }

    const report = await prisma.report.create({
      data: {
        reporterId: req.user.id,
        targetType,
        targetId,
        reason,
        details,
      },
    });

    // Auto-hide message if 3+ reports
    if (targetType === "message") {
      const reportCount = await prisma.report.count({
        where: { targetType: "message", targetId, resolved: false },
      });
      if (reportCount >= 3) {
        await prisma.message.update({
          where: { id: targetId },
          data: { deletedAt: new Date() },
        });
      }
    }

    res.status(201).json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// POST /blocks/:userId
export const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user.id) {
      return res.status(400).json({ error: "Impossible de se bloquer soi-même" });
    }

    const existing = await prisma.block.findUnique({
      where: { blockerId_blockedId: { blockerId: req.user.id, blockedId: userId } },
    });
    if (existing) return res.status(409).json({ error: "Utilisateur déjà bloqué" });

    const block = await prisma.block.create({
      data: { blockerId: req.user.id, blockedId: userId },
    });

    // Also remove friendship if exists
    await prisma.friendship.deleteMany({
      where: {
        OR: [
          { senderId: req.user.id, receiverId: userId },
          { senderId: userId, receiverId: req.user.id },
        ],
      },
    });

    res.status(201).json(block);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// DELETE /blocks/:userId
export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const existing = await prisma.block.findUnique({
      where: { blockerId_blockedId: { blockerId: req.user.id, blockedId: userId } },
    });
    if (!existing) return res.status(404).json({ error: "Blocage introuvable" });

    await prisma.block.delete({
      where: { blockerId_blockedId: { blockerId: req.user.id, blockedId: userId } },
    });

    res.json({ message: "Utilisateur débloqué" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// GET /admin/reports
export const getReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const resolved = req.query.resolved === "true";
    const skip = (page - 1) * limit;

    const where = { resolved };

    const [reports, total] = await prisma.$transaction([
      prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          reporter: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.report.count({ where }),
    ]);

    res.json({
      data: reports,
      meta: { total, page, last_page: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// PUT /admin/reports/:id/resolve
export const resolveReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) return res.status(404).json({ error: "Signalement introuvable" });

    await prisma.report.update({
      where: { id },
      data: { resolved: true },
    });

    res.json({ message: "Signalement résolu" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
