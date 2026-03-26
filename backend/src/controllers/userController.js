import prisma from "../prisma/prismaClient.js";

export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Minimal validation
    if (!name && !email) {
      return res.status(400).json({ error: "Rien à mettre à jour" });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    res.json(user);
  } catch (err) {
    console.error(err);
    // Prisma unique constraint error
    if (err.code === 'P2002') {
        return res.status(400).json({ error: "Cet email est déjà utilisé" });
    }
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const deleteProfile = async (req, res) => {
  try {
    // Delete the user from the database
    // Thanks to onDelete: Cascade the related tickets/events should be managed,
    // though typically you might want to soft-delete or transfer events.
    await prisma.user.delete({
      where: { id: req.user.id },
    });

    res.json({ message: "Compte supprimé avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la suppression du compte" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};
