import { MongoError } from "mongodb";

export interface MappedMongoError {
  code: string;
  message: string;
  details?: any;
  suggestion?: string;
}

/**
 * Mapeia erros do MongoDB para mensagens mais amigáveis
 */
export function mapMongoError(error: any): MappedMongoError {
  // Erro de timeout de conexão
  if (error.name === "MongoServerSelectionError") {
    return {
      code: "CONNECTION_TIMEOUT",
      message: "Não foi possível conectar ao MongoDB",
      details: error.message,
      suggestion:
        "Verifique: 1) String de conexão, 2) IP na whitelist do Atlas, 3) Credenciais, 4) Conexão de rede",
    };
  }

  // Erro de autenticação
  if (error.name === "MongoServerError" && error.code === 18) {
    return {
      code: "AUTH_FAILED",
      message: "Falha na autenticação do MongoDB",
      details: error.message,
      suggestion: "Verifique o usuário e senha na MONGO_URI",
    };
  }

  // Erro de rede
  if (error.name === "MongoNetworkError") {
    return {
      code: "NETWORK_ERROR",
      message: "Erro de rede ao conectar ao MongoDB",
      details: error.message,
      suggestion: "Verifique sua conexão de internet e firewall",
    };
  }

  // Erro de timeout de operação
  if (error.name === "MongoServerError" && error.code === 50) {
    return {
      code: "OPERATION_TIMEOUT",
      message: "Operação no MongoDB expirou",
      details: error.message,
      suggestion:
        "A operação demorou muito. Verifique índices ou simplifique a query",
    };
  }

  // Duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || "campo";
    return {
      code: "DUPLICATE_KEY",
      message: `Valor duplicado para o campo '${field}'`,
      details: error.keyValue,
      suggestion: `O valor informado para '${field}' já existe no banco de dados`,
    };
  }

  // Validation error
  if (error.name === "ValidationError") {
    const fields = Object.keys(error.errors || {});
    return {
      code: "VALIDATION_ERROR",
      message: "Erro de validação nos campos: " + fields.join(", "),
      details: error.errors,
      suggestion: "Verifique os dados enviados",
    };
  }

  // Cast error (tipo de dado inválido)
  if (error.name === "CastError") {
    return {
      code: "INVALID_DATA_TYPE",
      message: `Tipo de dado inválido para o campo '${error.path}'`,
      details: `Esperado: ${error.kind}, Recebido: ${error.value}`,
      suggestion: "Verifique o formato dos dados enviados",
    };
  }

  // Erro genérico do MongoDB
  if (error.name && error.name.includes("Mongo")) {
    return {
      code: "MONGO_ERROR",
      message: error.message || "Erro desconhecido do MongoDB",
      details: {
        name: error.name,
        code: error.code,
      },
    };
  }

  // Erro não relacionado ao MongoDB
  return {
    code: "UNKNOWN_ERROR",
    message: error.message || "Erro desconhecido",
    details: error,
  };
}

/**
 * Formata o erro mapeado para exibição no console
 */
export function formatMongoError(mappedError: MappedMongoError): string {
  let output = `\n${"=".repeat(80)}\n`;
  output += `🔴 ERRO DO MONGODB [${mappedError.code}]\n`;
  output += `${"=".repeat(80)}\n`;
  output += `📌 Mensagem: ${mappedError.message}\n`;

  if (mappedError.details) {
    output += `\n📋 Detalhes:\n`;
    if (typeof mappedError.details === "string") {
      output += `   ${mappedError.details}\n`;
    } else {
      output += `   ${JSON.stringify(mappedError.details, null, 2)}\n`;
    }
  }

  if (mappedError.suggestion) {
    output += `\n💡 Sugestão:\n`;
    output += `   ${mappedError.suggestion}\n`;
  }

  output += `${"=".repeat(80)}\n`;

  return output;
}
