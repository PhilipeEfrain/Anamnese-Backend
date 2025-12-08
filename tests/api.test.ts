import request from "supertest";
import app from "../src/app";
import mongoose from "mongoose";
import Vet from "../src/models/Vet";
import Client from "../src/models/Client";
import Pet from "../src/models/Pet";

// ============================================
// SETUP - Configuração inicial dos testes
// ============================================
describe("Anamnese API Tests", () => {
  let token: string;
  let vetId: string;

  // Conectar ao banco antes de TODOS os testes
  beforeAll(async () => {
    const mongoUri =
      process.env.MONGO_URI_TEST || "mongodb://localhost:27017/anamnese_test";
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
  });

  // Limpar banco e criar vet de teste antes de CADA teste
  beforeEach(async () => {
    // Limpar todas as collections
    await Vet.deleteMany({});
    await Client.deleteMany({});
    await Pet.deleteMany({});

    // Criar um veterinário e fazer login para obter token
    const registerResponse = await request(app).post("/vet/register").send({
      email: "vet@test.com",
      password: "Test@123",
    });

    vetId = registerResponse.body.vet.id;

    const loginResponse = await request(app).post("/vet/login").send({
      email: "vet@test.com",
      password: "Test@123",
    });

    token = loginResponse.body.token;
  });

  // Desconectar do banco após TODOS os testes
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // ============================================
  // TESTES DE HEALTH CHECK
  // ============================================
  describe("Health Check", () => {
    it("should return OK on /health", async () => {
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
      expect(response.text).toBe("OK");
    });
  });

  // ============================================
  // TESTES DE AUTENTICAÇÃO - VETERINÁRIO
  // ============================================
  describe("Vet Authentication", () => {
    describe("POST /vet/register", () => {
      it("should register a new vet with valid data", async () => {
        const response = await request(app).post("/vet/register").send({
          email: "newvet@test.com",
          password: "Strong@123",
        });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe("Vet registered successfully");
        expect(response.body.vet.email).toBe("newvet@test.com");
        expect(response.body.vet.id).toBeDefined();
      });

      it("should reject registration with weak password (no uppercase)", async () => {
        const response = await request(app).post("/vet/register").send({
          email: "weak@vet.com",
          password: "weak@123", // sem letra maiúscula
        });

        expect(response.status).toBe(400);
        expect(response.body.status).toBe("error");
        expect(response.body.errors).toBeDefined();
      });

      it("should reject registration with short password", async () => {
        const response = await request(app).post("/vet/register").send({
          email: "short@vet.com",
          password: "Sh@1", // menos de 8 caracteres
        });

        expect(response.status).toBe(400);
        expect(response.body.errors[0].msg).toContain("at least 8 characters");
      });

      it("should reject registration with invalid email", async () => {
        const response = await request(app).post("/vet/register").send({
          email: "invalid-email", // email inválido
          password: "Strong@123",
        });

        expect(response.status).toBe(400);
        expect(response.body.errors[0].msg).toContain("Valid email");
      });

      it("should reject duplicate email registration", async () => {
        const response = await request(app).post("/vet/register").send({
          email: "vet@test.com", // email já registrado no beforeEach
          password: "Strong@123",
        });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Email already in use");
      });
    });

    describe("POST /vet/login", () => {
      it("should login with correct credentials", async () => {
        const response = await request(app).post("/vet/login").send({
          email: "vet@test.com",
          password: "Test@123",
        });

        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();
        expect(typeof response.body.token).toBe("string");
      });

      it("should reject login with wrong password", async () => {
        const response = await request(app).post("/vet/login").send({
          email: "vet@test.com",
          password: "WrongPassword@123",
        });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Wrong password");
      });

      it("should reject login with non-existent email", async () => {
        const response = await request(app).post("/vet/login").send({
          email: "nonexistent@test.com",
          password: "Test@123",
        });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("User not found");
      });

      it("should reject login without credentials", async () => {
        const response = await request(app).post("/vet/login").send({});

        expect(response.status).toBe(400);
      });
    });
  });

  // ============================================
  // TESTES DE PROTEÇÃO DE ROTAS
  // ============================================
  describe("Protected Routes", () => {
    it("should reject access without token", async () => {
      const response = await request(app).get("/client");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("No token provided");
    });

    it("should reject access with invalid token", async () => {
      const response = await request(app)
        .get("/client")
        .set("Authorization", "Bearer invalid_token_123");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Invalid token");
    });

    it("should accept request with valid token", async () => {
      const response = await request(app)
        .get("/client")
        .set("Authorization", `Bearer ${token}`);

      // Não deve retornar 401 (pode ser 200 ou outro código)
      expect(response.status).not.toBe(401);
    });
  });

  // ============================================
  // TESTES DE CLIENTES
  // ============================================
  describe("Client Endpoints", () => {
    describe("POST /client", () => {
      it("should create a client with valid data", async () => {
        const newClient = {
          name: "João Silva",
          phone: "11999999999",
          email: "joao@test.com",
          address: "Rua das Flores, 123",
        };

        const response = await request(app)
          .post("/client")
          .set("Authorization", `Bearer ${token}`)
          .send(newClient);

        expect(response.status).toBe(201);
        expect(response.body.name).toBe("João Silva");
        expect(response.body.phone).toBe("11999999999");
        expect(response.body._id).toBeDefined();
        expect(response.body.pets).toEqual([]);
      });

      it("should reject invalid phone number", async () => {
        const response = await request(app)
          .post("/client")
          .set("Authorization", `Bearer ${token}`)
          .send({
            name: "João Silva",
            phone: "123", // telefone inválido
          });

        expect(response.status).toBe(400);
      });
    });

    describe("GET /client", () => {
      beforeEach(async () => {
        // Criar alguns clientes para teste de listagem
        await Client.create([
          { name: "João", phone: "11999999999", pets: [] },
          { name: "Maria", phone: "11988888888", pets: [] },
        ]);
      });

      it("should get all clients", async () => {
        const response = await request(app)
          .get("/client")
          .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(2);
        expect(response.body[0].name).toBeDefined();
      });
    });

    describe("GET /client/:id", () => {
      it("should get client by id", async () => {
        const client = await Client.create({
          name: "João",
          phone: "11999999999",
          pets: [],
        });

        const response = await request(app)
          .get(`/client/${client._id}`)
          .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.name).toBe("João");
      });

      it("should return 404 for non-existent client", async () => {
        const fakeId = new mongoose.Types.ObjectId();

        const response = await request(app)
          .get(`/client/${fakeId}`)
          .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("Client not found");
      });
    });
  });

  // ============================================
  // TESTES DE PETS
  // ============================================
  describe("Pet Endpoints", () => {
    let clientId: string;

    beforeEach(async () => {
      // Criar um cliente para associar os pets
      const client = await Client.create({
        name: "João",
        phone: "11999999999",
        pets: [],
      });
      clientId = client._id.toString();
    });

    describe("POST /pet", () => {
      it("should create a pet with valid data", async () => {
        const newPet = {
          owner: clientId,
          name: "Rex",
          species: "dog",
          breed: "Golden Retriever",
          age: 3,
          weight: 25.5,
        };

        const response = await request(app)
          .post("/pet")
          .set("Authorization", `Bearer ${token}`)
          .send(newPet);

        expect(response.status).toBe(201);
        expect(response.body.name).toBe("Rex");
        expect(response.body.species).toBe("dog");
        expect(response.body.owner).toBeDefined();

        // Verificar se o pet foi adicionado ao array do cliente
        const client = await Client.findById(clientId);
        expect(client?.pets).toHaveLength(1);
      });

      it("should reject pet with invalid owner id", async () => {
        const response = await request(app)
          .post("/pet")
          .set("Authorization", `Bearer ${token}`)
          .send({
            owner: "invalid_id",
            name: "Rex",
            species: "dog",
          });

        expect(response.status).toBe(400);
      });

      it("should reject pet without required fields", async () => {
        const response = await request(app)
          .post("/pet")
          .set("Authorization", `Bearer ${token}`)
          .send({
            owner: clientId,
            // falta name e species
          });

        expect(response.status).toBe(400);
      });
    });
  });

  // ============================================
  // TESTES DE RATE LIMITING
  // ============================================
  describe("Rate Limiting", () => {
    it("should rate limit auth endpoints after 5 attempts", async () => {
      // Fazer 6 tentativas (limite é 5)
      const promises = Array(6)
        .fill(null)
        .map(() =>
          request(app).post("/vet/login").send({
            email: "test@test.com",
            password: "wrong",
          })
        );

      const responses = await Promise.all(promises);
      const lastResponse = responses[responses.length - 1];

      // A última deve ser bloqueada por rate limit
      expect(lastResponse.status).toBe(429);
    }, 15000); // timeout maior para este teste
  });

  // ============================================
  // TESTES DE VALIDAÇÃO
  // ============================================
  describe("Input Validation", () => {
    it("should sanitize and validate email", async () => {
      const response = await request(app).post("/vet/register").send({
        email: "  UPPERCASE@TEST.COM  ", // deve normalizar
        password: "Test@123",
      });

      expect(response.status).toBe(201);
      expect(response.body.vet.email).toBe("uppercase@test.com");
    });

    it("should reject requests with missing required fields", async () => {
      const response = await request(app)
        .post("/client")
        .set("Authorization", `Bearer ${token}`)
        .send({
          // falta name e phone
          email: "test@test.com",
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("error");
    });
  });
});
