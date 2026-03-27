import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/prisma/prismaClient.js";

describe("Events Routes", () => {
  let organizerId;
  let organizerToken;
  let userToken;
  let eventId;
  let soldTicketId;

  const organizerData = {
    email: "organizer@test.com",
    password: "OrganizerPass123",
    name: "Test Organizer",
  };

  const attendeeData = {
    email: "attendee@test.com",
    password: "AttendeePass123",
    name: "Test Attendee",
  };

  const eventData = {
    title: "Test Concert",
    description: "A wonderful test concert event",
    date: new Date(Date.now() + 86400000).toISOString(),
    location: "Test City",
    price: 50,
    capacity: 100,
    imageUrl: "https://example.com/test.jpg",
    category: "concert",
  };

  beforeEach(async () => {
    await prisma.ticket.deleteMany();
    await prisma.event.deleteMany({ where: { title: { startsWith: "Test" } } });
    await prisma.user.deleteMany({
      where: {
        email: { in: [organizerData.email, attendeeData.email, "simple-user@test.com"] },
      },
    });

    const organizerRes = await request(app).post("/api/auth/register").send(organizerData);
    organizerId = organizerRes.body.user.id;
    organizerToken = organizerRes.body.token;

    await prisma.user.update({
      where: { id: organizerId },
      data: { role: "organizer" },
    });

    const attendeeRes = await request(app).post("/api/auth/register").send(attendeeData);
    userToken = attendeeRes.body.token;
  });

  afterAll(async () => {
    await prisma.ticket.deleteMany();
    await prisma.event.deleteMany({ where: { title: { startsWith: "Test" } } });
    await prisma.user.deleteMany({
      where: {
        email: { in: [organizerData.email, attendeeData.email, "simple-user@test.com"] },
      },
    });
  });

  it("retrieves public events with pagination", async () => {
    const created = await prisma.event.create({
      data: {
        ...eventData,
        organizerId,
      },
    });
    eventId = created.id;

    const res = await request(app).get("/api/events");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toHaveProperty("page");
  });

  it("creates an event for organizer", async () => {
    const res = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${organizerToken}`)
      .send(eventData);

    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBeTruthy();
    expect(res.body.title).toBe(eventData.title);
    expect(res.body.organizer.id).toBe(organizerId);
    expect(res.body.remaining).toBe(eventData.capacity);
  });

  it("rejects event creation for simple user", async () => {
    const simpleUser = {
      email: "simple-user@test.com",
      password: "SimplePass123",
      name: "Simple User",
    };

    const userRes = await request(app).post("/api/auth/register").send(simpleUser);

    const res = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${userRes.body.token}`)
      .send(eventData);

    expect(res.statusCode).toBe(403);
  });

  it("updates an event for its organizer", async () => {
    const created = await prisma.event.create({
      data: {
        ...eventData,
        organizerId,
      },
    });
    eventId = created.id;

    const res = await request(app)
      .put(`/api/events/${eventId}`)
      .set("Authorization", `Bearer ${organizerToken}`)
      .send({
        ...eventData,
        title: "Test Concert Updated",
        price: 75,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("Test Concert Updated");
    expect(res.body.price).toBe(75);
  });

  it("soft deletes an event and auto-cancels active tickets", async () => {
    const created = await prisma.event.create({
      data: {
        ...eventData,
        organizerId,
      },
    });
    eventId = created.id;

    const buyRes = await request(app)
      .post("/api/tickets/buy")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ eventId });

    soldTicketId = buyRes.body.ticket.id;

    const deleteRes = await request(app)
      .delete(`/api/events/${eventId}`)
      .set("Authorization", `Bearer ${organizerToken}`);

    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body.message).toMatch(/billets actifs ont été annulés/i);

    const publicRes = await request(app).get(`/api/events/${eventId}`);
    expect(publicRes.statusCode).toBe(404);

    const deletedEvent = await prisma.event.findUnique({ where: { id: eventId } });
    expect(deletedEvent?.deletedAt).toBeTruthy();

    const cancelledTicket = await prisma.ticket.findUnique({ where: { id: soldTicketId } });
    expect(cancelledTicket?.status).toBe("cancelled");
  });
});
