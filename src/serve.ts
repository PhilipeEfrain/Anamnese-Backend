import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

import vetRoutes from "./routes/vet.routes";

const app = express();

// ====== Middlewares ======
app.use(cors());
app.use(express.json());

// ====== Routes ======
app.use("/vet", vetRoutes);

// ====== MongoDB Connection ======
mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ====== Start Server ======
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
