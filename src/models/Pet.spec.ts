import mongoose from "mongoose";
import Pet from "./Pet";

describe("Pet Model", () => {
  describe("Schema Definition", () => {
    it("should require owner field", () => {
      const pet = new Pet();
      const validationError = pet.validateSync();

      expect(validationError?.errors.owner).toBeDefined();
    });

    it("should require name field", () => {
      const pet = new Pet();
      const validationError = pet.validateSync();

      expect(validationError?.errors.name).toBeDefined();
    });

    it("should require species field", () => {
      const pet = new Pet();
      const validationError = pet.validateSync();

      expect(validationError?.errors.species).toBeDefined();
    });

    it("should create valid pet with required fields", () => {
      const pet = new Pet({
        owner: new mongoose.Types.ObjectId(),
        name: "Rex",
        species: "Dog",
      });

      const validationError = pet.validateSync();
      expect(validationError).toBeUndefined();
      expect(pet.name).toBe("Rex");
      expect(pet.species).toBe("Dog");
    });

    it("should accept optional breed field", () => {
      const pet = new Pet({
        owner: new mongoose.Types.ObjectId(),
        name: "Fluffy",
        species: "Cat",
        breed: "Persian",
      });

      expect(pet.breed).toBe("Persian");
    });

    it("should accept optional age field", () => {
      const pet = new Pet({
        owner: new mongoose.Types.ObjectId(),
        name: "Max",
        species: "Dog",
        age: 5,
      });

      expect(pet.age).toBe(5);
    });

    it("should accept optional weight field", () => {
      const pet = new Pet({
        owner: new mongoose.Types.ObjectId(),
        name: "Bella",
        species: "Dog",
        weight: 25.5,
      });

      expect(pet.weight).toBe(25.5);
    });

    it("should initialize anamneses array", () => {
      const pet = new Pet({
        owner: new mongoose.Types.ObjectId(),
        name: "Luna",
        species: "Cat",
      });

      expect(pet.anamneses).toBeDefined();
      expect(Array.isArray(pet.anamneses)).toBe(true);
    });

    it("should accept anamneses references", () => {
      const anamneseId = new mongoose.Types.ObjectId();
      const pet = new Pet({
        owner: new mongoose.Types.ObjectId(),
        name: "Charlie",
        species: "Dog",
        anamneses: [anamneseId],
      });

      expect(pet.anamneses).toHaveLength(1);
      expect(pet.anamneses[0]).toEqual(anamneseId);
    });

    it("should accept multiple anamneses references", () => {
      const anamneseId1 = new mongoose.Types.ObjectId();
      const anamneseId2 = new mongoose.Types.ObjectId();
      const pet = new Pet({
        owner: new mongoose.Types.ObjectId(),
        name: "Rocky",
        species: "Dog",
        anamneses: [anamneseId1, anamneseId2],
      });

      expect(pet.anamneses).toHaveLength(2);
      expect(pet.anamneses[0]).toEqual(anamneseId1);
      expect(pet.anamneses[1]).toEqual(anamneseId2);
    });

    it("should have timestamps enabled", () => {
      const schema = Pet.schema;
      expect(schema.options.timestamps).toBe(true);
    });

    it("should reference Client model in owner field", () => {
      const ownerPath = Pet.schema.path("owner") as any;
      expect(ownerPath.options.ref).toBe("Client");
      expect(ownerPath.options.type).toBe(mongoose.Schema.Types.ObjectId);
    });
  });
});
