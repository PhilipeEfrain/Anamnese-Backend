import mongoose from "mongoose";
import RefreshToken from "./RefreshToken";

describe("RefreshToken Model", () => {
  describe("Schema Definition", () => {
    it("should require vet field", () => {
      const refreshToken = new RefreshToken();
      const validationError = refreshToken.validateSync();

      expect(validationError?.errors.vet).toBeDefined();
    });

    it("should require token field", () => {
      const refreshToken = new RefreshToken();
      const validationError = refreshToken.validateSync();

      expect(validationError?.errors.token).toBeDefined();
    });

    it("should require expiresAt field", () => {
      const refreshToken = new RefreshToken();
      const validationError = refreshToken.validateSync();

      expect(validationError?.errors.expiresAt).toBeDefined();
    });

    it("should create valid refresh token with required fields", () => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const refreshToken = new RefreshToken({
        vet: new mongoose.Types.ObjectId(),
        token: "test-refresh-token-123",
        expiresAt,
      });

      const validationError = refreshToken.validateSync();
      expect(validationError).toBeUndefined();
      expect(refreshToken.token).toBe("test-refresh-token-123");
    });

    it("should have default createdAt when not provided", () => {
      const refreshToken = new RefreshToken({
        vet: new mongoose.Types.ObjectId(),
        token: "token-456",
        expiresAt: new Date(),
      });

      expect(refreshToken.createdAt).toBeDefined();
      expect(refreshToken.createdAt).toBeInstanceOf(Date);
    });

    it("should reference Vet model", () => {
      const vetPath = RefreshToken.schema.path("vet") as any;
      expect(vetPath.options.ref).toBe("Vet");
      expect(vetPath.options.type).toBe(mongoose.Schema.Types.ObjectId);
    });

    it("should have unique constraint on token", () => {
      const tokenPath = RefreshToken.schema.path("token") as any;
      expect(tokenPath.options.unique).toBe(true);
    });

    it("should accept custom expiresAt date", () => {
      const customExpiry = new Date();
      customExpiry.setDate(customExpiry.getDate() + 30);

      const refreshToken = new RefreshToken({
        vet: new mongoose.Types.ObjectId(),
        token: "long-lived-token",
        expiresAt: customExpiry,
      });

      expect(refreshToken.expiresAt).toEqual(customExpiry);
    });

    it("should have TTL index on expiresAt", () => {
      const indexes = RefreshToken.schema.indexes();
      const ttlIndex = indexes.find((idx: any) => idx[0].expiresAt === 1);

      expect(ttlIndex).toBeDefined();
      expect(ttlIndex[1].expireAfterSeconds).toBe(0);
    });
  });
});
