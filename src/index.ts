import mongoose from "mongoose";
import "dotenv/config";
import app from "./app";
import { mapMongoError, formatMongoError } from "./utils/mongoErrorMapper";

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    console.log("🔄 Conectando ao MongoDB...");

    await mongoose.connect(process.env.MONGO_URI as string, {
      serverSelectionTimeoutMS: 5000, // 5 segundos timeout
      socketTimeoutMS: 45000,
    });

    console.log("✅ MongoDB conectado com sucesso!");

    // Listener para eventos de conexão
    mongoose.connection.on("error", (err) => {
      const mappedError = mapMongoError(err);
      console.error(formatMongoError(mappedError));
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  MongoDB desconectado!");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB reconectado!");
    });
  } catch (err) {
    const mappedError = mapMongoError(err);
    console.error(formatMongoError(mappedError));
    console.log("⚠️  Iniciando servidor sem conexão com o banco de dados...");
  }

  app.listen(PORT, () => {
    console.log(`\n${"=".repeat(80)}`);
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📚 Documentação Swagger: http://localhost:${PORT}/api-docs`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
    console.log(`${"=".repeat(80)}\n`);
  });
}

start();
