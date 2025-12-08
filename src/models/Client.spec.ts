import mongoose from "mongoose";
import Client from "./Client";

describe("Client Model", () => {
  describe("Schema Definition", () => {
    it("should require name field", () => {
      const client = new Client();
      const validationError = client.validateSync();

      expect(validationError?.errors.name).toBeDefined();
    });

    it("should require phone field", () => {
      const client = new Client();
      const validationError = client.validateSync();

      expect(validationError?.errors.phone).toBeDefined();
    });

    it("should create valid client with required fields", () => {
      const client = new Client({
        name: "John Doe",
        phone: "123456789",
      });

      const validationError = client.validateSync();
      expect(validationError).toBeUndefined();
      expect(client.name).toBe("John Doe");
      expect(client.phone).toBe("123456789");
    });

    it("should accept optional email field", () => {
      const client = new Client({
        name: "Jane Doe",
        phone: "987654321",
        email: "jane@example.com",
      });

      expect(client.email).toBe("jane@example.com");
    });

    it("should accept optional address field", () => {
      const client = new Client({
        name: "Bob Smith",
        phone: "555555555",
        address: "123 Main Street",
      });

      expect(client.address).toBe("123 Main Street");
    });

    it("should initialize pets array", () => {
      const client = new Client({
        name: "Alice",
        phone: "111111111",
      });

      expect(client.pets).toBeDefined();
      expect(Array.isArray(client.pets)).toBe(true);
    });

    it("should accept pets references", () => {
      const petId = new mongoose.Types.ObjectId();
      const client = new Client({
        name: "Charlie",
        phone: "222222222",
        pets: [petId],
      });

      expect(client.pets).toHaveLength(1);
      expect(client.pets[0]).toEqual(petId);
    });

    it("should accept multiple pets references", () => {
      const petId1 = new mongoose.Types.ObjectId();
      const petId2 = new mongoose.Types.ObjectId();
      const client = new Client({
        name: "David",
        phone: "333333333",
        pets: [petId1, petId2],
      });

      expect(client.pets).toHaveLength(2);
      expect(client.pets[0]).toEqual(petId1);
      expect(client.pets[1]).toEqual(petId2);
    });

    it("should have timestamps enabled", () => {
      const schema = Client.schema;
      expect(schema.options.timestamps).toBe(true);
    });
  });
});
