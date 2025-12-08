import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import swaggerUi from "swagger-ui-express";
import anamneseRoutes from "./routes/anamnese.routes";
import vetRoutes from "./routes/vet.routes";
import clientRoutes from "./routes/client.routes";
import petRoutes from "./routes/pet.routes";
import { errorHandler } from "./middleware/errorHandler";
import { generalLimiter } from "./middleware/rateLimiter";
import swaggerSpec from "./config/swagger";

const app = express();

// Security Middlewares
app.use(helmet()); // Set security HTTP headers
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*", // Configure this in production
    credentials: true,
  })
);
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(generalLimiter); // Rate limiting

// Body parser middlewares
app.use(express.json({ limit: "10kb" })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verificar status da API
 *     description: Endpoint de health check para monitoramento
 *     tags: [Sistema]
 *     responses:
 *       200:
 *         description: API está funcionando
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: OK
 */
app.get("/health", (req, res) => res.send("OK"));

// API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/anamnese", anamneseRoutes);
app.use("/vet", vetRoutes);
app.use("/client", clientRoutes);
app.use("/pet", petRoutes);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
