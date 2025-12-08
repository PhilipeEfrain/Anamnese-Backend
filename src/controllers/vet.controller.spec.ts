import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  registerVet,
  loginVet,
  refreshAccessToken,
  logout,
} from "./vet.controller";
import Vet from "../models/Vet";
import RefreshToken from "../models/RefreshToken";
import jwt from "jsonwebtoken";
import crypto from "crypto";

jest.mock("../models/Vet");
jest.mock("../models/RefreshToken");
jest.mock("jsonwebtoken");
jest.mock("crypto");

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
    it("should login successfully and return access token and refresh token", async () => {
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

      const mockAccessToken = "mock-jwt-token-12345";
      const mockRefreshToken = "mock-refresh-token-67890";

      mockRequest.body = loginData;

      (Vet.findOne as jest.Mock).mockResolvedValue(mockVet);
      (jwt.sign as jest.Mock).mockReturnValue(mockAccessToken);
      (crypto.randomBytes as jest.Mock).mockReturnValue({
        toString: jest.fn().mockReturnValue(mockRefreshToken),
      });
      (RefreshToken.create as jest.Mock).mockResolvedValue({});

      await loginVet(mockRequest as Request, mockResponse as Response);

      expect(Vet.findOne).toHaveBeenCalledWith({ email: loginData.email });
      expect(mockVet.comparePassword).toHaveBeenCalledWith(loginData.password);
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: vetId, email: mockVet.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      expect(crypto.randomBytes).toHaveBeenCalledWith(64);
      expect(RefreshToken.create).toHaveBeenCalled();
      expect(responseObject.json).toHaveBeenCalledWith({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
        expiresIn: 3600,
      });
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
      expect(crypto.randomBytes).toHaveBeenCalled();
      expect(RefreshToken.create).toHaveBeenCalled();
    });
  });

  describe("refreshAccessToken", () => {
    it("should refresh access token successfully", async () => {
      const mockRefreshToken = "valid-refresh-token";
      const vetId = new mongoose.Types.ObjectId();
      const mockStoredToken = {
        _id: new mongoose.Types.ObjectId(),
        vet: vetId,
        token: mockRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };
      const mockVet = {
        _id: vetId,
        email: "john@vet.com",
      };
      const mockNewAccessToken = "new-access-token-123";

      mockRequest.body = { refreshToken: mockRefreshToken };

      (RefreshToken.findOne as jest.Mock).mockResolvedValue(mockStoredToken);
      (Vet.findById as jest.Mock).mockResolvedValue(mockVet);
      (jwt.sign as jest.Mock).mockReturnValue(mockNewAccessToken);

      await refreshAccessToken(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(RefreshToken.findOne).toHaveBeenCalledWith({
        token: mockRefreshToken,
      });
      expect(Vet.findById).toHaveBeenCalledWith(vetId);
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: vetId, email: mockVet.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      expect(responseObject.json).toHaveBeenCalledWith({
        accessToken: mockNewAccessToken,
        expiresIn: 3600,
      });
    });

    it("should return 400 when refresh token is not provided", async () => {
      mockRequest.body = {};

      await refreshAccessToken(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(responseObject.status).toHaveBeenCalledWith(400);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Refresh token is required",
      });
    });

    it("should return 401 when refresh token is invalid", async () => {
      mockRequest.body = { refreshToken: "invalid-token" };

      (RefreshToken.findOne as jest.Mock).mockResolvedValue(null);

      await refreshAccessToken(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(RefreshToken.findOne).toHaveBeenCalledWith({
        token: "invalid-token",
      });
      expect(responseObject.status).toHaveBeenCalledWith(401);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Invalid refresh token",
      });
    });

    it("should return 401 when refresh token is expired", async () => {
      const expiredToken = {
        _id: new mongoose.Types.ObjectId(),
        vet: new mongoose.Types.ObjectId(),
        token: "expired-token",
        expiresAt: new Date(Date.now() - 1000),
      };

      mockRequest.body = { refreshToken: "expired-token" };

      (RefreshToken.findOne as jest.Mock).mockResolvedValue(expiredToken);
      (RefreshToken.deleteOne as jest.Mock).mockResolvedValue({});

      await refreshAccessToken(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(RefreshToken.deleteOne).toHaveBeenCalledWith({
        _id: expiredToken._id,
      });
      expect(responseObject.status).toHaveBeenCalledWith(401);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Refresh token expired",
      });
    });

    it("should return 404 when vet not found", async () => {
      const mockStoredToken = {
        _id: new mongoose.Types.ObjectId(),
        vet: new mongoose.Types.ObjectId(),
        token: "valid-token",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      mockRequest.body = { refreshToken: "valid-token" };

      (RefreshToken.findOne as jest.Mock).mockResolvedValue(mockStoredToken);
      (Vet.findById as jest.Mock).mockResolvedValue(null);

      await refreshAccessToken(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(responseObject.status).toHaveBeenCalledWith(404);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "User not found",
      });
    });

    it("should return 500 on server error", async () => {
      mockRequest.body = { refreshToken: "valid-token" };

      (RefreshToken.findOne as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await refreshAccessToken(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Server error",
      });
    });
  });

  describe("logout", () => {
    it("should logout successfully", async () => {
      const mockRefreshToken = "valid-refresh-token";

      mockRequest.body = { refreshToken: mockRefreshToken };

      (RefreshToken.deleteOne as jest.Mock).mockResolvedValue({
        deletedCount: 1,
      });

      await logout(mockRequest as Request, mockResponse as Response);

      expect(RefreshToken.deleteOne).toHaveBeenCalledWith({
        token: mockRefreshToken,
      });
      expect(responseObject.json).toHaveBeenCalledWith({
        message: "Logged out successfully",
      });
    });

    it("should return 400 when refresh token is not provided", async () => {
      mockRequest.body = {};

      await logout(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(400);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Refresh token is required",
      });
    });

    it("should return 500 on server error", async () => {
      mockRequest.body = { refreshToken: "some-token" };

      (RefreshToken.deleteOne as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await logout(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Server error",
      });
    });
  });
});
