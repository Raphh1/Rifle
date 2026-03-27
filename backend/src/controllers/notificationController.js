import prisma from "../prisma/prismaClient.js";

// GET /notifications
export const getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [notifications, total] = await prisma.$transaction([
      prisma.notification.findMany({
        where: { userId: req.user.id },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.count({ where: { userId: req.user.id } }),
    ]);

    res.json({
      data: notifications,
      meta: { total, page, last_page: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// GET /notifications/unread-count
export const getUnreadCount = async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.user.id, read: false },
    });
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// PUT /notifications/:id/read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) return res.status(404).json({ error: "Notification introuvable" });
    if (notification.userId !== req.user.id) {
      return res.status(403).json({ error: "Action non autorisée" });
    }

    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    res.json({ message: "Notification lue" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// PUT /notifications/read-all
export const markAllAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true },
    });

    res.json({ message: "Toutes les notifications marquées comme lues" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
