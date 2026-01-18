import { Request, Response, NextFunction } from "express";

/**
 * Middleware para proteger rotas administrativas com API Key
 * Adicione API_KEY nas variáveis de ambiente do Railway
 */
export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers["x-api-key"];
  const validApiKey = process.env.API_KEY;

  if (!validApiKey) {
    console.warn("⚠️  API_KEY não configurada. Endpoint desprotegido!");
    return next();
  }

  if (!apiKey || apiKey !== validApiKey) {
    return res.status(403).json({ 
      error: "Forbidden",
      message: "API Key inválida ou ausente" 
    });
  }

  next();
}
