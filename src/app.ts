import express from "express";
import anamneseRoutes from "./routes/anamnese.routes";

const app = express();

app.use(express.json());

// Rotas
app.use("/anamnese", anamneseRoutes);

export default app;
