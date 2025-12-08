import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import anamneseRoutes from "./routes/anamnese.routes";
import vetRoutes from "./routes/vet.routes";
import clientRoutes from "./routes/client.routes";
import petRoutes from "./routes/pet.routes";
import { errorHandler } from "./middleware/errorHandler";
import { generalLimiter } from "./middleware/rateLimiter";

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

// Health check
app.get("/health", (req, res) => res.send("OK"));

// Routes
app.use("/anamnese", anamneseRoutes);
app.use("/vet", vetRoutes);
app.use("/client", clientRoutes);
app.use("/pet", petRoutes);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
