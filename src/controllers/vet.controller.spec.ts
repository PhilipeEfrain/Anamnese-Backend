import { Request, Response } from "express";
import mongoose from "mongoose";
import { registerVet, loginVet } from "./vet.controller";
import Vet from "../models/Vet";
import jwt from "jsonwebtoken";

jest.mock("../models/Vet");
jest.mock("jsonwebtoken");

describe("Vet Controller - Unit Tests", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };

    responseObject = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockResponse = responseObject;

    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret-key";
  });

  describe("registerVet", () => {
    it("should register a new vet successfully and return 201", async () => {
      const vetData = {
        name: "Dr. John Doe",
        crmv: "12345",
        email: "john@vet.com",
        password: "securePassword123",
      };

      const mockCreatedVet = {
        _id: new mongoose.Types.ObjectId(),
        name: "Dr. John Doe",
        crmv: "12345",
        email: "john@vet.com",
      };

      mockRequest.body = vetData;

      (Vet.findOne as jest.Mock).mockResolvedValue(null);
      (Vet.create as jest.Mock).mockResolvedValue(mockCreatedVet);

      await registerVet(mockRequest as Request, mockResponse as Response);

      expect(Vet.findOne).toHaveBeenCalledWith({ email: vetData.email });
      expect(Vet.create).toHaveBeenCalledWith({
        name: vetData.name,
        crmv: vetData.crmv,
        email: vetData.email,
        password: vetData.password,
      });
      expect(responseObject.status).toHaveBeenCalledWith(201);
      expect(responseObject.json).toHaveBeenCalledWith({
        message: "Vet registered successfully",
        vet: {
          id: mockCreatedVet._id,
          name: mockCreatedVet.name,
          crmv: mockCreatedVet.crmv,
          email: mockCreatedVet.email,
        },
      });
    });

    it("should return 400 when email already exists", async () => {
      const existingVet = {
        _id: new mongoose.Types.ObjectId(),
        name: "Dr. Jane Smith",
        email: "jane@vet.com",
        crmv: "54321",
      };

      mockRequest.body = {
        name: "Dr. John Doe",
        crmv: "12345",
        email: "jane@vet.com",
        password: "password123",
      };

      (Vet.findOne as jest.Mock).mockResolvedValue(existingVet);

      await registerVet(mockRequest as Request, mockResponse as Response);

      expect(Vet.findOne).toHaveBeenCalledWith({ email: "jane@vet.com" });
      expect(Vet.create).not.toHaveBeenCalled();
      expect(responseObject.status).toHaveBeenCalledWith(400);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Email already in use",
      });
    });

    it("should return 500 when database error occurs during registration", async () => {
      mockRequest.body = {
        name: "Dr. John Doe",
        crmv: "12345",
        email: "john@vet.com",
        password: "password123",
      };

      (Vet.findOne as jest.Mock).mockRejectedValue(
        new Error("Database connection failed")
      );

      await registerVet(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Server error",
      });
    });

    it("should return 500 when vet creation fails", async () => {
      mockRequest.body = {
        name: "Dr. John Doe",
        crmv: "12345",
        email: "john@vet.com",
        password: "password123",
      };

      (Vet.findOne as jest.Mock).mockResolvedValue(null);
      (Vet.create as jest.Mock).mockRejectedValue(
        new Error("Validation failed")
      );

      await registerVet(mockRequest as Request, mockResponse as Response);

      expect(Vet.findOne).toHaveBeenCalledWith({ email: "john@vet.com" });
      expect(Vet.create).toHaveBeenCalled();
      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Server error",
      });
    });

    it("should handle registration with all required fields", async () => {
      const completeVetData = {
        name: "Dr. Maria Silva",
        crmv: "SP-98765",
        email: "maria@vet.com",
        password: "strongPassword456!",
      };

      const mockCreatedVet = {
        _id: new mongoose.Types.ObjectId(),
        name: "Dr. Maria Silva",
        crmv: "SP-98765",
        email: "maria@vet.com",
      };

      mockRequest.body = completeVetData;

      (Vet.findOne as jest.Mock).mockResolvedValue(null);
      (Vet.create as jest.Mock).mockResolvedValue(mockCreatedVet);

      await registerVet(mockRequest as Request, mockResponse as Response);

      expect(Vet.create).toHaveBeenCalledWith(completeVetData);
      expect(responseObject.status).toHaveBeenCalledWith(201);
      expect(responseObject.json).toHaveBeenCalledWith({
        message: "Vet registered successfully",
        vet: {
          id: mockCreatedVet._id,
          name: mockCreatedVet.name,
          crmv: mockCreatedVet.crmv,
          email: mockCreatedVet.email,
        },
      });
    });

    it("should return 500 when findOne throws unexpected error", async () => {
      mockRequest.body = {
        name: "Dr. John Doe",
        crmv: "12345",
        email: "john@vet.com",
        password: "password123",
      };

      (Vet.findOne as jest.Mock).mockRejectedValue(
        new Error("Unexpected error")
      );

      await registerVet(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Server error",
      });
    });
  });

  describe("loginVet", () => {
    it("should login successfully and return JWT token", async () => {
      const loginData = {
        email: "john@vet.com",
        password: "password123",
      };

      const vetId = new mongoose.Types.ObjectId();
      const mockVet = {
        _id: vetId,
        email: "john@vet.com",
        name: "Dr. John Doe",
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      const mockToken = "mock-jwt-token-12345";

      mockRequest.body = loginData;

      (Vet.findOne as jest.Mock).mockResolvedValue(mockVet);
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      await loginVet(mockRequest as Request, mockResponse as Response);

      expect(Vet.findOne).toHaveBeenCalledWith({ email: loginData.email });
      expect(mockVet.comparePassword).toHaveBeenCalledWith(loginData.password);
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: vetId, email: mockVet.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      expect(responseObject.json).toHaveBeenCalledWith({ token: mockToken });
      expect(responseObject.status).not.toHaveBeenCalled();
    });

    it("should return 404 when user is not found", async () => {
      mockRequest.body = {
        email: "nonexistent@vet.com",
        password: "password123",
      };

      (Vet.findOne as jest.Mock).mockResolvedValue(null);

      await loginVet(mockRequest as Request, mockResponse as Response);

      expect(Vet.findOne).toHaveBeenCalledWith({
        email: "nonexistent@vet.com",
      });
      expect(responseObject.status).toHaveBeenCalledWith(404);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "User not found",
      });
    });

    it("should return 400 when password is incorrect", async () => {
      const mockVet = {
        _id: new mongoose.Types.ObjectId(),
        email: "john@vet.com",
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      mockRequest.body = {
        email: "john@vet.com",
        password: "wrongpassword",
      };

      (Vet.findOne as jest.Mock).mockResolvedValue(mockVet);

      await loginVet(mockRequest as Request, mockResponse as Response);

      expect(Vet.findOne).toHaveBeenCalledWith({ email: "john@vet.com" });
      expect(mockVet.comparePassword).toHaveBeenCalledWith("wrongpassword");
      expect(responseObject.status).toHaveBeenCalledWith(400);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Wrong password",
      });
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it("should return 500 when database error occurs during login", async () => {
      mockRequest.body = {
        email: "john@vet.com",
        password: "password123",
      };

      (Vet.findOne as jest.Mock).mockRejectedValue(
        new Error("Database connection failed")
      );

      await loginVet(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Server error",
      });
    });

    it("should return 500 when comparePassword throws an error", async () => {
      const mockVet = {
        _id: new mongoose.Types.ObjectId(),
        email: "john@vet.com",
        comparePassword: jest
          .fn()
          .mockRejectedValue(new Error("Password comparison failed")),
      };

      mockRequest.body = {
        email: "john@vet.com",
        password: "password123",
      };

      (Vet.findOne as jest.Mock).mockResolvedValue(mockVet);

      await loginVet(mockRequest as Request, mockResponse as Response);

      expect(mockVet.comparePassword).toHaveBeenCalledWith("password123");
      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Server error",
      });
    });

    it("should return 500 when JWT signing fails", async () => {
      const mockVet = {
        _id: new mongoose.Types.ObjectId(),
        email: "john@vet.com",
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      mockRequest.body = {
        email: "john@vet.com",
        password: "password123",
      };

      (Vet.findOne as jest.Mock).mockResolvedValue(mockVet);
      (jwt.sign as jest.Mock).mockImplementation(() => {
        throw new Error("JWT signing failed");
      });

      await loginVet(mockRequest as Request, mockResponse as Response);

      expect(mockVet.comparePassword).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalled();
      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Server error",
      });
    });

    it("should handle login with correct credentials and generate valid token", async () => {
      const vetId = new mongoose.Types.ObjectId();
      const mockVet = {
        _id: vetId,
        email: "maria@vet.com",
        name: "Dr. Maria Silva",
        crmv: "SP-12345",
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      const expectedToken = "valid-jwt-token-xyz";

      mockRequest.body = {
        email: "maria@vet.com",
        password: "correctPassword123",
      };

      (Vet.findOne as jest.Mock).mockResolvedValue(mockVet);
      (jwt.sign as jest.Mock).mockReturnValue(expectedToken);

      await loginVet(mockRequest as Request, mockResponse as Response);

      expect(Vet.findOne).toHaveBeenCalledWith({ email: "maria@vet.com" });
      expect(mockVet.comparePassword).toHaveBeenCalledWith(
        "correctPassword123"
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: vetId, email: "maria@vet.com" },
        "test-secret-key",
        { expiresIn: "1h" }
      );
      expect(responseObject.json).toHaveBeenCalledWith({
        token: expectedToken,
      });
    });
  });
});
