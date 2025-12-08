import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: string;
  email: string;
}

// Middleware para proteger rotas
export function authenticateVet(
  req: Request & { vet?: JwtPayload },
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.vet = decoded; // anexamos o vet no request
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
}
