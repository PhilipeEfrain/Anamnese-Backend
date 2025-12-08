import { Request, Response, NextFunction } from "express";
import { AppError, errorHandler, asyncHandler } from "./errorHandler";

describe("ErrorHandler Middleware - Unit Tests", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let responseObject: any;

  beforeEach(() => {
    mockRequest = {};

    responseObject = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockResponse = responseObject;
    mockNext = jest.fn();

    jest.clearAllMocks();
    delete process.env.NODE_ENV;
  });

  describe("AppError", () => {
    it("should create an AppError instance with correct properties", () => {
      const error = new AppError("Test error message", 404);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe("Test error message");
      expect(error.statusCode).toBe(404);
      expect(error.isOperational).toBe(true);
      expect(error.stack).toBeDefined();
    });

    it("should capture stack trace correctly", () => {
      const error = new AppError("Stack trace test", 500);

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe("string");
      expect(error.stack!.length).toBeGreaterThan(0);
    });

    it("should create AppError with different status codes", () => {
      const error400 = new AppError("Bad request", 400);
      const error401 = new AppError("Unauthorized", 401);
      const error500 = new AppError("Server error", 500);

      expect(error400.statusCode).toBe(400);
      expect(error401.statusCode).toBe(401);
      expect(error500.statusCode).toBe(500);
    });
  });

  describe("errorHandler", () => {
    it("should handle generic errors with default status 500", () => {
      const error = new Error("Generic error");

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        status: "error",
        message: "Generic error",
      });
    });

    it("should handle AppError with custom status code", () => {
      const error = new AppError("Custom error", 403);

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(responseObject.status).toHaveBeenCalledWith(403);
      expect(responseObject.json).toHaveBeenCalledWith({
        status: "error",
        message: "Custom error",
      });
    });

    it("should handle Mongoose ValidationError", () => {
      const error: any = {
        name: "ValidationError",
        errors: {
          name: { message: "Name is required" },
          email: { message: "Email is invalid" },
        },
      };

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(responseObject.status).toHaveBeenCalledWith(400);
      expect(responseObject.json).toHaveBeenCalledWith({
        status: "error",
        message: "Name is required, Email is invalid",
      });
    });

    it("should handle Mongoose duplicate key error (code 11000)", () => {
      const error: any = {
        code: 11000,
        keyPattern: { email: 1 },
      };

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(responseObject.status).toHaveBeenCalledWith(400);
      expect(responseObject.json).toHaveBeenCalledWith({
        status: "error",
        message: "email já existe",
      });
    });

    it("should handle Mongoose CastError", () => {
      const error: any = {
        name: "CastError",
        message: "Cast to ObjectId failed",
      };

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(responseObject.status).toHaveBeenCalledWith(400);
      expect(responseObject.json).toHaveBeenCalledWith({
        status: "error",
        message: "Formato de ID inválido",
      });
    });

    it("should handle JsonWebTokenError", () => {
      const error: any = {
        name: "JsonWebTokenError",
        message: "invalid token",
      };

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(responseObject.status).toHaveBeenCalledWith(401);
      expect(responseObject.json).toHaveBeenCalledWith({
        status: "error",
        message: "Token inválido",
      });
    });

    it("should handle TokenExpiredError", () => {
      const error: any = {
        name: "TokenExpiredError",
        message: "jwt expired",
      };

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(responseObject.status).toHaveBeenCalledWith(401);
      expect(responseObject.json).toHaveBeenCalledWith({
        status: "error",
        message: "Token expirado",
      });
    });

    it("should include stack trace in development mode", () => {
      process.env.NODE_ENV = "development";
      const error = new Error("Development error");
      error.stack = "Error stack trace here";

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(responseObject.json).toHaveBeenCalledWith({
        status: "error",
        message: "Development error",
        stack: "Error stack trace here",
      });
    });

    it("should not include stack trace in production mode", () => {
      process.env.NODE_ENV = "production";
      const error = new AppError("Production error", 400);

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      const jsonCall = responseObject.json.mock.calls[0][0];
      expect(jsonCall).toEqual({
        status: "error",
        message: "Production error",
      });
      expect(jsonCall.stack).toBeUndefined();
    });

    it("should hide non-operational errors in production", () => {
      process.env.NODE_ENV = "production";
      const error = new Error("Internal system error");
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(consoleSpy).toHaveBeenCalledWith("ERROR 💥", error);
      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        status: "error",
        message: "Algo deu errado",
      });

      consoleSpy.mockRestore();
    });

    it("should show operational errors in production", () => {
      process.env.NODE_ENV = "production";
      const error = new AppError("User not found", 404);

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(responseObject.status).toHaveBeenCalledWith(404);
      expect(responseObject.json).toHaveBeenCalledWith({
        status: "error",
        message: "User not found",
      });
    });

    it("should handle error with custom statusCode property", () => {
      const error: any = {
        statusCode: 422,
        message: "Unprocessable entity",
      };

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(responseObject.status).toHaveBeenCalledWith(422);
      expect(responseObject.json).toHaveBeenCalledWith({
        status: "error",
        message: "Unprocessable entity",
      });
    });

    it("should handle Mongoose ValidationError with single field", () => {
      const error: any = {
        name: "ValidationError",
        errors: {
          email: { message: "Email is required" },
        },
      };

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(responseObject.status).toHaveBeenCalledWith(400);
      expect(responseObject.json).toHaveBeenCalledWith({
        status: "error",
        message: "Email is required",
      });
    });

    it("should handle duplicate key error with multiple fields", () => {
      const error: any = {
        code: 11000,
        keyPattern: { username: 1, email: 1 },
      };

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(responseObject.status).toHaveBeenCalledWith(400);
      expect(responseObject.json).toHaveBeenCalledWith({
        status: "error",
        message: "username já existe",
      });
    });

    it("should use default message when error has no message", () => {
      const error: any = {};

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        status: "error",
        message: "Internal Server Error",
      });
    });
  });

  describe("asyncHandler", () => {
    it("should call the wrapped function and proceed normally on success", async () => {
      const mockFunction = jest.fn().mockResolvedValue("success");
      const wrappedFunction = asyncHandler(mockFunction);

      await wrappedFunction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFunction).toHaveBeenCalledWith(
        mockRequest,
        mockResponse,
        mockNext
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should catch errors and pass them to next", async () => {
      const mockError = new Error("Async error");
      const mockFunction = jest.fn().mockRejectedValue(mockError);
      const wrappedFunction = asyncHandler(mockFunction);

      await wrappedFunction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFunction).toHaveBeenCalledWith(
        mockRequest,
        mockResponse,
        mockNext
      );
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });

    it("should handle errors in async functions", async () => {
      const mockError = new Error("Async error");
      const mockFunction = jest.fn().mockRejectedValue(mockError);
      const wrappedFunction = asyncHandler(mockFunction);

      await wrappedFunction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(mockError);
    });

    it("should handle AppError instances", async () => {
      const mockError = new AppError("Custom async error", 400);
      const mockFunction = jest.fn().mockRejectedValue(mockError);
      const wrappedFunction = asyncHandler(mockFunction);

      await wrappedFunction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(mockError);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should work with async route handlers that return values", async () => {
      const mockFunction = jest.fn(async (req: Request, res: Response) => {
        res.status(200).json({ data: "test" });
      });
      const wrappedFunction = asyncHandler(mockFunction);

      await wrappedFunction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFunction).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle database connection errors", async () => {
      const dbError = new Error("Database connection failed");
      const mockFunction = jest.fn().mockRejectedValue(dbError);
      const wrappedFunction = asyncHandler(mockFunction);

      await wrappedFunction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(dbError);
    });

    it("should preserve error properties when passing to next", async () => {
      const customError: any = new Error("Custom error");
      customError.statusCode = 404;
      customError.isOperational = true;

      const mockFunction = jest.fn().mockRejectedValue(customError);
      const wrappedFunction = asyncHandler(mockFunction);

      await wrappedFunction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(customError);
      const passedError = (mockNext as jest.Mock).mock.calls[0][0];
      expect(passedError.statusCode).toBe(404);
      expect(passedError.isOperational).toBe(true);
    });
  });
});
