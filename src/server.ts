import "dotenv/config";
import express from "express";
import mongoose from "mongoose";

mongoose.connect(process.env.MONGO_URI as string);

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API funcionando!");
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
