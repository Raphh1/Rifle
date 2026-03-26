import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../src/app.js";
import prisma from "../src/prisma/prismaClient.js";

describe("Authentication Routes", () => {
  const testUser = {
    email: "test.auth@example.com",
    password: "TestPassword123",
    name: "Test User Auth",
  };

  let authToken;

  beforeEach(async () => {
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
  });

  it("registers a new user", async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.role).toBe("user");
  });

  it("rejects duplicate email registration", async () => {
    await request(app).post("/api/auth/register").send(testUser);

    const res = await request(app).post("/api/auth/register").send(testUser);

    expect(res.statusCode).toBe(409);
  });

  it("hashes password before storing", async () => {
    await request(app).post("/api/auth/register").send(testUser);

    const user = await prisma.user.findUnique({
      where: { email: testUser.email },
    });

    expect(user).toBeTruthy();
    expect(user.password).not.toBe(testUser.password);
    expect(await bcrypt.compare(testUser.password, user.password)).toBe(true);
  });

  it("logs in with valid credentials", async () => {
    await request(app).post("/api/auth/register").send(testUser);

    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeTruthy();
    authToken = res.body.token;
  });

  it("rejects invalid password", async () => {
    await request(app).post("/api/auth/register").send(testUser);

    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: "WrongPassword123",
    });

    expect(res.statusCode).toBe(401);
  });

  it("returns current user profile with valid token", async () => {
    const registerRes = await request(app).post("/api/auth/register").send(testUser);
    authToken = registerRes.body.token;

    const res = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(testUser.email);
  });

  it("rejects current user profile without token", async () => {
    const res = await request(app).get("/api/users/me");
    expect(res.statusCode).toBe(401);
  });
});
