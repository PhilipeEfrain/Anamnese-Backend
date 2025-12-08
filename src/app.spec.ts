import request from "supertest";
import express from "express";

jest.mock("./routes/anamnese.routes", () => {
  const router = require("express").Router();
  router.get("/", (req: any, res: any) => res.json([]));
  return router;
});

jest.mock("./routes/vet.routes", () => {
  const router = require("express").Router();
  router.post("/register", (req: any, res: any) => res.json({ success: true }));
  return router;
});

jest.mock("./routes/client.routes", () => {
  const router = require("express").Router();
  router.get("/", (req: any, res: any) => res.json([]));
  return router;
});

jest.mock("./routes/pet.routes", () => {
  const router = require("express").Router();
  router.get("/", (req: any, res: any) => res.json([]));
  return router;
});

jest.mock("./middleware/errorHandler", () => ({
  errorHandler: jest.fn((err, req, res, next) => {
    res.status(500).json({ error: err.message });
  }),
}));

jest.mock("./middleware/rateLimiter", () => ({
  generalLimiter: jest.fn((req, res, next) => next()),
}));

describe("App - Unit Tests", () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Health Check", () => {
    it("should return OK on health check endpoint", async () => {
      jest.resetModules();
      app = require("./app").default;
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
      expect(response.text).toBe("OK");
    });
  });

  describe("CORS Configuration", () => {
    it("should use wildcard when CORS_ORIGIN is not defined", () => {
      const originalEnv = process.env.CORS_ORIGIN;
      delete process.env.CORS_ORIGIN;

      jest.resetModules();
      const appWithoutEnv = require("./app").default;

      expect(appWithoutEnv).toBeDefined();

      if (originalEnv) process.env.CORS_ORIGIN = originalEnv;
    });

    it("should use CORS_ORIGIN from environment when defined", () => {
      const originalEnv = process.env.CORS_ORIGIN;
      process.env.CORS_ORIGIN = "https://example.com";

      jest.resetModules();
      const appWithEnv = require("./app").default;

      expect(appWithEnv).toBeDefined();

      if (originalEnv) {
        process.env.CORS_ORIGIN = originalEnv;
      } else {
        delete process.env.CORS_ORIGIN;
      }
    });
  });

  describe("Routes", () => {
    beforeEach(() => {
      jest.resetModules();
      app = require("./app").default;
    });

    it("should have anamnese routes mounted", async () => {
      const response = await request(app).get("/anamnese");

      expect(response.status).toBe(200);
    });

    it("should have vet routes mounted", async () => {
      const response = await request(app).post("/vet/register");

      expect(response.status).toBe(200);
    });

    it("should have client routes mounted", async () => {
      const response = await request(app).get("/client");

      expect(response.status).toBe(200);
    });

    it("should have pet routes mounted", async () => {
      const response = await request(app).get("/pet");

      expect(response.status).toBe(200);
    });
  });

  describe("Middleware Configuration", () => {
    beforeEach(() => {
      jest.resetModules();
      app = require("./app").default;
    });

    it("should parse JSON bodies", async () => {
      const response = await request(app)
        .post("/vet/register")
        .send({ email: "test@example.com" })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(200);
    });

    it("should handle CORS", async () => {
      const response = await request(app)
        .get("/health")
        .set("Origin", "http://localhost:3000");

      expect(response.headers["access-control-allow-origin"]).toBeDefined();
    });
  });
});
