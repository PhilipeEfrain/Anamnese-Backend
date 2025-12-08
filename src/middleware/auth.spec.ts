import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { authenticateVet } from "./auth";

jest.mock("jsonwebtoken");

describe("Auth Middleware - Unit Tests", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let responseObject: any;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };

    responseObject = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockResponse = responseObject;
    mockNext = jest.fn();

    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret-key";
  });

  describe("authenticateVet", () => {
    it("should authenticate successfully with valid token", () => {
      const mockPayload = {
        id: "123456",
        email: "vet@example.com",
      };

      mockRequest.headers = {
        authorization: "Bearer valid-token-12345",
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      authenticateVet(
        mockRequest as Request & { vet?: any },
        mockResponse as Response,
        mockNext
      );

      expect(jwt.verify).toHaveBeenCalledWith(
        "valid-token-12345",
        process.env.JWT_SECRET
      );
      expect((mockRequest as any).vet).toEqual(mockPayload);
      expect(mockNext).toHaveBeenCalled();
      expect(responseObject.status).not.toHaveBeenCalled();
      expect(responseObject.json).not.toHaveBeenCalled();
    });

    it("should return 401 when authorization header is missing", () => {
      mockRequest.headers = {};

      authenticateVet(
        mockRequest as Request & { vet?: any },
        mockResponse as Response,
        mockNext
      );

      expect(responseObject.status).toHaveBeenCalledWith(401);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Token não fornecido",
      });
      expect(mockNext).not.toHaveBeenCalled();
      expect(jwt.verify).not.toHaveBeenCalled();
    });

    it("should return 401 when authorization header does not start with Bearer", () => {
      mockRequest.headers = {
        authorization: "Basic some-credentials",
      };

      authenticateVet(
        mockRequest as Request & { vet?: any },
        mockResponse as Response,
        mockNext
      );

      expect(responseObject.status).toHaveBeenCalledWith(401);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Token não fornecido",
      });
      expect(mockNext).not.toHaveBeenCalled();
      expect(jwt.verify).not.toHaveBeenCalled();
    });

    it("should return 401 when authorization header is just Bearer without token", () => {
      mockRequest.headers = {
        authorization: "Bearer ",
      };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("jwt malformed");
      });

      authenticateVet(
        mockRequest as Request & { vet?: any },
        mockResponse as Response,
        mockNext
      );

      expect(responseObject.status).toHaveBeenCalledWith(401);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Token inválido",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 when token is invalid", () => {
      mockRequest.headers = {
        authorization: "Bearer invalid-token",
      };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("invalid token");
      });

      authenticateVet(
        mockRequest as Request & { vet?: any },
        mockResponse as Response,
        mockNext
      );

      expect(jwt.verify).toHaveBeenCalledWith(
        "invalid-token",
        process.env.JWT_SECRET
      );
      expect(responseObject.status).toHaveBeenCalledWith(401);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Token inválido",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 when token is expired", () => {
      mockRequest.headers = {
        authorization: "Bearer expired-token",
      };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        const error: any = new Error("jwt expired");
        error.name = "TokenExpiredError";
        throw error;
      });

      authenticateVet(
        mockRequest as Request & { vet?: any },
        mockResponse as Response,
        mockNext
      );

      expect(responseObject.status).toHaveBeenCalledWith(401);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Token inválido",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 when token verification throws JsonWebTokenError", () => {
      mockRequest.headers = {
        authorization: "Bearer malformed-token",
      };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        const error: any = new Error("jwt malformed");
        error.name = "JsonWebTokenError";
        throw error;
      });

      authenticateVet(
        mockRequest as Request & { vet?: any },
        mockResponse as Response,
        mockNext
      );

      expect(responseObject.status).toHaveBeenCalledWith(401);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Token inválido",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should attach decoded payload to request object", () => {
      const mockPayload = {
        id: "vet-id-789",
        email: "veterinarian@clinic.com",
      };

      mockRequest.headers = {
        authorization: "Bearer valid-jwt-token",
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      const extendedRequest = mockRequest as Request & { vet?: any };

      authenticateVet(extendedRequest, mockResponse as Response, mockNext);

      expect(extendedRequest.vet).toBeDefined();
      expect(extendedRequest.vet?.id).toBe("vet-id-789");
      expect(extendedRequest.vet?.email).toBe("veterinarian@clinic.com");
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should return 401 when authorization is null", () => {
      mockRequest.headers = {
        authorization: null as any,
      };

      authenticateVet(
        mockRequest as Request & { vet?: any },
        mockResponse as Response,
        mockNext
      );

      expect(responseObject.status).toHaveBeenCalledWith(401);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Token não fornecido",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 when authorization is undefined", () => {
      mockRequest.headers = {
        authorization: undefined,
      };

      authenticateVet(
        mockRequest as Request & { vet?: any },
        mockResponse as Response,
        mockNext
      );

      expect(responseObject.status).toHaveBeenCalledWith(401);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Token não fornecido",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 for bearer with lowercase", () => {
      mockRequest.headers = {
        authorization: "bearer lowercase-token",
      };

      authenticateVet(
        mockRequest as Request & { vet?: any },
        mockResponse as Response,
        mockNext
      );

      expect(responseObject.status).toHaveBeenCalledWith(401);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Token não fornecido",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle any error thrown by jwt.verify", () => {
      mockRequest.headers = {
        authorization: "Bearer some-token",
      };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("Unexpected JWT error");
      });

      authenticateVet(
        mockRequest as Request & { vet?: any },
        mockResponse as Response,
        mockNext
      );

      expect(responseObject.status).toHaveBeenCalledWith(401);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Token inválido",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
