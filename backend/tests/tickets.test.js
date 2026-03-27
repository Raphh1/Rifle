import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/prisma/prismaClient.js";

describe("Tickets Routes", () => {
  let userId;
  let userToken;
  let organizerId;
  let organizerToken;
  let eventId;
  let ticketId;

  const userData = {
    email: "user@test.com",
    password: "UserPass123",
    name: "Test User",
  };

  const organizerData = {
    email: "organizer@test.com",
    password: "OrganizerPass123",
    name: "Test Organizer",
  };

  const eventData = {
    title: "Test Event for Tickets",
    description: "A test event for ticket purchases",
    date: new Date(Date.now() + 86400000).toISOString(),
    location: "Test City",
    price: 50,
    capacity: 3,
    imageUrl: "https://example.com/test.jpg",
    category: "concert",
  };

  beforeEach(async () => {
    await prisma.ticket.deleteMany();
    await prisma.event.deleteMany({ where: { title: { startsWith: "Test Event" } } });
    await prisma.user.deleteMany({
      where: {
        email: { in: [userData.email, organizerData.email, "other-user@test.com"] },
      },
    });

    const userRes = await request(app).post("/api/auth/register").send(userData);
    userId = userRes.body.user.id;
    userToken = userRes.body.token;

    const organizerRes = await request(app).post("/api/auth/register").send(organizerData);
    organizerId = organizerRes.body.user.id;
    organizerToken = organizerRes.body.token;

    await prisma.user.update({
      where: { id: organizerId },
      data: { role: "organizer" },
    });

    const eventRes = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${organizerToken}`)
      .send(eventData);

    eventId = eventRes.body.id;
  });

  afterAll(async () => {
    await prisma.ticket.deleteMany();
    await prisma.event.deleteMany({ where: { title: { startsWith: "Test Event" } } });
    await prisma.user.deleteMany({
      where: {
        email: { in: [userData.email, organizerData.email, "other-user@test.com"] },
      },
    });
  });

  it("lists current user tickets", async () => {
    const buyRes = await request(app)
      .post("/api/tickets/buy")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ eventId });

    ticketId = buyRes.body.ticket.id;

    const res = await request(app).get("/api/tickets").set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((ticket) => ticket.id === ticketId)).toBe(true);
  });

  it("buys a ticket for an active event", async () => {
    const res = await request(app)
      .post("/api/tickets/buy")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ eventId });

    expect(res.statusCode).toBe(201);
    expect(res.body.ticket.id).toBeTruthy();
    expect(res.body.ticket.userId).toBe(userId);
    expect(res.body.ticket.status).toBe("paid");
  });

  it("returns ticket detail to owner", async () => {
    const buyRes = await request(app)
      .post("/api/tickets/buy")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ eventId });

    ticketId = buyRes.body.ticket.id;

    const res = await request(app)
      .get(`/api/tickets/${ticketId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(ticketId);
    expect(res.body.event.id).toBe(eventId);
  });

  it("cancels an active ticket for its owner", async () => {
    const buyRes = await request(app)
      .post("/api/tickets/buy")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ eventId });

    ticketId = buyRes.body.ticket.id;

    const res = await request(app)
      .patch(`/api/tickets/${ticketId}/cancel`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.ticket.status).toBe("cancelled");

    const eventRes = await request(app).get(`/api/events/${eventId}`);
    expect(eventRes.statusCode).toBe(200);
    expect(eventRes.body.remaining).toBe(eventData.capacity);
  });

  it("rejects cancelling an already used ticket", async () => {
    const buyRes = await request(app)
      .post("/api/tickets/buy")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ eventId });

    ticketId = buyRes.body.ticket.id;

    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });

    await request(app)
      .post("/api/tickets/validate")
      .set("Authorization", `Bearer ${organizerToken}`)
      .send({ qrCode: ticket.qrCode });

    const cancelRes = await request(app)
      .patch(`/api/tickets/${ticketId}/cancel`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(cancelRes.statusCode).toBe(400);
  });

  it("rejects transfer of a cancelled ticket", async () => {
    const buyRes = await request(app)
      .post("/api/tickets/buy")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ eventId });

    ticketId = buyRes.body.ticket.id;

    await request(app)
      .patch(`/api/tickets/${ticketId}/cancel`)
      .set("Authorization", `Bearer ${userToken}`);

    const otherUserRes = await request(app).post("/api/auth/register").send({
      email: "other-user@test.com",
      password: "OtherPass123",
      name: "Other User",
    });

    const transferRes = await request(app)
      .post(`/api/tickets/${ticketId}/transfer`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ email: otherUserRes.body.user.email });

    expect(transferRes.statusCode).toBe(400);
  });

  it("rejects validation of a cancelled ticket", async () => {
    const buyRes = await request(app)
      .post("/api/tickets/buy")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ eventId });

    ticketId = buyRes.body.ticket.id;

    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });

    await request(app)
      .patch(`/api/tickets/${ticketId}/cancel`)
      .set("Authorization", `Bearer ${userToken}`);

    const validateRes = await request(app)
      .post("/api/tickets/validate")
      .set("Authorization", `Bearer ${organizerToken}`)
      .send({ qrCode: ticket.qrCode });

    expect(validateRes.statusCode).toBe(400);
  });
});
