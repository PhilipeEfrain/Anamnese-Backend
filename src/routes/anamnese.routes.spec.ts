import express from "express";
import request from "supertest";
import anamneseRoutes from "./anamnese.routes";

jest.mock("../controllers/anamnese.controller", () => ({
  createAnamnese: jest.fn((req, res) =>
    res.status(201).json({ success: true })
  ),
  getAll: jest.fn((req, res) => res.status(200).json([])),
  getById: jest.fn((req, res) => res.status(200).json({ id: req.params.id })),
}));

jest.mock("../middleware/auth", () => ({
  authenticateVet: jest.fn((req, res, next) => next()),
}));

jest.mock("../middleware/rateLimiter", () => ({
  createAnamneseLimiter: jest.fn((req, res, next) => next()),
}));

jest.mock("../middleware/validators", () => ({
  validateAnamneseCreation: jest.fn((req, res, next) => next()),
}));

describe("Anamnese Routes - Unit Tests", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/anamnese", anamneseRoutes);
  });

  describe("POST /", () => {
    it("should create anamnese on public route", async () => {
      const response = await request(app)
        .post("/anamnese")
        .send({ pet: "123", reason: "test" });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe("GET /", () => {
    it("should get all anamneses on protected route", async () => {
      const response = await request(app).get("/anamnese");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("GET /:id", () => {
    it("should get anamnese by id on protected route", async () => {
      const response = await request(app).get("/anamnese/123");

      expect(response.status).toBe(200);
      expect(response.body.id).toBe("123");
    });
  });
});
