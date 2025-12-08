import { Request, Response } from "express";
import { createAnamnese, getAll, getById } from "./anamnese.controller";
import Anamnese from "../models/Anamnese";
import mongoose from "mongoose";

// ============================================
// ANÁLISE DO CONTROLLER:
// ============================================
// 1. createAnamnese: Cria uma nova anamnese (rota pública)
//    - Success: retorna 201 com anamnese criada
//    - Error: retorna 500 com mensagem de erro
//
// 2. getAll: Lista todas as anamneses (rota protegida)
//    - Success: retorna 200 com array de anamneses (com populate de pet)
//    - Error: retorna 500 com mensagem de erro
//
// 3. getById: Busca uma anamnese por ID (rota protegida)
//    - Success: retorna 200 com anamnese encontrada (com populate de pet)
//    - Not Found: retorna 404 se não encontrar
//    - Error: retorna 500 com mensagem de erro
// ============================================

// Mock do modelo Anamnese
jest.mock("../models/Anamnese");

describe("Anamnese Controller - Unit Tests", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  // Setup antes de cada teste
  beforeEach(() => {
    // Mock do objeto Request
    mockRequest = {
      body: {},
      params: {},
    };

    // Mock do objeto Response
    responseObject = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockResponse = responseObject;

    // Limpar todos os mocks
    jest.clearAllMocks();
  });

  // ============================================
  // TESTES: createAnamnese
  // ============================================
  describe("createAnamnese", () => {
    it("should create anamnese successfully and return 201", async () => {
      // ARRANGE
      const petId = new mongoose.Types.ObjectId();
      const mockAnamneseData = {
        pet: petId,
        reason: "Consulta de rotina",
        symptoms: {
          vomiting: false,
          diarrhea: false,
        },
      };

      const mockCreatedAnamnese = {
        _id: new mongoose.Types.ObjectId(),
        ...mockAnamneseData,
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.body = mockAnamneseData;

      // Mock do método create
      (Anamnese.create as jest.Mock).mockResolvedValue(mockCreatedAnamnese);

      // ACT
      await createAnamnese(mockRequest as Request, mockResponse as Response);

      // ASSERT
      expect(Anamnese.create).toHaveBeenCalledWith(mockAnamneseData);
      expect(Anamnese.create).toHaveBeenCalledTimes(1);
      expect(responseObject.status).toHaveBeenCalledWith(201);
      expect(responseObject.json).toHaveBeenCalledWith(mockCreatedAnamnese);
    });

    it("should create anamnese with complete clinical data", async () => {
      // ARRANGE
      const completeAnamneseData = {
        pet: new mongoose.Types.ObjectId(),
        reason: "Vômito e diarreia",
        clinicalHistory: {
          previousDiseases: "Nenhuma",
          medications: "Nenhum",
          allergies: "Nenhuma conhecida",
          vaccines: "Todas em dia",
        },
        symptoms: {
          vomiting: true,
          diarrhea: true,
          lethargy: true,
        },
        physicalExam: {
          temperature: 38.5,
          heartRate: 120,
          respiratoryRate: 30,
        },
      };

      mockRequest.body = completeAnamneseData;
      (Anamnese.create as jest.Mock).mockResolvedValue(completeAnamneseData);

      // ACT
      await createAnamnese(mockRequest as Request, mockResponse as Response);

      // ASSERT
      expect(Anamnese.create).toHaveBeenCalledWith(completeAnamneseData);
      expect(responseObject.status).toHaveBeenCalledWith(201);
    });

    it("should return 500 when database error occurs", async () => {
      // ARRANGE
      const mockError = new Error("Database connection failed");
      mockRequest.body = { pet: "invalid_id", reason: "Test" };

      (Anamnese.create as jest.Mock).mockRejectedValue(mockError);

      // ACT
      await createAnamnese(mockRequest as Request, mockResponse as Response);

      // ASSERT
      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Database connection failed",
      });
    });

    it("should return 500 when validation error occurs", async () => {
      // ARRANGE
      const validationError = new Error("Pet is required");
      mockRequest.body = { reason: "Test without pet" };

      (Anamnese.create as jest.Mock).mockRejectedValue(validationError);

      // ACT
      await createAnamnese(mockRequest as Request, mockResponse as Response);

      // ASSERT
      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Pet is required",
      });
    });

    it("should handle empty request body", async () => {
      // ARRANGE
      mockRequest.body = {};
      const error = new Error("Validation failed");

      (Anamnese.create as jest.Mock).mockRejectedValue(error);

      // ACT
      await createAnamnese(mockRequest as Request, mockResponse as Response);

      // ASSERT
      expect(Anamnese.create).toHaveBeenCalledWith({});
      expect(responseObject.status).toHaveBeenCalledWith(500);
    });
  });

  // ============================================
  // TESTES: getAll
  // ============================================
  describe("getAll", () => {
    it("should return all anamneses with populated pet data", async () => {
      // ARRANGE
      const mockAnamneses = [
        {
          _id: new mongoose.Types.ObjectId(),
          pet: {
            _id: new mongoose.Types.ObjectId(),
            name: "Rex",
            species: "dog",
          },
          reason: "Consulta de rotina",
          date: new Date(),
        },
        {
          _id: new mongoose.Types.ObjectId(),
          pet: {
            _id: new mongoose.Types.ObjectId(),
            name: "Miau",
            species: "cat",
          },
          reason: "Vacina",
          date: new Date(),
        },
      ];

      const mockPopulate = jest.fn().mockResolvedValue(mockAnamneses);
      (Anamnese.find as jest.Mock).mockReturnValue({
        populate: mockPopulate,
      });

      // ACT
      await getAll(mockRequest as Request, mockResponse as Response);

      // ASSERT
      expect(Anamnese.find).toHaveBeenCalledWith();
      expect(mockPopulate).toHaveBeenCalledWith("pet");
      expect(responseObject.json).toHaveBeenCalledWith(mockAnamneses);
      expect(responseObject.status).not.toHaveBeenCalled(); // Retorna direto sem status
    });

    it("should return empty array when no anamneses exist", async () => {
      // ARRANGE
      const mockPopulate = jest.fn().mockResolvedValue([]);
      (Anamnese.find as jest.Mock).mockReturnValue({
        populate: mockPopulate,
      });

      // ACT
      await getAll(mockRequest as Request, mockResponse as Response);

      // ASSERT
      expect(Anamnese.find).toHaveBeenCalled();
      expect(mockPopulate).toHaveBeenCalledWith("pet");
      expect(responseObject.json).toHaveBeenCalledWith([]);
    });

    it("should return 500 when database error occurs", async () => {
      // ARRANGE
      const mockError = new Error("Database connection lost");
      const mockPopulate = jest.fn().mockRejectedValue(mockError);
      (Anamnese.find as jest.Mock).mockReturnValue({
        populate: mockPopulate,
      });

      // ACT
      await getAll(mockRequest as Request, mockResponse as Response);

      // ASSERT
      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Database connection lost",
      });
    });

    it("should return 500 when populate fails", async () => {
      // ARRANGE
      const mockError = new Error("Population failed");
      const mockPopulate = jest.fn().mockRejectedValue(mockError);
      (Anamnese.find as jest.Mock).mockReturnValue({
        populate: mockPopulate,
      });

      // ACT
      await getAll(mockRequest as Request, mockResponse as Response);

      // ASSERT
      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Population failed",
      });
    });
  });

  // ============================================
  // TESTES: getById
  // ============================================
  describe("getById", () => {
    it("should return anamnese by id with populated pet data", async () => {
      // ARRANGE
      const anamneseId = new mongoose.Types.ObjectId();
      const mockAnamnese = {
        _id: anamneseId,
        pet: {
          _id: new mongoose.Types.ObjectId(),
          name: "Rex",
          species: "dog",
          owner: new mongoose.Types.ObjectId(),
        },
        reason: "Vômito",
        symptoms: {
          vomiting: true,
        },
        date: new Date(),
      };

      mockRequest.params = { id: anamneseId.toString() };

      const mockPopulate = jest.fn().mockResolvedValue(mockAnamnese);
      (Anamnese.findById as jest.Mock).mockReturnValue({
        populate: mockPopulate,
      });

      // ACT
      await getById(mockRequest as Request, mockResponse as Response);

      // ASSERT
      expect(Anamnese.findById).toHaveBeenCalledWith(anamneseId.toString());
      expect(mockPopulate).toHaveBeenCalledWith("pet");
      expect(responseObject.json).toHaveBeenCalledWith(mockAnamnese);
      expect(responseObject.status).not.toHaveBeenCalled();
    });

    it("should return 404 when anamnese is not found", async () => {
      // ARRANGE
      const nonExistentId = new mongoose.Types.ObjectId();
      mockRequest.params = { id: nonExistentId.toString() };

      const mockPopulate = jest.fn().mockResolvedValue(null);
      (Anamnese.findById as jest.Mock).mockReturnValue({
        populate: mockPopulate,
      });

      // ACT
      await getById(mockRequest as Request, mockResponse as Response);

      // ASSERT
      expect(Anamnese.findById).toHaveBeenCalledWith(nonExistentId.toString());
      expect(responseObject.status).toHaveBeenCalledWith(404);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Anamnese not found",
      });
    });

    it("should return 404 when id is valid but anamnese does not exist", async () => {
      // ARRANGE
      mockRequest.params = { id: new mongoose.Types.ObjectId().toString() };

      const mockPopulate = jest.fn().mockResolvedValue(null);
      (Anamnese.findById as jest.Mock).mockReturnValue({
        populate: mockPopulate,
      });

      // ACT
      await getById(mockRequest as Request, mockResponse as Response);

      // ASSERT
      expect(responseObject.status).toHaveBeenCalledWith(404);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Anamnese not found",
      });
    });

    it("should return 500 when database error occurs", async () => {
      // ARRANGE
      mockRequest.params = { id: new mongoose.Types.ObjectId().toString() };
      const mockError = new Error("Database query failed");

      const mockPopulate = jest.fn().mockRejectedValue(mockError);
      (Anamnese.findById as jest.Mock).mockReturnValue({
        populate: mockPopulate,
      });

      // ACT
      await getById(mockRequest as Request, mockResponse as Response);

      // ASSERT
      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Database query failed",
      });
    });

    it("should return 500 when invalid id format is provided", async () => {
      // ARRANGE
      mockRequest.params = { id: "invalid_id_format" };
      const mockError = new Error("Cast to ObjectId failed");

      const mockPopulate = jest.fn().mockRejectedValue(mockError);
      (Anamnese.findById as jest.Mock).mockReturnValue({
        populate: mockPopulate,
      });

      // ACT
      await getById(mockRequest as Request, mockResponse as Response);

      // ASSERT
      expect(Anamnese.findById).toHaveBeenCalledWith("invalid_id_format");
      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Cast to ObjectId failed",
      });
    });

    it("should return 500 when populate fails", async () => {
      // ARRANGE
      mockRequest.params = { id: new mongoose.Types.ObjectId().toString() };
      const mockError = new Error("Unable to populate pet reference");

      const mockPopulate = jest.fn().mockRejectedValue(mockError);
      (Anamnese.findById as jest.Mock).mockReturnValue({
        populate: mockPopulate,
      });

      // ACT
      await getById(mockRequest as Request, mockResponse as Response);

      // ASSERT
      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Unable to populate pet reference",
      });
    });
  });

  // ============================================
  // TESTES: Edge Cases e Cenários Especiais
  // ============================================
  describe("Edge Cases", () => {
    it("createAnamnese should handle undefined error message", async () => {
      // ARRANGE
      const errorWithoutMessage = { name: "UnknownError" };
      mockRequest.body = { pet: "123", reason: "test" };

      (Anamnese.create as jest.Mock).mockRejectedValue(errorWithoutMessage);

      // ACT
      await createAnamnese(mockRequest as Request, mockResponse as Response);

      // ASSERT
      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: undefined,
      });
    });

    it("getAll should handle network timeout errors", async () => {
      // ARRANGE
      const timeoutError = new Error("Network timeout");
      const mockPopulate = jest.fn().mockRejectedValue(timeoutError);
      (Anamnese.find as jest.Mock).mockReturnValue({
        populate: mockPopulate,
      });

      // ACT
      await getAll(mockRequest as Request, mockResponse as Response);

      // ASSERT
      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: "Network timeout",
      });
    });

    it("getById should handle null params", async () => {
      // ARRANGE
      mockRequest.params = {};
      const mockError = new Error("Argument passed in must be a string");

      const mockPopulate = jest.fn().mockRejectedValue(mockError);
      (Anamnese.findById as jest.Mock).mockReturnValue({
        populate: mockPopulate,
      });

      // ACT
      await getById(mockRequest as Request, mockResponse as Response);

      // ASSERT
      expect(responseObject.status).toHaveBeenCalledWith(500);
    });
  });

  // ============================================
  // TESTES: Cobertura de Tipos de Dados
  // ============================================
  describe("Data Type Coverage", () => {
    it("createAnamnese should handle all optional fields", async () => {
      // ARRANGE
      const fullData = {
        pet: new mongoose.Types.ObjectId(),
        reason: "Complete checkup",
        clinicalHistory: {
          previousDiseases: "Diabetes",
          medications: "Insulin",
          allergies: "None",
          surgeries: "Neutering",
          vaccines: "Rabies, Parvo",
          diet: "Premium food",
        },
        symptoms: {
          vomiting: false,
          diarrhea: false,
          coughing: true,
          sneezing: false,
          itching: true,
          bleeding: false,
          lethargy: false,
          appetiteLoss: false,
          notes: "Mild cough for 2 days",
        },
        physicalExam: {
          temperature: 38.2,
          heartRate: 110,
          respiratoryRate: 25,
          hydration: "Normal",
          mucousColor: "Pink",
          observations: "No abnormalities detected",
        },
        assessment: "Respiratory infection suspected",
        plan: "Antibiotics prescribed",
      };

      mockRequest.body = fullData;
      (Anamnese.create as jest.Mock).mockResolvedValue(fullData);

      // ACT
      await createAnamnese(mockRequest as Request, mockResponse as Response);

      // ASSERT
      expect(Anamnese.create).toHaveBeenCalledWith(fullData);
      expect(responseObject.status).toHaveBeenCalledWith(201);
    });

    it("createAnamnese should handle minimal required data", async () => {
      // ARRANGE
      const minimalData = {
        pet: new mongoose.Types.ObjectId(),
        reason: "Checkup",
      };

      mockRequest.body = minimalData;
      (Anamnese.create as jest.Mock).mockResolvedValue(minimalData);

      // ACT
      await createAnamnese(mockRequest as Request, mockResponse as Response);

      // ASSERT
      expect(Anamnese.create).toHaveBeenCalledWith(minimalData);
      expect(responseObject.status).toHaveBeenCalledWith(201);
    });
  });
});
