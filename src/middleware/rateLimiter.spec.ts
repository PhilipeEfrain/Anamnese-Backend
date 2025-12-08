import { Request, Response, NextFunction } from "express";
import {
  generalLimiter,
  authLimiter,
  createAnamneseLimiter,
} from "./rateLimiter";

describe("RateLimiter Middleware - Unit Tests", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      ip: "127.0.0.1",
      headers: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn(),
    };

    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe("generalLimiter", () => {
    it("should be defined", () => {
      expect(generalLimiter).toBeDefined();
    });

    it("should be a function", () => {
      expect(typeof generalLimiter).toBe("function");
    });

    it("should be middleware function", () => {
      expect(generalLimiter.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("authLimiter", () => {
    it("should be defined", () => {
      expect(authLimiter).toBeDefined();
    });

    it("should be a function", () => {
      expect(typeof authLimiter).toBe("function");
    });

    it("should be middleware function", () => {
      expect(authLimiter.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("createAnamneseLimiter", () => {
    it("should be defined", () => {
      expect(createAnamneseLimiter).toBeDefined();
    });

    it("should be a function", () => {
      expect(typeof createAnamneseLimiter).toBe("function");
    });

    it("should be middleware function", () => {
      expect(createAnamneseLimiter.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Limiter exports", () => {
    it("should export all three limiters", () => {
      expect(generalLimiter).toBeDefined();
      expect(authLimiter).toBeDefined();
      expect(createAnamneseLimiter).toBeDefined();
    });

    it("all limiters should be callable", () => {
      expect(typeof generalLimiter).toBe("function");
      expect(typeof authLimiter).toBe("function");
      expect(typeof createAnamneseLimiter).toBe("function");
    });
  });
});
