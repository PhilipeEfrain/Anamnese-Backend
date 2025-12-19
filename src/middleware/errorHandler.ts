import { Request, Response, NextFunction } from "express";
import { mapMongoError, formatMongoError } from "../utils/mongoErrorMapper";

/**
 * Custom error class
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let details = undefined;

  // Mapear erros do MongoDB
  const mappedError = mapMongoError(err);

  // Log detalhado do erro no servidor
  if (mappedError.code !== "UNKNOWN_ERROR") {
    console.error(formatMongoError(mappedError));
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = mappedError.message;
    details = mappedError.details;
  }

  // Mongoose duplicate key error
  else if (err.code === 11000) {
    statusCode = 400;
    message = mappedError.message;
    details = mappedError.details;
  }

  // Mongoose cast error (invalid ID)
  else if (err.name === "CastError") {
    statusCode = 400;
    message = mappedError.message;
  }

  // JWT errors
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Token inválido";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expirado";
  }

  // Erros de conexão MongoDB
  else if (
    mappedError.code === "CONNECTION_TIMEOUT" ||
    mappedError.code === "NETWORK_ERROR" ||
    mappedError.code === "AUTH_FAILED"
  ) {
    statusCode = 503;
    message = "Serviço temporariamente indisponível";
    if (process.env.NODE_ENV === "development") {
      message = mappedError.message;
      details = mappedError.suggestion;
    }
  }

  // Don't expose internal errors in production
  if (!err.isOperational && process.env.NODE_ENV === "production") {
    console.error("ERROR 💥", err);
    message = "Algo deu errado";
  }

  res.status(statusCode).json({
    status: "error",
    message,
    ...(details && { details }),
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      errorCode: mappedError.code,
    }),
  });
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
