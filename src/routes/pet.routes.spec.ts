import express from "express";
import request from "supertest";
import petRoutes from "./pet.routes";

jest.mock("../controllers/pet.controller", () => ({
  createPet: jest.fn((req, res) => res.status(201).json({ success: true })),
  getAllPets: jest.fn((req, res) => res.status(200).json([])),
  getPetById: jest.fn((req, res) =>
    res.status(200).json({ id: req.params.id })
  ),
  updatePet: jest.fn((req, res) => res.status(200).json({ updated: true })),
  deletePet: jest.fn((req, res) => res.status(200).json({ deleted: true })),
}));

jest.mock("../middleware/auth", () => ({
  authenticateVet: jest.fn((req, res, next) => next()),
}));

jest.mock("../middleware/validators", () => ({
  validatePetCreation: jest.fn((req, res, next) => next()),
}));

describe("Pet Routes - Unit Tests", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/pet", petRoutes);
  });

  describe("POST /", () => {
    it("should create pet on protected route", async () => {
      const response = await request(app)
        .post("/pet")
        .send({ name: "Test Pet" });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe("GET /", () => {
    it("should get all pets on protected route", async () => {
      const response = await request(app).get("/pet");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("GET /:id", () => {
    it("should get pet by id on protected route", async () => {
      const response = await request(app).get("/pet/123");

      expect(response.status).toBe(200);
      expect(response.body.id).toBe("123");
    });
  });

  describe("PUT /:id", () => {
    it("should update pet on protected route", async () => {
      const response = await request(app)
        .put("/pet/123")
        .send({ name: "Updated Pet" });

      expect(response.status).toBe(200);
      expect(response.body.updated).toBe(true);
    });
  });

  describe("DELETE /:id", () => {
    it("should delete pet on protected route", async () => {
      const response = await request(app).delete("/pet/123");

      expect(response.status).toBe(200);
      expect(response.body.deleted).toBe(true);
    });
  });
});
