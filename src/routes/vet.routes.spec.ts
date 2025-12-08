import express from "express";
import request from "supertest";
import vetRoutes from "./vet.routes";

jest.mock("../controllers/vet.controller", () => ({
  registerVet: jest.fn((req, res) => res.status(201).json({ success: true })),
  loginVet: jest.fn((req, res) =>
    res
      .status(200)
      .json({ accessToken: "test-token", refreshToken: "test-refresh" })
  ),
  refreshAccessToken: jest.fn((req, res) =>
    res.status(200).json({ accessToken: "new-access-token" })
  ),
  logout: jest.fn((req, res) =>
    res.status(200).json({ message: "Logged out successfully" })
  ),
}));

jest.mock("../middleware/rateLimiter", () => ({
  authLimiter: jest.fn((req, res, next) => next()),
}));

jest.mock("../middleware/validators", () => ({
  validateVetRegistration: jest.fn((req, res, next) => next()),
  validateVetLogin: jest.fn((req, res, next) => next()),
  validateRefreshToken: jest.fn((req, res, next) => next()),
}));

describe("Vet Routes - Unit Tests", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/vet", vetRoutes);
  });

  describe("POST /register", () => {
    it("should register a vet", async () => {
      const response = await request(app)
        .post("/vet/register")
        .send({ email: "test@vet.com", password: "password123" });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /login", () => {
    it("should login a vet", async () => {
      const response = await request(app)
        .post("/vet/login")
        .send({ email: "test@vet.com", password: "password123" });

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBe("test-token");
      expect(response.body.refreshToken).toBe("test-refresh");
    });
  });

  describe("POST /refresh", () => {
    it("should refresh access token", async () => {
      const response = await request(app)
        .post("/vet/refresh")
        .send({ refreshToken: "old-refresh-token" });

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBe("new-access-token");
    });
  });

  describe("POST /logout", () => {
    it("should logout a vet", async () => {
      const response = await request(app)
        .post("/vet/logout")
        .send({ refreshToken: "test-refresh-token" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Logged out successfully");
    });
  });
});
