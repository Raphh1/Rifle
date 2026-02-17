import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
    console.log('🌱 Début du seeding...');
    // LOG DE DEBUG : On vérifie si la connexion se fait
    try {
        await prisma.$connect();
        console.log('✅ Connecté à la base de données');
    }
    catch (e) {
        console.error('❌ Echec connexion BDD:', e);
        process.exit(1);
    }
    // 1. Nettoyer la base de données (optionnel, attention en prod)
    // On décommente le nettoyage pour être sûr de repartir de zéro si besoin
    console.log('🧹 Nettoyage des anciennes données...');
    await prisma.ticket.deleteMany();
    await prisma.event.deleteMany();
    await prisma.user.deleteMany();
    // 2. Création des mots de passe hachés
    const hashedPassword = await bcrypt.hash('password123', 10);
    // 3. Création des Utilisateurs
    console.log('👤 Création des utilisateurs...');
    const admin = await prisma.user.create({
        data: {
            email: 'admin@rifle.com',
            password: hashedPassword,
            name: 'Admin Rifle',
            role: 'admin',
        },
    });
    const organizer = await prisma.user.create({
        data: {
            email: 'organizer@rifle.com',
            password: hashedPassword,
            name: 'Max l\'Organisateur',
            role: 'organizer',
        },
    });
    const user = await prisma.user.create({
        data: {
            email: 'user@rifle.com',
            password: hashedPassword,
            name: 'Jean Dupont',
            role: 'user',
        },
    });
    console.log('✅ Utilisateurs créés :', { admin: admin.id, organizer: organizer.id, user: user.id });
    // 4. Création des Événements
    console.log('📅 Création des événements...');
    const concert = await prisma.event.create({
        data: {
            title: 'Concert Rock : The Rolling Stones',
            description: 'Le groupe légendaire revient pour une nuit inoubliable à Paris.',
            date: new Date('2026-06-15T20:00:00Z'),
            location: 'Stade de France, Paris',
            price: 89.99,
            capacity: 5000, // Attention, le nom du champ dans le schema est 'capacity', pas 'totalTickets'
            imageUrl: 'https://images.unsplash.com/photo-1459749411177-229252974c61?auto=format&fit=crop&q=80&w=1000',
            organizerId: organizer.id,
        },
    });
    const conference = await prisma.event.create({
        data: {
            title: 'Tech Summit 2026',
            description: 'Conférence sur l\'avenir de l\'IA et du développement web.',
            date: new Date('2026-09-10T09:00:00Z'),
            location: 'Palais des Congrès, Lyon',
            price: 150.00,
            capacity: 200,
            imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000',
            organizerId: organizer.id,
        },
    });
    const festival = await prisma.event.create({
        data: {
            title: 'Festival Electro Beach',
            description: '3 jours de musique électronique sur la plage.',
            date: new Date('2026-07-20T14:00:00Z'),
            location: 'Marseille',
            price: 45.00,
            capacity: 3000,
            imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1000',
            organizerId: organizer.id,
        },
    });
    console.log('✅ Événements créés :', { concert: concert.id });
    // 5. Création de quelques billets (Tickets)
    console.log('🎟️ Création des billets...');
    await prisma.ticket.create({
        data: {
            userId: user.id,
            eventId: concert.id,
            status: 'paid', // 'paid' au lieu de 'valid' selon votre schema enum TicketStatus
            qrCode: 'mock_qr_code_123',
        },
    });
    console.log('✅ Billets créés');
    console.log('🚀 Seeding terminé avec succès !');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
