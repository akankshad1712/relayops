import { describe, expect, it } from "vitest";
import { app } from "../app.js";
import request from "supertest";

describe("RelayOps API", () => {
  it("returns a stable health contract (database may be unavailable)", async () => {
    const response = await request(app).get("/health");
    expect([200, 503]).toContain(response.status);
    expect(response.body).toHaveProperty("service", "relayops-api");
  });
  it("rejects unauthenticated incident requests", async () => {
    const response = await request(app).get("/api/v1/incidents");
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHENTICATED");
  });
  it("rejects unauthenticated service requests", async () => {
    const response = await request(app).get("/api/v1/services");
    expect(response.status).toBe(401);
  });
  it("protects the incident event timeline", async () => {
    const response = await request(app).get("/api/v1/incidents/example-id/events");
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHENTICATED");
  });
});
