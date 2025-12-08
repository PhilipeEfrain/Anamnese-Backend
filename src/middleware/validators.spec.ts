import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import {
  handleValidationErrors,
  validateVetRegistration,
  validateVetLogin,
  validateClientCreation,
  validatePetCreation,
  validateAnamneseCreation,
} from "./validators";

jest.mock("express-validator", () => ({
  body: jest.fn(() => ({
    trim: jest.fn().mockReturnThis(),
    notEmpty: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis(),
    isEmail: jest.fn().mockReturnThis(),
    normalizeEmail: jest.fn().mockReturnThis(),
    isLength: jest.fn().mockReturnThis(),
    matches: jest.fn().mockReturnThis(),
    optional: jest.fn().mockReturnThis(),
    isMongoId: jest.fn().mockReturnThis(),
    isInt: jest.fn().mockReturnThis(),
    isFloat: jest.fn().mockReturnThis(),
    isObject: jest.fn().mockReturnThis(),
  })),
  validationResult: jest.fn(),
}));

describe("Validators Middleware - Unit Tests", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
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
    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe("handleValidationErrors", () => {
    it("should call next when there are no validation errors", () => {
      (validationResult as any).mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      });

      handleValidationErrors(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(responseObject.status).not.toHaveBeenCalled();
      expect(responseObject.json).not.toHaveBeenCalled();
    });

    it("should return 400 when validation errors exist", () => {
      const mockErrors = [
        { msg: "Name is required", param: "name" },
        { msg: "Email is invalid", param: "email" },
      ];

      (validationResult as any).mockReturnValue({
        isEmpty: () => false,
        array: () => mockErrors,
      });

      handleValidationErrors(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(responseObject.status).toHaveBeenCalledWith(400);
      expect(responseObject.json).toHaveBeenCalledWith({
        status: "error",
        errors: mockErrors,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return errors array with all validation failures", () => {
      const mockErrors = [
        { msg: "Field 1 error", param: "field1" },
        { msg: "Field 2 error", param: "field2" },
        { msg: "Field 3 error", param: "field3" },
      ];

      (validationResult as any).mockReturnValue({
        isEmpty: () => false,
        array: () => mockErrors,
      });

      handleValidationErrors(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(responseObject.json).toHaveBeenCalledWith({
        status: "error",
        errors: mockErrors,
      });
    });

    it("should handle single validation error", () => {
      const mockErrors = [{ msg: "Email is required", param: "email" }];

      (validationResult as any).mockReturnValue({
        isEmpty: () => false,
        array: () => mockErrors,
      });

      handleValidationErrors(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(responseObject.status).toHaveBeenCalledWith(400);
      expect(responseObject.json).toHaveBeenCalledWith({
        status: "error",
        errors: mockErrors,
      });
    });

    it("should handle empty errors array as valid", () => {
      (validationResult as any).mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      });

      handleValidationErrors(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(responseObject.status).not.toHaveBeenCalled();
    });
  });

  describe("validateVetRegistration", () => {
    it("should be an array of validators", () => {
      expect(Array.isArray(validateVetRegistration)).toBe(true);
    });

    it("should have correct number of validators including error handler", () => {
      expect(validateVetRegistration.length).toBeGreaterThan(0);
    });

    it("should include handleValidationErrors as last element", () => {
      const lastElement =
        validateVetRegistration[validateVetRegistration.length - 1];
      expect(lastElement).toBe(handleValidationErrors);
    });

    it("should have validators for all required fields", () => {
      expect(validateVetRegistration.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe("validateVetLogin", () => {
    it("should be an array of validators", () => {
      expect(Array.isArray(validateVetLogin)).toBe(true);
    });

    it("should have validators for email and password", () => {
      expect(validateVetLogin.length).toBeGreaterThanOrEqual(3);
    });

    it("should include handleValidationErrors as last element", () => {
      const lastElement = validateVetLogin[validateVetLogin.length - 1];
      expect(lastElement).toBe(handleValidationErrors);
    });

    it("should have fewer validators than registration", () => {
      expect(validateVetLogin.length).toBeLessThan(
        validateVetRegistration.length
      );
    });
  });

  describe("validateClientCreation", () => {
    it("should be an array of validators", () => {
      expect(Array.isArray(validateClientCreation)).toBe(true);
    });

    it("should have validators for required client fields", () => {
      expect(validateClientCreation.length).toBeGreaterThanOrEqual(4);
    });

    it("should include handleValidationErrors as last element", () => {
      const lastElement =
        validateClientCreation[validateClientCreation.length - 1];
      expect(lastElement).toBe(handleValidationErrors);
    });

    it("should validate name, phone, and optional email", () => {
      expect(validateClientCreation.length).toBeGreaterThan(0);
      expect(validateClientCreation).toContain(handleValidationErrors);
    });
  });

  describe("validatePetCreation", () => {
    it("should be an array of validators", () => {
      expect(Array.isArray(validatePetCreation)).toBe(true);
    });

    it("should have validators for required pet fields", () => {
      expect(validatePetCreation.length).toBeGreaterThanOrEqual(4);
    });

    it("should include handleValidationErrors as last element", () => {
      const lastElement = validatePetCreation[validatePetCreation.length - 1];
      expect(lastElement).toBe(handleValidationErrors);
    });

    it("should validate owner, name, species and optional fields", () => {
      expect(validatePetCreation.length).toBeGreaterThan(3);
      expect(validatePetCreation).toContain(handleValidationErrors);
    });
  });

  describe("validateAnamneseCreation", () => {
    it("should be an array of validators", () => {
      expect(Array.isArray(validateAnamneseCreation)).toBe(true);
    });

    it("should have validators for required anamnese fields", () => {
      expect(validateAnamneseCreation.length).toBeGreaterThanOrEqual(3);
    });

    it("should include handleValidationErrors as last element", () => {
      const lastElement =
        validateAnamneseCreation[validateAnamneseCreation.length - 1];
      expect(lastElement).toBe(handleValidationErrors);
    });

    it("should validate pet and reason as required fields", () => {
      expect(validateAnamneseCreation.length).toBeGreaterThan(2);
      expect(validateAnamneseCreation).toContain(handleValidationErrors);
    });
  });

  describe("Validator arrays structure", () => {
    it("all validator arrays should end with handleValidationErrors", () => {
      const validators = [
        validateVetRegistration,
        validateVetLogin,
        validateClientCreation,
        validatePetCreation,
        validateAnamneseCreation,
      ];

      validators.forEach((validatorArray) => {
        const lastElement = validatorArray[validatorArray.length - 1];
        expect(lastElement).toBe(handleValidationErrors);
      });
    });

    it("all validator arrays should be non-empty", () => {
      const validators = [
        validateVetRegistration,
        validateVetLogin,
        validateClientCreation,
        validatePetCreation,
        validateAnamneseCreation,
      ];

      validators.forEach((validatorArray) => {
        expect(validatorArray.length).toBeGreaterThan(0);
      });
    });

    it("registration validator should have minimum required validators", () => {
      expect(validateVetRegistration.length).toBeGreaterThanOrEqual(5);
      expect(validateVetLogin.length).toBeGreaterThanOrEqual(3);
      expect(validateClientCreation.length).toBeGreaterThanOrEqual(4);
      expect(validatePetCreation.length).toBeGreaterThanOrEqual(4);
      expect(validateAnamneseCreation.length).toBeGreaterThanOrEqual(3);
    });
  });
});
