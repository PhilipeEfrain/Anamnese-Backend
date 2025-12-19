const mongoose = require("mongoose");
require("dotenv/config");

console.log("Tentando conectar ao MongoDB...");
console.log("MONGO_URI:", process.env.MONGO_URI ? "Definida" : "Não definida");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✓ MongoDB conectado com sucesso!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("✗ Erro ao conectar ao MongoDB:");
    console.error(err.message);
    console.error("\nDetalhes completos:");
    console.error(err);
    process.exit(1);
  });

// Timeout de 10 segundos
setTimeout(() => {
  console.error("Timeout: Conexão demorou muito tempo");
  process.exit(1);
}, 10000);
