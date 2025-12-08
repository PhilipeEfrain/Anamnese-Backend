import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  createPet,
  getAllPets,
  getPetById,
  updatePet,
  deletePet,
} from "./pet.controller";
import Pet from "../models/Pet";
import Client from "../models/Client";

jest.mock("../models/Pet");
jest.mock("../models/Client");

describe("Pet Controller - Unit Tests", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
    };

    responseObject = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockResponse = responseObject;

    jest.clearAllMocks();
  });

  describe("createPet", () => {
    it("should create pet successfully and return 201", async () => {
      const ownerId = new mongoose.Types.ObjectId();
      const petId = new mongoose.Types.ObjectId();

      const mockPetData = {
        owner: ownerId.toString(),
        name: "Rex",
        species: "dog",
        breed: "Labrador",
        age: 3,
      };

      const mockClient = {
        _id: ownerId,
        name: "John Doe",
        email: "john@example.com",
        pets: [],
        save: jest.fn().mockResolvedValue(true),
      };

      const mockCreatedPet = {
        _id: petId,
        owner: ownerId,
        name: "Rex",
        species: "dog",
        breed: "Labrador",
        age: 3,
      };

      mockRequest.body = mockPetData;

      (Client.findById as jest.Mock).mockResolvedValue(mockClient);
      (Pet.create as jest.Mock).mockResolvedValue(mockCreatedPet);

      await createPet(mockRequest as Request, mockResponse as Response);

      expect(Client.findById).toHaveBeenCalledWith(ownerId.toString());
      expect(Pet.create).toHaveBeenCalledWith({
        owner: ownerId.toString(),
        name: "Rex",
        species: "dog",
        breed: "Labrador",
        age: 3,
      });
      expect(mockClient.pets).toContain(petId);
      expect(mockClient.save).toHaveBeenCalled();
      expect(responseObject.status).toHaveBeenCalledWith(201);
      expect(responseObject.json).toHaveBeenCalledWith(mockCreatedPet);
    });

    it("should return 404 when owner (client) not found", async () => {
      const ownerId = new mongoose.Types.ObjectId();
      mockRequest.body = {
        owner: ownerId.toString(),
        name: "Rex",
        species: "dog",
      };

      (Client.findById as jest.Mock).mockResolvedValue(null);

      await createPet(mockRequest as Request, mockResponse as Response);

      expect(Client.findById).toHaveBeenCalledWith(ownerId.toString());
      expect(Pet.create).not.toHaveBeenCalled();
      expect(responseObject.status).toHaveBeenCalledWith(404);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Owner (client) not found",
      });
    });

    it("should return 500 when database error occurs during pet creation", async () => {
      const ownerId = new mongoose.Types.ObjectId();
      const mockClient = {
        _id: ownerId,
        pets: [],
        save: jest.fn(),
      };

      mockRequest.body = {
        owner: ownerId.toString(),
        name: "Rex",
        species: "dog",
      };

      (Client.findById as jest.Mock).mockResolvedValue(mockClient);
      (Pet.create as jest.Mock).mockRejectedValue(
        new Error("Database error creating pet")
      );

      await createPet(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Database error creating pet",
      });
    });

    it("should return 500 when client save fails", async () => {
      const ownerId = new mongoose.Types.ObjectId();
      const petId = new mongoose.Types.ObjectId();

      const mockClient = {
        _id: ownerId,
        pets: [],
        save: jest.fn().mockRejectedValue(new Error("Failed to save client")),
      };

      const mockCreatedPet = {
        _id: petId,
        owner: ownerId,
        name: "Rex",
        species: "dog",
      };

      mockRequest.body = {
        owner: ownerId.toString(),
        name: "Rex",
        species: "dog",
      };

      (Client.findById as jest.Mock).mockResolvedValue(mockClient);
      (Pet.create as jest.Mock).mockResolvedValue(mockCreatedPet);

      await createPet(mockRequest as Request, mockResponse as Response);

      expect(mockClient.save).toHaveBeenCalled();
      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Failed to save client",
      });
    });

    it("should return 500 when client lookup fails", async () => {
      const ownerId = new mongoose.Types.ObjectId();
      mockRequest.body = {
        owner: ownerId.toString(),
        name: "Rex",
        species: "dog",
      };

      (Client.findById as jest.Mock).mockRejectedValue(
        new Error("Database connection failed")
      );

      await createPet(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Database connection failed",
      });
    });

    it("should handle pet creation with complete data", async () => {
      const ownerId = new mongoose.Types.ObjectId();
      const petId = new mongoose.Types.ObjectId();

      const completePetData = {
        owner: ownerId.toString(),
        name: "Max",
        species: "cat",
        breed: "Persian",
        age: 5,
        weight: 4.5,
        color: "white",
      };

      const mockClient = {
        _id: ownerId,
        pets: [],
        save: jest.fn().mockResolvedValue(true),
      };

      const mockCreatedPet = {
        _id: petId,
        ...completePetData,
        owner: ownerId,
      };

      mockRequest.body = completePetData;

      (Client.findById as jest.Mock).mockResolvedValue(mockClient);
      (Pet.create as jest.Mock).mockResolvedValue(mockCreatedPet);

      await createPet(mockRequest as Request, mockResponse as Response);

      expect(Pet.create).toHaveBeenCalledWith({
        owner: ownerId.toString(),
        name: "Max",
        species: "cat",
        breed: "Persian",
        age: 5,
        weight: 4.5,
        color: "white",
      });
      expect(responseObject.status).toHaveBeenCalledWith(201);
    });
  });

  describe("getAllPets", () => {
    it("should return all pets with populated owner data", async () => {
      const mockPets = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: "Rex",
          species: "dog",
          owner: {
            _id: new mongoose.Types.ObjectId(),
            name: "John Doe",
            email: "john@example.com",
          },
        },
        {
          _id: new mongoose.Types.ObjectId(),
          name: "Miau",
          species: "cat",
          owner: {
            _id: new mongoose.Types.ObjectId(),
            name: "Jane Smith",
            email: "jane@example.com",
          },
        },
      ];

      const mockPopulate = jest.fn().mockResolvedValue(mockPets);
      (Pet.find as jest.Mock).mockReturnValue({
        populate: mockPopulate,
      });

      await getAllPets(mockRequest as Request, mockResponse as Response);

      expect(Pet.find).toHaveBeenCalledWith();
      expect(mockPopulate).toHaveBeenCalledWith("owner");
      expect(responseObject.json).toHaveBeenCalledWith(mockPets);
      expect(responseObject.status).not.toHaveBeenCalled();
    });

    it("should return empty array when no pets exist", async () => {
      const mockPopulate = jest.fn().mockResolvedValue([]);
      (Pet.find as jest.Mock).mockReturnValue({
        populate: mockPopulate,
      });

      await getAllPets(mockRequest as Request, mockResponse as Response);

      expect(Pet.find).toHaveBeenCalled();
      expect(mockPopulate).toHaveBeenCalledWith("owner");
      expect(responseObject.json).toHaveBeenCalledWith([]);
    });

    it("should return 500 when database error occurs", async () => {
      const mockError = new Error("Database connection lost");
      const mockPopulate = jest.fn().mockRejectedValue(mockError);
      (Pet.find as jest.Mock).mockReturnValue({
        populate: mockPopulate,
      });

      await getAllPets(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Database connection lost",
      });
    });

    it("should return 500 when populate fails", async () => {
      const mockError = new Error("Population failed");
      const mockPopulate = jest.fn().mockRejectedValue(mockError);
      (Pet.find as jest.Mock).mockReturnValue({
        populate: mockPopulate,
      });

      await getAllPets(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Population failed",
      });
    });
  });

  describe("getPetById", () => {
    it("should return pet by id with populated owner and anamneses data", async () => {
      const petId = new mongoose.Types.ObjectId();
      const mockPet = {
        _id: petId,
        name: "Rex",
        species: "dog",
        owner: {
          _id: new mongoose.Types.ObjectId(),
          name: "John Doe",
          email: "john@example.com",
        },
        anamneses: [
          {
            _id: new mongoose.Types.ObjectId(),
            reason: "Consulta de rotina",
          },
        ],
      };

      mockRequest.params = { id: petId.toString() };

      const mockPopulateAnamneses = jest.fn().mockResolvedValue(mockPet);
      const mockPopulateOwner = jest.fn().mockReturnValue({
        populate: mockPopulateAnamneses,
      });

      (Pet.findById as jest.Mock).mockReturnValue({
        populate: mockPopulateOwner,
      });

      await getPetById(mockRequest as Request, mockResponse as Response);

      expect(Pet.findById).toHaveBeenCalledWith(petId.toString());
      expect(mockPopulateOwner).toHaveBeenCalledWith("owner");
      expect(mockPopulateAnamneses).toHaveBeenCalledWith("anamneses");
      expect(responseObject.json).toHaveBeenCalledWith(mockPet);
      expect(responseObject.status).not.toHaveBeenCalled();
    });

    it("should return 404 when pet is not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      mockRequest.params = { id: nonExistentId.toString() };

      const mockPopulateAnamneses = jest.fn().mockResolvedValue(null);
      const mockPopulateOwner = jest.fn().mockReturnValue({
        populate: mockPopulateAnamneses,
      });

      (Pet.findById as jest.Mock).mockReturnValue({
        populate: mockPopulateOwner,
      });

      await getPetById(mockRequest as Request, mockResponse as Response);

      expect(Pet.findById).toHaveBeenCalledWith(nonExistentId.toString());
      expect(responseObject.status).toHaveBeenCalledWith(404);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Pet not found",
      });
    });

    it("should return 500 when database error occurs", async () => {
      mockRequest.params = { id: new mongoose.Types.ObjectId().toString() };
      const mockError = new Error("Database query failed");

      const mockPopulateAnamneses = jest.fn().mockRejectedValue(mockError);
      const mockPopulateOwner = jest.fn().mockReturnValue({
        populate: mockPopulateAnamneses,
      });

      (Pet.findById as jest.Mock).mockReturnValue({
        populate: mockPopulateOwner,
      });

      await getPetById(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Database query failed",
      });
    });

    it("should return 500 when invalid id format is provided", async () => {
      mockRequest.params = { id: "invalid_id" };
      const mockError = new Error("Invalid ID format");

      const mockPopulateAnamneses = jest.fn().mockRejectedValue(mockError);
      const mockPopulateOwner = jest.fn().mockReturnValue({
        populate: mockPopulateAnamneses,
      });

      (Pet.findById as jest.Mock).mockReturnValue({
        populate: mockPopulateOwner,
      });

      await getPetById(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Invalid ID format",
      });
    });
  });

  describe("updatePet", () => {
    it("should update pet successfully and return updated data", async () => {
      const petId = new mongoose.Types.ObjectId();
      const updateData = {
        name: "Rex Updated",
        age: 4,
        weight: 30,
      };

      const mockUpdatedPet = {
        _id: petId,
        ...updateData,
        species: "dog",
        owner: new mongoose.Types.ObjectId(),
      };

      mockRequest.params = { id: petId.toString() };
      mockRequest.body = updateData;

      (Pet.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedPet);

      await updatePet(mockRequest as Request, mockResponse as Response);

      expect(Pet.findByIdAndUpdate).toHaveBeenCalledWith(
        petId.toString(),
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );
      expect(responseObject.json).toHaveBeenCalledWith(mockUpdatedPet);
      expect(responseObject.status).not.toHaveBeenCalled();
    });

    it("should return 404 when pet to update is not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      mockRequest.params = { id: nonExistentId.toString() };
      mockRequest.body = { name: "Updated Name" };

      (Pet.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      await updatePet(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(404);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Pet not found",
      });
    });

    it("should return 500 when database error occurs during update", async () => {
      mockRequest.params = { id: new mongoose.Types.ObjectId().toString() };
      mockRequest.body = { name: "Test" };
      const mockError = new Error("Database update failed");

      (Pet.findByIdAndUpdate as jest.Mock).mockRejectedValue(mockError);

      await updatePet(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Database update failed",
      });
    });

    it("should return 500 when validation error occurs during update", async () => {
      mockRequest.params = { id: new mongoose.Types.ObjectId().toString() };
      mockRequest.body = { age: -5 };
      const validationError = new Error("Age must be positive");

      (Pet.findByIdAndUpdate as jest.Mock).mockRejectedValue(validationError);

      await updatePet(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Age must be positive",
      });
    });

    it("should handle partial updates", async () => {
      const petId = new mongoose.Types.ObjectId();
      const partialUpdate = { weight: 32.5 };

      const mockUpdatedPet = {
        _id: petId,
        name: "Rex",
        species: "dog",
        weight: 32.5,
        owner: new mongoose.Types.ObjectId(),
      };

      mockRequest.params = { id: petId.toString() };
      mockRequest.body = partialUpdate;

      (Pet.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedPet);

      await updatePet(mockRequest as Request, mockResponse as Response);

      expect(Pet.findByIdAndUpdate).toHaveBeenCalledWith(
        petId.toString(),
        partialUpdate,
        {
          new: true,
          runValidators: true,
        }
      );
      expect(responseObject.json).toHaveBeenCalledWith(mockUpdatedPet);
    });
  });

  describe("deletePet", () => {
    it("should delete pet and update client's pets array successfully", async () => {
      const petId = new mongoose.Types.ObjectId();
      const ownerId = new mongoose.Types.ObjectId();

      const mockPet = {
        _id: petId,
        name: "Rex",
        species: "dog",
        owner: ownerId,
      };

      mockRequest.params = { id: petId.toString() };

      (Pet.findByIdAndDelete as jest.Mock).mockResolvedValue(mockPet);
      (Client.findByIdAndUpdate as jest.Mock).mockResolvedValue({
        _id: ownerId,
        pets: [],
      });

      await deletePet(mockRequest as Request, mockResponse as Response);

      expect(Pet.findByIdAndDelete).toHaveBeenCalledWith(petId.toString());
      expect(Client.findByIdAndUpdate).toHaveBeenCalledWith(ownerId, {
        $pull: { pets: petId },
      });
      expect(responseObject.json).toHaveBeenCalledWith({
        message: "Pet deleted successfully",
      });
      expect(responseObject.status).not.toHaveBeenCalled();
    });

    it("should return 404 when pet to delete is not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      mockRequest.params = { id: nonExistentId.toString() };

      (Pet.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      await deletePet(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(404);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Pet not found",
      });
      expect(Client.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("should return 500 when database error occurs during deletion", async () => {
      mockRequest.params = { id: new mongoose.Types.ObjectId().toString() };
      const mockError = new Error("Database deletion failed");

      (Pet.findByIdAndDelete as jest.Mock).mockRejectedValue(mockError);

      await deletePet(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Database deletion failed",
      });
    });

    it("should return 500 when client update fails after pet deletion", async () => {
      const petId = new mongoose.Types.ObjectId();
      const ownerId = new mongoose.Types.ObjectId();

      const mockPet = {
        _id: petId,
        name: "Rex",
        species: "dog",
        owner: ownerId,
      };

      mockRequest.params = { id: petId.toString() };

      (Pet.findByIdAndDelete as jest.Mock).mockResolvedValue(mockPet);
      (Client.findByIdAndUpdate as jest.Mock).mockRejectedValue(
        new Error("Failed to update client")
      );

      await deletePet(mockRequest as Request, mockResponse as Response);

      expect(Pet.findByIdAndDelete).toHaveBeenCalledWith(petId.toString());
      expect(Client.findByIdAndUpdate).toHaveBeenCalledWith(ownerId, {
        $pull: { pets: petId },
      });
      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Failed to update client",
      });
    });
  });
});
