import mongoose from "mongoose";
import Anamnese from "./Anamnese";

describe("Anamnese Model", () => {
  describe("Schema Definition", () => {
    it("should require pet field", () => {
      const anamnese = new Anamnese();
      const validationError = anamnese.validateSync();

      expect(validationError?.errors.pet).toBeDefined();
    });

    it("should require reason field", () => {
      const anamnese = new Anamnese();
      const validationError = anamnese.validateSync();

      expect(validationError?.errors.reason).toBeDefined();
    });

    it("should have default date when not provided", () => {
      const anamnese = new Anamnese({
        pet: new mongoose.Types.ObjectId(),
        reason: "Routine checkup",
      });

      expect(anamnese.date).toBeDefined();
      expect(anamnese.date).toBeInstanceOf(Date);
    });

    it("should create valid anamnese with required fields", () => {
      const anamnese = new Anamnese({
        pet: new mongoose.Types.ObjectId(),
        reason: "Consultation",
      });

      const validationError = anamnese.validateSync();
      expect(validationError).toBeUndefined();
    });

    it("should accept clinicalHistory fields", () => {
      const anamnese = new Anamnese({
        pet: new mongoose.Types.ObjectId(),
        reason: "Checkup",
        clinicalHistory: {
          previousDiseases: "None",
          medications: "Antibiotics",
          allergies: "None",
          surgeries: "Neutering",
          vaccines: "Rabies",
          diet: "Premium food",
        },
      });

      expect(anamnese.clinicalHistory?.previousDiseases).toBe("None");
      expect(anamnese.clinicalHistory?.medications).toBe("Antibiotics");
      expect(anamnese.clinicalHistory?.allergies).toBe("None");
      expect(anamnese.clinicalHistory?.surgeries).toBe("Neutering");
      expect(anamnese.clinicalHistory?.vaccines).toBe("Rabies");
      expect(anamnese.clinicalHistory?.diet).toBe("Premium food");
    });

    it("should accept symptoms fields", () => {
      const anamnese = new Anamnese({
        pet: new mongoose.Types.ObjectId(),
        reason: "Sick",
        symptoms: {
          vomiting: true,
          diarrhea: false,
          coughing: true,
          sneezing: false,
          itching: true,
          bleeding: false,
          lethargy: true,
          appetiteLoss: false,
          notes: "Some additional notes",
        },
      });

      expect(anamnese.symptoms?.vomiting).toBe(true);
      expect(anamnese.symptoms?.diarrhea).toBe(false);
      expect(anamnese.symptoms?.coughing).toBe(true);
      expect(anamnese.symptoms?.sneezing).toBe(false);
      expect(anamnese.symptoms?.itching).toBe(true);
      expect(anamnese.symptoms?.bleeding).toBe(false);
      expect(anamnese.symptoms?.lethargy).toBe(true);
      expect(anamnese.symptoms?.appetiteLoss).toBe(false);
      expect(anamnese.symptoms?.notes).toBe("Some additional notes");
    });

    it("should accept physicalExam fields", () => {
      const anamnese = new Anamnese({
        pet: new mongoose.Types.ObjectId(),
        reason: "Exam",
        physicalExam: {
          temperature: 38.5,
          heartRate: 120,
          respiratoryRate: 30,
          hydration: "Good",
          mucousColor: "Pink",
          observations: "Healthy",
        },
      });

      expect(anamnese.physicalExam?.temperature).toBe(38.5);
      expect(anamnese.physicalExam?.heartRate).toBe(120);
      expect(anamnese.physicalExam?.respiratoryRate).toBe(30);
      expect(anamnese.physicalExam?.hydration).toBe("Good");
      expect(anamnese.physicalExam?.mucousColor).toBe("Pink");
      expect(anamnese.physicalExam?.observations).toBe("Healthy");
    });

    it("should accept assessment field", () => {
      const anamnese = new Anamnese({
        pet: new mongoose.Types.ObjectId(),
        reason: "Diagnosis",
        assessment: "Patient shows signs of recovery",
      });

      expect(anamnese.assessment).toBe("Patient shows signs of recovery");
    });

    it("should accept plan field", () => {
      const anamnese = new Anamnese({
        pet: new mongoose.Types.ObjectId(),
        reason: "Treatment",
        plan: "Continue medication for 7 days",
      });

      expect(anamnese.plan).toBe("Continue medication for 7 days");
    });

    it("should have timestamps enabled", () => {
      const schema = Anamnese.schema;
      expect(schema.options.timestamps).toBe(true);
    });

    it("should reference Pet model", () => {
      const petPath = Anamnese.schema.path("pet") as any;
      expect(petPath.options.ref).toBe("Pet");
      expect(petPath.options.type).toBe(mongoose.Schema.Types.ObjectId);
    });
  });
});
