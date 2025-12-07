import express from "express";
import cors from "cors";
import anamneseRoutes from "./routes/anamnese.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.send("OK"));

// Rotas
app.use("/anamnese", anamneseRoutes);

export default app;
