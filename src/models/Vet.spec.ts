import mongoose from "mongoose";
import Vet from "./Vet";
import bcrypt from "bcryptjs";

jest.mock("bcryptjs");

describe("Vet Model - Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Schema Definition", () => {
    it("should have email field as required", () => {
      const vet = new Vet();
      const validationError = vet.validateSync();

      expect(validationError?.errors.email).toBeDefined();
    });

    it("should have password field as required", () => {
      const vet = new Vet();
      const validationError = vet.validateSync();

      expect(validationError?.errors.password).toBeDefined();
    });

    it("should convert email to lowercase", () => {
      const vet = new Vet({
        email: "TEST@EXAMPLE.COM",
        password: "password123",
      });

      expect(vet.email).toBe("test@example.com");
    });

    it("should create a valid vet with all required fields", () => {
      const vet = new Vet({
        email: "vet@example.com",
        password: "password123",
      });

      const validationError = vet.validateSync();
      expect(validationError).toBeUndefined();
    });
  });

  describe("Password Hashing (pre-save hook logic)", () => {
    it("should have a pre-save hook registered", () => {
      const preSaveHooks = (Vet.schema as any).s?.hooks?._pres?.get("save");

      expect(preSaveHooks).toBeDefined();
      expect(preSaveHooks.length).toBeGreaterThan(0);
    });

    it("should execute pre-save hook and hash password when modified", async () => {
      (bcrypt.genSalt as jest.Mock).mockResolvedValue("mockSalt");
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");

      const preSaveHooks = (Vet.schema as any).s.hooks._pres.get("save");
      const passwordHashingHook = preSaveHooks.find((hook: any) =>
        hook.fn.toString().includes("isModified")
      );

      const mockDoc = {
        isModified: jest.fn().mockReturnValue(true),
        password: "plainPassword",
      };

      await passwordHashingHook.fn.call(mockDoc);

      expect(mockDoc.isModified).toHaveBeenCalledWith("password");
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith("plainPassword", "mockSalt");
      expect(mockDoc.password).toBe("hashedPassword");
    });

    it("should execute pre-save hook and skip hashing when not modified", async () => {
      jest.clearAllMocks();

      const preSaveHooks = (Vet.schema as any).s.hooks._pres.get("save");
      const passwordHashingHook = preSaveHooks.find((hook: any) =>
        hook.fn.toString().includes("isModified")
      );

      const mockDoc = {
        isModified: jest.fn().mockReturnValue(false),
        password: "existingHash",
      };

      await passwordHashingHook.fn.call(mockDoc);

      expect(mockDoc.isModified).toHaveBeenCalledWith("password");
      expect(bcrypt.genSalt).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockDoc.password).toBe("existingHash");
    });

    it("should use bcrypt.genSalt with strength 10", async () => {
      (bcrypt.genSalt as jest.Mock).mockResolvedValue("salt10");
      (bcrypt.hash as jest.Mock).mockResolvedValue("strongHash");

      const preSaveHooks = (Vet.schema as any).s.hooks._pres.get("save");
      const passwordHashingHook = preSaveHooks.find((hook: any) =>
        hook.fn.toString().includes("isModified")
      );

      const mockDoc = {
        isModified: jest.fn().mockReturnValue(true),
        password: "newPassword",
      };

      await passwordHashingHook.fn.call(mockDoc);

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith("newPassword", "salt10");
    });

    it("should update password field with hashed value", async () => {
      const hashedValue = "superSecureHash123";
      (bcrypt.genSalt as jest.Mock).mockResolvedValue("someSalt");
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedValue);

      const preSaveHooks = (Vet.schema as any).s.hooks._pres.get("save");
      const passwordHashingHook = preSaveHooks.find((hook: any) =>
        hook.fn.toString().includes("isModified")
      );

      const mockDoc = {
        isModified: jest.fn().mockReturnValue(true),
        password: "plainPassword",
      };

      await passwordHashingHook.fn.call(mockDoc);

      expect(mockDoc.password).toBe(hashedValue);
    });
  });

  describe("comparePassword method", () => {
    it("should return true when passwords match", async () => {
      const vet = new Vet({
        email: "vet@example.com",
        password: "hashedPassword",
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await vet.comparePassword("plainPassword");

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "plainPassword",
        "hashedPassword"
      );
      expect(result).toBe(true);
    });

    it("should return false when passwords do not match", async () => {
      const vet = new Vet({
        email: "vet@example.com",
        password: "hashedPassword",
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await vet.comparePassword("wrongPassword");

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "wrongPassword",
        "hashedPassword"
      );
      expect(result).toBe(false);
    });
  });
});
