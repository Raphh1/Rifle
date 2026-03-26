import prisma from "../prisma/prismaClient.js";

/**
 * Change le rôle d'un utilisateur (ADMIN only)
 * body: { role: "user" | "organizer" | "admin" }
 */
export const updateUserRole = async (req, res) => {
  try {
    const id = req.params.id; // id est un String (uuid) dans ton schema
    const { role } = req.body;
    
    // Validation basique
    if (!role || !["user", "organizer", "admin"].includes(role)) {
      return res.status(400).json({ error: "Rôle invalide. Valeurs permises: user, organizer, admin" });
    }

    // Mise à jour
    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });

    res.json(user);
  } catch (err) {
    console.error("Erreur updateUserRole:", err);
    // Gestion erreur Prisma (ex: record not found)
    if (err.code === 'P2025') {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    res.status(500).json({ error: "Erreur serveur lors de la mise à jour du rôle" });
  }
};

/**
 * Récupérer tous les utilisateurs (ADMIN only)
 * Utile pour lister qui promouvoir
 */
export const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, email: true, name: true, role: true, createdAt: true }
        });
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

/**
 * Supprime un utilisateur (ADMIN only)
 */
export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;

    await prisma.user.delete({
      where: { id },
    });

    res.json({ message: "Utilisateur supprimé" });
  } catch (err) {
    console.error(err);
    if (err.code === 'P2025') {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    res.status(500).json({ error: "Erreur serveur" });
  }
};
