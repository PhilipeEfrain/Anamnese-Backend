import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
} from "./client.controller";
import Client from "../models/Client";
import Pet from "../models/Pet";

jest.mock("../models/Client");
jest.mock("../models/Pet");

describe("Client Controller - Unit Tests", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      query: {},
    };

    responseObject = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockResponse = responseObject;

    jest.clearAllMocks();
  });

  describe("createClient", () => {
    it("should create client successfully and return 201", async () => {
      const mockClientData = {
        name: "John Doe",
        email: "john@example.com",
        phone: "123456789",
      };

      const mockCreatedClient = {
        _id: new mongoose.Types.ObjectId(),
        ...mockClientData,
        pets: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.body = mockClientData;
      (Client.create as jest.Mock).mockResolvedValue(mockCreatedClient);

      await createClient(mockRequest as Request, mockResponse as Response);

      expect(Client.create).toHaveBeenCalledWith(mockClientData);
      expect(Client.create).toHaveBeenCalledTimes(1);
      expect(responseObject.status).toHaveBeenCalledWith(201);
      expect(responseObject.json).toHaveBeenCalledWith(mockCreatedClient);
    });

    it("should return 500 when database error occurs", async () => {
      const mockError = new Error("Database connection failed");
      mockRequest.body = { name: "Test" };

      (Client.create as jest.Mock).mockRejectedValue(mockError);

      await createClient(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Database connection failed",
      });
    });

    it("should return 500 when validation error occurs", async () => {
      const validationError = new Error("Email is required");
      mockRequest.body = { name: "Test" };

      (Client.create as jest.Mock).mockRejectedValue(validationError);

      await createClient(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Email is required",
      });
    });

    it("should handle empty request body", async () => {
      mockRequest.body = {};
      const error = new Error("Validation failed");

      (Client.create as jest.Mock).mockRejectedValue(error);

      await createClient(mockRequest as Request, mockResponse as Response);

      expect(Client.create).toHaveBeenCalledWith({});
      expect(responseObject.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getAllClients", () => {
    it("should return all clients with populated pets data and pagination", async () => {
      const mockClients = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: "John Doe",
          email: "john@example.com",
          pets: [
            {
              _id: new mongoose.Types.ObjectId(),
              name: "Rex",
              species: "dog",
            },
          ],
        },
        {
          _id: new mongoose.Types.ObjectId(),
          name: "Jane Smith",
          email: "jane@example.com",
          pets: [],
        },
      ];

      const mockSort = jest.fn().mockReturnThis();
      const mockSkip = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue(mockClients);
      const mockPopulate = jest.fn().mockReturnValue({
        sort: mockSort,
        skip: mockSkip,
        limit: mockLimit,
      });
      (Client.find as jest.Mock).mockReturnValue({
        populate: mockPopulate,
      });
      (Client.countDocuments as jest.Mock).mockResolvedValue(2);

      await getAllClients(mockRequest as Request, mockResponse as Response);

      expect(Client.find).toHaveBeenCalledWith({});
      expect(mockPopulate).toHaveBeenCalledWith("pets");
      expect(Client.countDocuments).toHaveBeenCalledWith({});
      expect(responseObject.json).toHaveBeenCalledWith({
        data: mockClients,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
    });

    it("should return empty array when no clients exist", async () => {
      const mockSort = jest.fn().mockReturnThis();
      const mockSkip = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue([]);
      const mockPopulate = jest.fn().mockReturnValue({
        sort: mockSort,
        skip: mockSkip,
        limit: mockLimit,
      });
      (Client.find as jest.Mock).mockReturnValue({
        populate: mockPopulate,
      });
      (Client.countDocuments as jest.Mock).mockResolvedValue(0);

      await getAllClients(mockRequest as Request, mockResponse as Response);

      expect(Client.find).toHaveBeenCalled();
      expect(mockPopulate).toHaveBeenCalledWith("pets");
      expect(Client.countDocuments).toHaveBeenCalled();
      expect(responseObject.json).toHaveBeenCalledWith({
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
    });

    it("should return 500 when database error occurs", async () => {
      const mockError = new Error("Database connection lost");
      const mockPopulate = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockRejectedValue(mockError),
      });
      (Client.find as jest.Mock).mockReturnValue({
        populate: mockPopulate,
      });

      await getAllClients(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Database connection lost",
      });
    });

    it("should return 500 when populate fails", async () => {
      const mockError = new Error("Population failed");
      const mockPopulate = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockRejectedValue(mockError),
      });
      (Client.find as jest.Mock).mockReturnValue({
        populate: mockPopulate,
      });

      await getAllClients(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Population failed",
      });
    });
  });

  describe("getClientById", () => {
    it("should return client by id with populated pets data", async () => {
      const clientId = new mongoose.Types.ObjectId();
      const mockClient = {
        _id: clientId,
        name: "John Doe",
        email: "john@example.com",
        pets: [
          {
            _id: new mongoose.Types.ObjectId(),
            name: "Rex",
            species: "dog",
          },
        ],
      };

      mockRequest.params = { id: clientId.toString() };

      const mockPopulate = jest.fn().mockResolvedValue(mockClient);
      (Client.findById as jest.Mock).mockReturnValue({
        populate: mockPopulate,
      });

      await getClientById(mockRequest as Request, mockResponse as Response);

      expect(Client.findById).toHaveBeenCalledWith(clientId.toString());
      expect(mockPopulate).toHaveBeenCalledWith("pets");
      expect(responseObject.json).toHaveBeenCalledWith(mockClient);
      expect(responseObject.status).not.toHaveBeenCalled();
    });

    it("should return 404 when client is not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      mockRequest.params = { id: nonExistentId.toString() };

      const mockPopulate = jest.fn().mockResolvedValue(null);
      (Client.findById as jest.Mock).mockReturnValue({
        populate: mockPopulate,
      });

      await getClientById(mockRequest as Request, mockResponse as Response);

      expect(Client.findById).toHaveBeenCalledWith(nonExistentId.toString());
      expect(responseObject.status).toHaveBeenCalledWith(404);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Client not found",
      });
    });

    it("should return 500 when database error occurs", async () => {
      mockRequest.params = { id: new mongoose.Types.ObjectId().toString() };
      const mockError = new Error("Database query failed");

      const mockPopulate = jest.fn().mockRejectedValue(mockError);
      (Client.findById as jest.Mock).mockReturnValue({
        populate: mockPopulate,
      });

      await getClientById(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Database query failed",
      });
    });

    it("should return 500 when invalid id format is provided", async () => {
      mockRequest.params = { id: "invalid_id" };
      const mockError = new Error("Invalid ID format");

      const mockPopulate = jest.fn().mockRejectedValue(mockError);
      (Client.findById as jest.Mock).mockReturnValue({
        populate: mockPopulate,
      });

      await getClientById(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Invalid ID format",
      });
    });
  });

  describe("updateClient", () => {
    it("should update client successfully and return updated data", async () => {
      const clientId = new mongoose.Types.ObjectId();
      const updateData = {
        name: "John Updated",
        email: "john.updated@example.com",
      };

      const mockUpdatedClient = {
        _id: clientId,
        ...updateData,
        pets: [],
      };

      mockRequest.params = { id: clientId.toString() };
      mockRequest.body = updateData;

      (Client.findByIdAndUpdate as jest.Mock).mockResolvedValue(
        mockUpdatedClient
      );

      await updateClient(mockRequest as Request, mockResponse as Response);

      expect(Client.findByIdAndUpdate).toHaveBeenCalledWith(
        clientId.toString(),
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );
      expect(responseObject.json).toHaveBeenCalledWith(mockUpdatedClient);
      expect(responseObject.status).not.toHaveBeenCalled();
    });

    it("should return 404 when client to update is not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      mockRequest.params = { id: nonExistentId.toString() };
      mockRequest.body = { name: "Updated Name" };

      (Client.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      await updateClient(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(404);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Client not found",
      });
    });

    it("should return 500 when database error occurs during update", async () => {
      mockRequest.params = { id: new mongoose.Types.ObjectId().toString() };
      mockRequest.body = { name: "Test" };
      const mockError = new Error("Database update failed");

      (Client.findByIdAndUpdate as jest.Mock).mockRejectedValue(mockError);

      await updateClient(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Database update failed",
      });
    });

    it("should return 500 when validation error occurs during update", async () => {
      mockRequest.params = { id: new mongoose.Types.ObjectId().toString() };
      mockRequest.body = { email: "invalid-email" };
      const validationError = new Error("Invalid email format");

      (Client.findByIdAndUpdate as jest.Mock).mockRejectedValue(
        validationError
      );

      await updateClient(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Invalid email format",
      });
    });

    it("should handle partial updates", async () => {
      const clientId = new mongoose.Types.ObjectId();
      const partialUpdate = { phone: "987654321" };

      const mockUpdatedClient = {
        _id: clientId,
        name: "John Doe",
        email: "john@example.com",
        phone: "987654321",
        pets: [],
      };

      mockRequest.params = { id: clientId.toString() };
      mockRequest.body = partialUpdate;

      (Client.findByIdAndUpdate as jest.Mock).mockResolvedValue(
        mockUpdatedClient
      );

      await updateClient(mockRequest as Request, mockResponse as Response);

      expect(Client.findByIdAndUpdate).toHaveBeenCalledWith(
        clientId.toString(),
        partialUpdate,
        {
          new: true,
          runValidators: true,
        }
      );
      expect(responseObject.json).toHaveBeenCalledWith(mockUpdatedClient);
    });
  });

  describe("deleteClient", () => {
    it("should delete client and associated pets successfully", async () => {
      const clientId = new mongoose.Types.ObjectId();
      const mockClient = {
        _id: clientId,
        name: "John Doe",
        email: "john@example.com",
        pets: [new mongoose.Types.ObjectId()],
      };

      mockRequest.params = { id: clientId.toString() };

      (Client.findByIdAndDelete as jest.Mock).mockResolvedValue(mockClient);
      (Pet.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 1 });

      await deleteClient(mockRequest as Request, mockResponse as Response);

      expect(Client.findByIdAndDelete).toHaveBeenCalledWith(
        clientId.toString()
      );
      expect(Pet.deleteMany).toHaveBeenCalledWith({ owner: mockClient._id });
      expect(responseObject.json).toHaveBeenCalledWith({
        message: "Client deleted successfully",
      });
      expect(responseObject.status).not.toHaveBeenCalled();
    });

    it("should return 404 when client to delete is not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      mockRequest.params = { id: nonExistentId.toString() };

      (Client.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      await deleteClient(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(404);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Client not found",
      });
      expect(Pet.deleteMany).not.toHaveBeenCalled();
    });

    it("should return 500 when database error occurs during deletion", async () => {
      mockRequest.params = { id: new mongoose.Types.ObjectId().toString() };
      const mockError = new Error("Database deletion failed");

      (Client.findByIdAndDelete as jest.Mock).mockRejectedValue(mockError);

      await deleteClient(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Database deletion failed",
      });
    });

    it("should return 500 when pet deletion fails", async () => {
      const clientId = new mongoose.Types.ObjectId();
      const mockClient = {
        _id: clientId,
        name: "John Doe",
        email: "john@example.com",
        pets: [new mongoose.Types.ObjectId()],
      };

      mockRequest.params = { id: clientId.toString() };

      (Client.findByIdAndDelete as jest.Mock).mockResolvedValue(mockClient);
      (Pet.deleteMany as jest.Mock).mockRejectedValue(
        new Error("Failed to delete pets")
      );

      await deleteClient(mockRequest as Request, mockResponse as Response);

      expect(Client.findByIdAndDelete).toHaveBeenCalledWith(
        clientId.toString()
      );
      expect(Pet.deleteMany).toHaveBeenCalledWith({ owner: mockClient._id });
      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Failed to delete pets",
      });
    });

    it("should delete client with no associated pets", async () => {
      const clientId = new mongoose.Types.ObjectId();
      const mockClient = {
        _id: clientId,
        name: "John Doe",
        email: "john@example.com",
        pets: [],
      };

      mockRequest.params = { id: clientId.toString() };

      (Client.findByIdAndDelete as jest.Mock).mockResolvedValue(mockClient);
      (Pet.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 0 });

      await deleteClient(mockRequest as Request, mockResponse as Response);

      expect(Client.findByIdAndDelete).toHaveBeenCalledWith(
        clientId.toString()
      );
      expect(Pet.deleteMany).toHaveBeenCalledWith({ owner: mockClient._id });
      expect(responseObject.json).toHaveBeenCalledWith({
        message: "Client deleted successfully",
      });
    });
  });
});
