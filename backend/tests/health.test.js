import request from "supertest";
import app from "../src/app.js";

describe("API Health & Basic Routes", () => {
  it("returns 200 OK on root path", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");
  });

  it("returns 200 OK on API health route", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("OK");
  });

  it("handles undefined routes with 404", async () => {
    const res = await request(app).get("/api/undefined-route-that-does-not-exist");
    expect(res.statusCode).toBe(404);
  });

  it("accepts JSON requests", async () => {
    const res = await request(app).post("/api/auth/login").set("Content-Type", "application/json").send({});
    expect(res.statusCode).not.toBe(415);
  });
});
