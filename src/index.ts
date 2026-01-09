import mongoose from "mongoose";
import "dotenv/config";
import app from "./app";
import { mapMongoError, formatMongoError } from "./utils/mongoErrorMapper";

const PORT = process.env.PORT || 3000;

// Validar variáveis de ambiente obrigatórias
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Variáveis de ambiente faltando: ${missingEnvVars.join(', ')}`);
  console.error('Configure as variáveis no Railway antes de continuar.');
  process.exit(1);
}

async function start() {
  try {
    console.log("🔄 Conectando ao MongoDB...");

    await mongoose.connect(process.env.MONGODB_URI as string, {
      serverSelectionTimeoutMS: 5000, // 5 segundos timeout
      socketTimeoutMS: 45000,
    });

    console.log("✅ MongoDB conectado com sucesso!");

    // Listener para eventos de conexão (com rate limiting)
    let lastErrorLog = 0;
    mongoose.connection.on("error", (err) => {
      const now = Date.now();
      if (now - lastErrorLog > 5000) { // Log no máximo a cada 5 segundos
        const mappedError = mapMongoError(err);
        console.error(formatMongoError(mappedError));
        lastErrorLog = now;
      }
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
