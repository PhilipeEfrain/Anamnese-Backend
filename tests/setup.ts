import dotenv from "dotenv";
import path from "path";

// Carregar variáveis de ambiente de teste
dotenv.config({ path: path.resolve(__dirname, "../.env.test") });

// Configurar timeout global maior para testes com banco de dados
jest.setTimeout(30000);

// Silenciar logs durante os testes (opcional)
if (process.env.NODE_ENV === "test") {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
}
