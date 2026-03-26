import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function qrCode(eventId, userId) {
  return `${eventId.slice(0, 4)}-${userId.slice(0, 4)}-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
}

async function main() {
  console.log('🌱 Début du seeding...');

  try {
    await prisma.$connect();
    console.log('✅ Connecté à la base de données');
  } catch (e) {
    console.error('❌ Echec connexion BDD:', e);
    process.exit(1);
  }

  // ── Nettoyage ──
  console.log('🧹 Nettoyage des anciennes données...');
  await prisma.reaction.deleteMany();
  await prisma.message.deleteMany();
  await prisma.roomMember.deleteMany();
  await prisma.room.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.report.deleteMany();
  await prisma.block.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  // ── Mots de passe ──
  const hashedPassword = await bcrypt.hash('password123', 10);

  // ══════════════════════════════════════════
  // 1. UTILISATEURS (15)
  // ══════════════════════════════════════════
  console.log('👤 Création des utilisateurs...');

  const usersData = [
    { email: 'admin@rifle.com', name: 'Admin Rifle', role: 'admin' },
    { email: 'superadmin@rifle.com', name: 'Super Admin', role: 'admin' },
    { email: 'organizer@rifle.com', name: "Max l'Organisateur", role: 'organizer' },
    { email: 'marie@events.com', name: 'Marie Duval', role: 'organizer' },
    { email: 'lucas@events.com', name: 'Lucas Martin', role: 'organizer' },
    { email: 'sarah@events.com', name: 'Sarah Leclerc', role: 'organizer' },
    { email: 'user@rifle.com', name: 'Jean Dupont', role: 'user' },
    { email: 'alice@mail.com', name: 'Alice Bernard', role: 'user' },
    { email: 'bob@mail.com', name: 'Bob Moreau', role: 'user' },
    { email: 'clara@mail.com', name: 'Clara Petit', role: 'user' },
    { email: 'david@mail.com', name: 'David Garcia', role: 'user' },
    { email: 'emma@mail.com', name: 'Emma Roux', role: 'user' },
    { email: 'fabien@mail.com', name: 'Fabien Leroy', role: 'user' },
    { email: 'gabrielle@mail.com', name: 'Gabrielle Fournier', role: 'user' },
    { email: 'hugo@mail.com', name: 'Hugo Lambert', role: 'user' },
  ];

  const users = [];
  for (const u of usersData) {
    const created = await prisma.user.create({
      data: { ...u, password: hashedPassword },
    });
    users.push(created);
  }

  const [admin, superAdmin, orgMax, orgMarie, orgLucas, orgSarah, jean, alice, bob, clara, david, emma, fabien, gabrielle, hugo] = users;

  console.log(`✅ ${users.length} utilisateurs créés`);

  // ══════════════════════════════════════════
  // 2. ÉVÉNEMENTS (12)
  // ══════════════════════════════════════════
  console.log('📅 Création des événements...');

  const eventsData = [
    {
      title: 'Concert Rock : The Rolling Stones',
      description: 'Le groupe légendaire revient pour une nuit inoubliable à Paris. Un spectacle grandiose avec pyrotechnie et invités surprises.',
      date: new Date('2026-06-15T20:00:00Z'),
      location: 'Stade de France, Paris',
      price: 89.99,
      capacity: 80,
      category: 'concert',
      imageUrl: 'https://images.unsplash.com/photo-1459749411177-229252974c61?auto=format&fit=crop&q=80&w=1000',
      organizerId: orgMax.id,
    },
    {
      title: 'Tech Summit 2026',
      description: "Conférence sur l'avenir de l'IA et du développement web. Keynotes, ateliers pratiques et networking.",
      date: new Date('2026-09-10T09:00:00Z'),
      location: 'Palais des Congrès, Lyon',
      price: 150.0,
      capacity: 50,
      category: 'conference',
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000',
      organizerId: orgMax.id,
    },
    {
      title: 'Festival Electro Beach',
      description: '3 jours de musique électronique sur la plage. DJs internationaux, food trucks et camping.',
      date: new Date('2026-07-20T14:00:00Z'),
      location: 'Plage du Prado, Marseille',
      price: 45.0,
      capacity: 100,
      category: 'festival',
      imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1000',
      organizerId: orgMax.id,
    },
    {
      title: 'Match PSG vs OM - Classique',
      description: "Le choc des titans du football français ! Ambiance garantie au Parc des Princes.",
      date: new Date('2026-05-03T21:00:00Z'),
      location: 'Parc des Princes, Paris',
      price: 75.0,
      capacity: 60,
      category: 'sport',
      imageUrl: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&q=80&w=1000',
      organizerId: orgMarie.id,
    },
    {
      title: 'Le Malade Imaginaire - Molière',
      description: "Redécouvrez le chef-d'œuvre de Molière dans une mise en scène moderne et audacieuse.",
      date: new Date('2026-04-18T19:30:00Z'),
      location: 'Théâtre du Châtelet, Paris',
      price: 35.0,
      capacity: 40,
      category: 'theatre',
      imageUrl: 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&q=80&w=1000',
      organizerId: orgMarie.id,
    },
    {
      title: 'Exposition Banksy - Art Urbain',
      description: "Exposition immersive autour de l'artiste mystère. Plus de 100 œuvres originales.",
      date: new Date('2026-08-01T10:00:00Z'),
      location: 'Grand Palais, Paris',
      price: 22.0,
      capacity: 70,
      category: 'exposition',
      imageUrl: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?auto=format&fit=crop&q=80&w=1000',
      organizerId: orgLucas.id,
    },
    {
      title: 'Jazz Night - Blue Note',
      description: "Une soirée jazz intime avec des artistes du monde entier. Cocktails et ambiance feutrée.",
      date: new Date('2026-05-22T20:30:00Z'),
      location: 'New Morning, Paris',
      price: 30.0,
      capacity: 30,
      category: 'concert',
      imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=1000',
      organizerId: orgLucas.id,
    },
    {
      title: 'Startup Weekend Toulouse',
      description: '54h pour créer une startup. Mentors, pitchs et prix à gagner. Ouvert à tous les profils.',
      date: new Date('2026-10-15T18:00:00Z'),
      location: 'La Cantine, Toulouse',
      price: 20.0,
      capacity: 25,
      category: 'conference',
      imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=1000',
      organizerId: orgSarah.id,
    },
    {
      title: 'Marathon de Bordeaux',
      description: "42 km à travers les vignobles bordelais. Ravitaillement gastronomique garanti.",
      date: new Date('2026-04-05T08:00:00Z'),
      location: 'Place de la Bourse, Bordeaux',
      price: 55.0,
      capacity: 90,
      category: 'sport',
      imageUrl: 'https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?auto=format&fit=crop&q=80&w=1000',
      organizerId: orgSarah.id,
    },
    {
      title: 'Nuit des Musées 2026',
      description: "Accès gratuit à tous les musées de la ville. Animations nocturnes et visites guidées.",
      date: new Date('2026-05-16T18:00:00Z'),
      location: 'Musée des Beaux-Arts, Lille',
      price: 0,
      capacity: 120,
      category: 'exposition',
      imageUrl: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?auto=format&fit=crop&q=80&w=1000',
      organizerId: orgLucas.id,
    },
    {
      title: 'Festival du Film Court - Clermont',
      description: "Le plus grand festival de courts métrages au monde. 5 jours de projections et rencontres.",
      date: new Date('2026-11-02T10:00:00Z'),
      location: 'Maison de la Culture, Clermont-Ferrand',
      price: 12.0,
      capacity: 45,
      category: 'festival',
      imageUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=1000',
      organizerId: orgMarie.id,
    },
    {
      title: 'Atelier Cuisine Japonaise',
      description: "Apprenez à préparer sushis, ramen et gyozas avec un chef étoilé. Dégustation incluse.",
      date: new Date('2026-06-08T11:00:00Z'),
      location: 'Atelier des Sens, Paris',
      price: 65.0,
      capacity: 15,
      category: 'autre',
      imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1000',
      organizerId: orgSarah.id,
    },
  ];

  const events = [];
  for (const e of eventsData) {
    const created = await prisma.event.create({ data: e });
    events.push(created);
  }

  const [concert, techSummit, electroBeach, psgOm, moliere, banksy, jazzNight, startupWeekend, marathon, nuitMusees, filmCourt, cuisine] = events;

  console.log(`✅ ${events.length} événements créés`);

  // ══════════════════════════════════════════
  // 3. BILLETS (~60 avec statuts variés)
  // ══════════════════════════════════════════
  console.log('🎟️  Création des billets...');

  const regularUsers = [jean, alice, bob, clara, david, emma, fabien, gabrielle, hugo];

  const ticketsToCreate = [
    // Concert Rock — très populaire, quasi complet
    ...regularUsers.map((u) => ({ userId: u.id, eventId: concert.id, status: 'paid' })),
    { userId: jean.id, eventId: concert.id, status: 'cancelled' },
    { userId: alice.id, eventId: concert.id, status: 'used', validatedAt: new Date('2026-06-15T20:30:00Z') },

    // Tech Summit — remplissage moyen
    { userId: jean.id, eventId: techSummit.id, status: 'paid' },
    { userId: alice.id, eventId: techSummit.id, status: 'paid' },
    { userId: bob.id, eventId: techSummit.id, status: 'paid' },
    { userId: clara.id, eventId: techSummit.id, status: 'used', validatedAt: new Date('2026-09-10T09:30:00Z') },
    { userId: david.id, eventId: techSummit.id, status: 'cancelled' },

    // Electro Beach — très populaire
    ...regularUsers.map((u) => ({ userId: u.id, eventId: electroBeach.id, status: 'paid' })),
    { userId: fabien.id, eventId: electroBeach.id, status: 'cancelled' },

    // PSG vs OM — populaire
    { userId: jean.id, eventId: psgOm.id, status: 'paid' },
    { userId: bob.id, eventId: psgOm.id, status: 'paid' },
    { userId: david.id, eventId: psgOm.id, status: 'paid' },
    { userId: hugo.id, eventId: psgOm.id, status: 'paid' },
    { userId: fabien.id, eventId: psgOm.id, status: 'paid' },
    { userId: emma.id, eventId: psgOm.id, status: 'cancelled' },

    // Molière — modeste
    { userId: alice.id, eventId: moliere.id, status: 'paid' },
    { userId: clara.id, eventId: moliere.id, status: 'paid' },
    { userId: gabrielle.id, eventId: moliere.id, status: 'paid' },

    // Banksy — bonne affluence
    { userId: jean.id, eventId: banksy.id, status: 'paid' },
    { userId: alice.id, eventId: banksy.id, status: 'paid' },
    { userId: bob.id, eventId: banksy.id, status: 'paid' },
    { userId: clara.id, eventId: banksy.id, status: 'paid' },
    { userId: emma.id, eventId: banksy.id, status: 'paid' },
    { userId: hugo.id, eventId: banksy.id, status: 'used', validatedAt: new Date('2026-08-01T11:00:00Z') },
    { userId: gabrielle.id, eventId: banksy.id, status: 'cancelled' },

    // Jazz Night — intime, quasi complet
    { userId: alice.id, eventId: jazzNight.id, status: 'paid' },
    { userId: clara.id, eventId: jazzNight.id, status: 'paid' },
    { userId: emma.id, eventId: jazzNight.id, status: 'paid' },
    { userId: gabrielle.id, eventId: jazzNight.id, status: 'used', validatedAt: new Date('2026-05-22T21:00:00Z') },

    // Startup Weekend
    { userId: jean.id, eventId: startupWeekend.id, status: 'paid' },
    { userId: bob.id, eventId: startupWeekend.id, status: 'paid' },
    { userId: david.id, eventId: startupWeekend.id, status: 'pending' },

    // Marathon — bon remplissage
    { userId: bob.id, eventId: marathon.id, status: 'paid' },
    { userId: david.id, eventId: marathon.id, status: 'paid' },
    { userId: fabien.id, eventId: marathon.id, status: 'paid' },
    { userId: hugo.id, eventId: marathon.id, status: 'paid' },
    { userId: jean.id, eventId: marathon.id, status: 'cancelled' },

    // Nuit des Musées — gratuit, populaire
    ...regularUsers.map((u) => ({ userId: u.id, eventId: nuitMusees.id, status: 'paid' })),

    // Film Court
    { userId: alice.id, eventId: filmCourt.id, status: 'paid' },
    { userId: emma.id, eventId: filmCourt.id, status: 'paid' },
    { userId: gabrielle.id, eventId: filmCourt.id, status: 'pending' },

    // Cuisine japonaise — petit atelier
    { userId: clara.id, eventId: cuisine.id, status: 'paid' },
    { userId: alice.id, eventId: cuisine.id, status: 'paid' },
    { userId: emma.id, eventId: cuisine.id, status: 'paid' },
  ];

  let ticketCount = 0;
  for (const t of ticketsToCreate) {
    await prisma.ticket.create({
      data: {
        userId: t.userId,
        eventId: t.eventId,
        status: t.status,
        qrCode: qrCode(t.eventId, t.userId),
        purchaseDate: randomDate(new Date('2026-01-01'), new Date('2026-03-25')),
        validatedAt: t.validatedAt ?? null,
      },
    });
    ticketCount++;
  }

  console.log(`✅ ${ticketCount} billets créés`);

  // ══════════════════════════════════════════
  // 4. AVIS (Reviews)
  // ══════════════════════════════════════════
  console.log('⭐ Création des avis...');

  const reviewsData = [
    { userId: jean.id, eventId: concert.id, rating: 5, comment: 'Absolument incroyable ! Meilleur concert de ma vie.' },
    { userId: alice.id, eventId: concert.id, rating: 4, comment: 'Super ambiance, juste un peu long.' },
    { userId: bob.id, eventId: electroBeach.id, rating: 5, comment: 'La plage + la musique = combo parfait.' },
    { userId: clara.id, eventId: moliere.id, rating: 4, comment: 'Mise en scène originale, très bien joué.' },
    { userId: david.id, eventId: psgOm.id, rating: 3, comment: 'Match nul, ambiance correcte.' },
    { userId: emma.id, eventId: banksy.id, rating: 5, comment: "L'exposition la plus marquante que j'ai vue." },
    { userId: hugo.id, eventId: banksy.id, rating: 4, comment: 'Très belles œuvres, un peu bondé.' },
    { userId: gabrielle.id, eventId: jazzNight.id, rating: 5, comment: 'Soirée magique dans un cadre intimiste.' },
    { userId: fabien.id, eventId: marathon.id, rating: 4, comment: 'Parcours magnifique à travers les vignes.' },
    { userId: alice.id, eventId: nuitMusees.id, rating: 5, comment: 'Gratuit et passionnant, à refaire chaque année !' },
  ];

  for (const r of reviewsData) {
    await prisma.review.create({ data: r });
  }

  console.log(`✅ ${reviewsData.length} avis créés`);

  // ══════════════════════════════════════════
  // 5. FAVORIS
  // ══════════════════════════════════════════
  console.log('❤️  Création des favoris...');

  const favoritesData = [
    { userId: jean.id, eventId: concert.id },
    { userId: jean.id, eventId: electroBeach.id },
    { userId: alice.id, eventId: banksy.id },
    { userId: alice.id, eventId: jazzNight.id },
    { userId: alice.id, eventId: cuisine.id },
    { userId: bob.id, eventId: psgOm.id },
    { userId: bob.id, eventId: marathon.id },
    { userId: clara.id, eventId: moliere.id },
    { userId: emma.id, eventId: banksy.id },
    { userId: emma.id, eventId: nuitMusees.id },
    { userId: hugo.id, eventId: concert.id },
    { userId: gabrielle.id, eventId: filmCourt.id },
  ];

  for (const f of favoritesData) {
    await prisma.favorite.create({ data: f });
  }

  console.log(`✅ ${favoritesData.length} favoris créés`);

  // ══════════════════════════════════════════
  // 6. AMITIÉS
  // ══════════════════════════════════════════
  console.log('🤝 Création des amitiés...');

  const friendshipsData = [
    { senderId: jean.id, receiverId: alice.id, status: 'accepted' },
    { senderId: jean.id, receiverId: bob.id, status: 'accepted' },
    { senderId: alice.id, receiverId: clara.id, status: 'accepted' },
    { senderId: bob.id, receiverId: david.id, status: 'accepted' },
    { senderId: emma.id, receiverId: gabrielle.id, status: 'accepted' },
    { senderId: hugo.id, receiverId: jean.id, status: 'pending' },
    { senderId: fabien.id, receiverId: alice.id, status: 'pending' },
    { senderId: david.id, receiverId: emma.id, status: 'declined' },
  ];

  for (const f of friendshipsData) {
    await prisma.friendship.create({ data: f });
  }

  console.log(`✅ ${friendshipsData.length} amitiés créées`);

  // ══════════════════════════════════════════
  // 7. ROOMS & MESSAGES
  // ══════════════════════════════════════════
  console.log('💬 Création des salons et messages...');

  const concertRoom = await prisma.room.create({
    data: {
      name: 'Fans Rolling Stones',
      eventId: concert.id,
      creatorId: jean.id,
      visibility: 'public',
    },
  });

  const electroRoom = await prisma.room.create({
    data: {
      name: 'Electro Beach Crew',
      eventId: electroBeach.id,
      creatorId: bob.id,
      visibility: 'public',
    },
  });

  const privateRoom = await prisma.room.create({
    data: {
      name: 'Organisateurs VIP',
      eventId: techSummit.id,
      creatorId: orgMax.id,
      visibility: 'private',
    },
  });

  // Membres
  const roomMembers = [
    { roomId: concertRoom.id, userId: jean.id, role: 'admin' },
    { roomId: concertRoom.id, userId: alice.id, role: 'member' },
    { roomId: concertRoom.id, userId: hugo.id, role: 'member' },
    { roomId: electroRoom.id, userId: bob.id, role: 'admin' },
    { roomId: electroRoom.id, userId: david.id, role: 'member' },
    { roomId: electroRoom.id, userId: emma.id, role: 'moderator' },
    { roomId: privateRoom.id, userId: orgMax.id, role: 'admin' },
    { roomId: privateRoom.id, userId: orgMarie.id, role: 'member' },
  ];

  for (const m of roomMembers) {
    await prisma.roomMember.create({ data: m });
  }

  // Messages
  const messagesData = [
    { roomId: concertRoom.id, senderId: jean.id, content: 'Qui vient au concert le 15 juin ? 🎸' },
    { roomId: concertRoom.id, senderId: alice.id, content: 'Moi ! J\'ai trop hâte !' },
    { roomId: concertRoom.id, senderId: hugo.id, content: 'Présent ! On se retrouve devant l\'entrée B ?' },
    { roomId: concertRoom.id, senderId: jean.id, content: 'Parfait, RDV à 19h30 devant l\'entrée B' },
    { roomId: electroRoom.id, senderId: bob.id, content: 'Le line-up vient de sortir, c\'est du lourd 🔥' },
    { roomId: electroRoom.id, senderId: emma.id, content: 'On campe ou on prend un hôtel ?' },
    { roomId: electroRoom.id, senderId: david.id, content: 'Camping pour l\'ambiance !' },
    { roomId: privateRoom.id, senderId: orgMax.id, content: 'On a déjà 40% des places vendues pour le Tech Summit' },
    { roomId: privateRoom.id, senderId: orgMarie.id, content: 'Super, on peut commencer à communiquer plus large' },
  ];

  const createdMessages = [];
  for (const m of messagesData) {
    const msg = await prisma.message.create({ data: m });
    createdMessages.push(msg);
  }

  // Réactions
  await prisma.reaction.create({ data: { messageId: createdMessages[0].id, userId: alice.id, emoji: '🎸' } });
  await prisma.reaction.create({ data: { messageId: createdMessages[0].id, userId: hugo.id, emoji: '🔥' } });
  await prisma.reaction.create({ data: { messageId: createdMessages[4].id, userId: david.id, emoji: '🔥' } });
  await prisma.reaction.create({ data: { messageId: createdMessages[4].id, userId: emma.id, emoji: '❤️' } });

  console.log(`✅ 3 salons, ${roomMembers.length} membres, ${messagesData.length} messages, 4 réactions créés`);

  // ══════════════════════════════════════════
  // 8. NOTIFICATIONS
  // ══════════════════════════════════════════
  console.log('🔔 Création des notifications...');

  const notificationsData = [
    { userId: jean.id, type: 'friend_request', title: 'Nouvelle demande d\'ami', body: 'Hugo Lambert souhaite être votre ami', read: false },
    { userId: alice.id, type: 'friend_request', title: 'Nouvelle demande d\'ami', body: 'Fabien Leroy souhaite être votre ami', read: false },
    { userId: jean.id, type: 'event_reminder', title: 'Rappel événement', body: 'Concert Rock dans 3 jours !', read: true },
    { userId: alice.id, type: 'event_reminder', title: 'Rappel événement', body: 'N\'oubliez pas l\'Expo Banksy demain', read: false },
    { userId: bob.id, type: 'new_message', title: 'Nouveau message', body: 'David a répondu dans Electro Beach Crew', read: true },
    { userId: emma.id, type: 'review_received', title: 'Nouvel avis', body: 'Quelqu\'un a commenté l\'Expo Banksy', read: false },
  ];

  for (const n of notificationsData) {
    await prisma.notification.create({ data: n });
  }

  console.log(`✅ ${notificationsData.length} notifications créées`);

  // ══════════════════════════════════════════
  // RÉSUMÉ
  // ══════════════════════════════════════════
  console.log('\n📊 Résumé du seeding :');
  console.log(`   👤 ${users.length} utilisateurs (2 admins, 4 organisateurs, 9 users)`);
  console.log(`   📅 ${events.length} événements (7 catégories)`);
  console.log(`   🎟️  ${ticketCount} billets (paid, used, cancelled, pending)`);
  console.log(`   ⭐ ${reviewsData.length} avis`);
  console.log(`   ❤️  ${favoritesData.length} favoris`);
  console.log(`   🤝 ${friendshipsData.length} amitiés`);
  console.log(`   💬 3 salons, ${messagesData.length} messages`);
  console.log(`   🔔 ${notificationsData.length} notifications`);
  console.log('\n🚀 Seeding terminé avec succès !');
  console.log('   Connexion : admin@rifle.com / password123');
  console.log('   Connexion : organizer@rifle.com / password123');
  console.log('   Connexion : user@rifle.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
