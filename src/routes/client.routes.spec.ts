import express from "express";
import request from "supertest";
import clientRoutes from "./client.routes";

jest.mock("../controllers/client.controller", () => ({
  createClient: jest.fn((req, res) => res.status(201).json({ success: true })),
  getAllClients: jest.fn((req, res) => res.status(200).json([])),
  getClientById: jest.fn((req, res) =>
    res.status(200).json({ id: req.params.id })
  ),
  updateClient: jest.fn((req, res) => res.status(200).json({ updated: true })),
  deleteClient: jest.fn((req, res) => res.status(200).json({ deleted: true })),
}));

jest.mock("../middleware/auth", () => ({
  authenticateVet: jest.fn((req, res, next) => next()),
}));

jest.mock("../middleware/validators", () => ({
  validateClientCreation: jest.fn((req, res, next) => next()),
}));

describe("Client Routes - Unit Tests", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/client", clientRoutes);
  });

  describe("POST /", () => {
    it("should create client on protected route", async () => {
      const response = await request(app)
        .post("/client")
        .send({ name: "Test Client" });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe("GET /", () => {
    it("should get all clients on protected route", async () => {
      const response = await request(app).get("/client");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("GET /:id", () => {
    it("should get client by id on protected route", async () => {
      const response = await request(app).get("/client/123");

      expect(response.status).toBe(200);
      expect(response.body.id).toBe("123");
    });
  });

  describe("PUT /:id", () => {
    it("should update client on protected route", async () => {
      const response = await request(app)
        .put("/client/123")
        .send({ name: "Updated Client" });

      expect(response.status).toBe(200);
      expect(response.body.updated).toBe(true);
    });
  });

  describe("DELETE /:id", () => {
    it("should delete client on protected route", async () => {
      const response = await request(app).delete("/client/123");

      expect(response.status).toBe(200);
      expect(response.body.deleted).toBe(true);
    });
  });
});
