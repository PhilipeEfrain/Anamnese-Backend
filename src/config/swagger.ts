import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Anamnese Veterinária API",
      version: "1.0.0",
      description:
        "API REST para sistema de anamnese veterinária - permite que tutores preencham dados de anamnese e que veterinários consultem as informações de forma segura.",
      contact: {
        name: "Philipe Efrain",
        url: "https://github.com/PhilipeEfrain/Anamnese-Backend",
        email: "philipe@example.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor de Desenvolvimento",
      },
      {
        url: "https://api.anamnese.com",
        description: "Servidor de Produção",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Token JWT obtido através do endpoint /vet/login",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Mensagem de erro",
            },
          },
        },
        ValidationError: {
          type: "object",
          properties: {
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  msg: { type: "string" },
                  param: { type: "string" },
                  location: { type: "string" },
                },
              },
            },
          },
        },
        PaginationMeta: {
          type: "object",
          properties: {
            page: {
              type: "number",
              description: "Página atual",
              example: 1,
            },
            limit: {
              type: "number",
              description: "Itens por página",
              example: 10,
            },
            total: {
              type: "number",
              description: "Total de itens",
              example: 50,
            },
            totalPages: {
              type: "number",
              description: "Total de páginas",
              example: 5,
            },
            hasNextPage: {
              type: "boolean",
              description: "Possui próxima página",
              example: true,
            },
            hasPrevPage: {
              type: "boolean",
              description: "Possui página anterior",
              example: false,
            },
          },
        },
        Vet: {
          type: "object",
          required: ["name", "crmv", "email", "password"],
          properties: {
            _id: {
              type: "string",
              description: "ID do veterinário",
              example: "507f1f77bcf86cd799439011",
            },
            name: {
              type: "string",
              description: "Nome completo do veterinário",
              example: "Dr. João Silva",
            },
            crmv: {
              type: "string",
              description: "Número do CRMV",
              example: "12345-SP",
            },
            email: {
              type: "string",
              format: "email",
              description: "Email do veterinário",
              example: "joao@vet.com",
            },
            password: {
              type: "string",
              format: "password",
              description:
                "Senha (mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número, 1 especial)",
              example: "Senha@123!",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        VetResponse: {
          type: "object",
          properties: {
            _id: { type: "string", example: "507f1f77bcf86cd799439011" },
            name: { type: "string", example: "Dr. João Silva" },
            crmv: { type: "string", example: "12345-SP" },
            email: { type: "string", example: "joao@vet.com" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        VetListItem: {
          type: "object",
          properties: {
            value: {
              type: "string",
              description: "Nome do veterinário",
              example: "Dr. João Silva",
            },
            id: {
              type: "string",
              description: "ID do veterinário",
              example: "507f1f77bcf86cd799439011",
            },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            accessToken: {
              type: "string",
              description: "Token JWT de acesso (válido por 1 hora)",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            refreshToken: {
              type: "string",
              description: "Token de atualização (válido por 7 dias)",
              example: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
            },
            expiresIn: {
              type: "number",
              description: "Tempo de expiração em segundos",
              example: 3600,
            },
            vet: {
              type: "object",
              description: "Dados do veterinário autenticado",
              properties: {
                _id: {
                  type: "string",
                  example: "507f1f77bcf86cd799439011",
                },
                email: {
                  type: "string",
                  example: "joao@vet.com",
                },
                name: {
                  type: "string",
                  example: "Dr. João Silva",
                },
                createdAt: {
                  type: "string",
                  format: "date-time",
                  example: "2026-01-01T10:00:00.000Z",
                },
              },
            },
          },
        },
        Client: {
          type: "object",
          required: ["name", "phone"],
          properties: {
            _id: {
              type: "string",
              example: "507f1f77bcf86cd799439011",
            },
            name: {
              type: "string",
              description: "Nome completo do cliente/tutor",
              example: "Maria Santos",
            },
            email: {
              type: "string",
              format: "email",
              description: "Email do cliente",
              example: "maria@email.com",
            },
            phone: {
              type: "string",
              description: "Telefone de contato",
              example: "11999998888",
            },
            address: {
              type: "string",
              description: "Endereço completo",
              example: "Rua das Flores, 123",
            },
            pets: {
              type: "array",
              description: "Lista de pets do cliente",
              items: {
                type: "string",
                example: "507f1f77bcf86cd799439012",
              },
            },
            vets: {
              type: "array",
              description:
                "Lista de veterinários vinculados ao cliente (obrigatório, mínimo 1)",
              items: {
                type: "string",
                example: "507f1f77bcf86cd799439013",
              },
            },
            vets: {
              type: "array",
              description:
                "Lista de veterinários vinculados ao cliente (obrigatório, mínimo 1)",
              items: {
                type: "string",
                example: "507f1f77bcf86cd799439013",
              },
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Pet: {
          type: "object",
          required: ["owner", "name", "species"],
          properties: {
            _id: {
              type: "string",
              example: "507f1f77bcf86cd799439011",
            },
            owner: {
              type: "string",
              description: "ID do cliente proprietário",
              example: "507f1f77bcf86cd799439012",
            },
            name: {
              type: "string",
              description: "Nome do pet",
              example: "Rex",
            },
            species: {
              type: "string",
              description: "Espécie do animal",
              example: "dog",
            },
            breed: {
              type: "string",
              description: "Raça",
              example: "Labrador",
            },
            age: {
              type: "number",
              description: "Idade em anos",
              example: 3,
            },
            weight: {
              type: "number",
              description: "Peso em kg",
              example: 25.5,
            },
            isAlive: {
              type: "boolean",
              description: "Status do pet (vivo ou morto)",
              example: true,
              default: true,
            },
            anamneses: {
              type: "array",
              description: "Lista de anamneses do pet",
              items: {
                type: "string",
                example: "507f1f77bcf86cd799439013",
              },
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Anamnese: {
          type: "object",
          required: ["pet", "reason"],
          properties: {
            _id: {
              type: "string",
              example: "507f1f77bcf86cd799439011",
            },
            pet: {
              type: "string",
              description: "ID do pet",
              example: "507f1f77bcf86cd799439012",
            },
            reason: {
              type: "string",
              description: "Motivo da consulta",
              example: "Vômito e diarreia há 2 dias",
            },
            date: {
              type: "string",
              format: "date-time",
              description: "Data da anamnese",
            },
            clinicalHistory: {
              type: "object",
              properties: {
                previousIllnesses: { type: "string", example: "Nenhuma" },
                surgeries: { type: "string", example: "Castração em 2022" },
                medications: { type: "string", example: "Antipulgas mensal" },
                allergies: { type: "string", example: "Nenhuma conhecida" },
              },
            },
            symptoms: {
              type: "object",
              properties: {
                vomiting: { type: "boolean", example: true },
                diarrhea: { type: "boolean", example: true },
                lethargy: { type: "boolean", example: true },
                appetiteLoss: { type: "boolean", example: false },
                coughing: { type: "boolean", example: false },
                sneezing: { type: "boolean", example: false },
              },
            },
            physicalExam: {
              type: "object",
              properties: {
                temperature: { type: "number", example: 38.5 },
                heartRate: { type: "number", example: 120 },
                respiratoryRate: { type: "number", example: 30 },
                mucousMembranes: { type: "string", example: "Rosadas" },
                hydrationStatus: { type: "string", example: "Normal" },
              },
            },
            assessment: {
              type: "string",
              description: "Avaliação veterinária",
              example: "Possível gastroenterite",
            },
            plan: {
              type: "string",
              description: "Plano de tratamento",
              example: "Jejum 12h + medicação antiemética",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
      },
      parameters: {
        PageParam: {
          in: "query",
          name: "page",
          schema: {
            type: "number",
            minimum: 1,
            default: 1,
          },
          description: "Número da página",
        },
        LimitParam: {
          in: "query",
          name: "limit",
          schema: {
            type: "number",
            minimum: 1,
            maximum: 100,
            default: 10,
          },
          description: "Itens por página (máximo 100)",
        },
        SortByParam: {
          in: "query",
          name: "sortBy",
          schema: {
            type: "string",
          },
          description: "Campo para ordenação",
        },
        SortOrderParam: {
          in: "query",
          name: "sortOrder",
          schema: {
            type: "string",
            enum: ["asc", "desc"],
            default: "desc",
          },
          description: "Ordem de classificação",
        },
        SearchParam: {
          in: "query",
          name: "search",
          schema: {
            type: "string",
          },
          description: "Termo de busca",
        },
      },
    },
    tags: [
      {
        name: "Veterinários",
        description:
          "Endpoints de autenticação e gerenciamento de veterinários",
      },
      {
        name: "Clientes",
        description: "Gerenciamento de clientes/tutores (requer autenticação)",
      },
      {
        name: "Pets",
        description: "Gerenciamento de pets (requer autenticação)",
      },
      {
        name: "Anamneses",
        description: "Sistema de anamnese veterinária",
      },
      {
        name: "Sistema",
        description: "Endpoints de sistema",
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts", "./src/app.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
