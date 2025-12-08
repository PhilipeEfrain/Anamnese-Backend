import rateLimit from "express-rate-limit";

/**
 * General API rate limiter - 100 requests per 15 minutes
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Muitas requisições deste IP, por favor tente novamente mais tarde.",
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Auth rate limiter - stricter for login/register endpoints
 * 5 attempts per 15 minutes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message:
    "Muitas tentativas de autenticação, por favor tente novamente mais tarde.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

/**
 * Create anamnese rate limiter - prevent spam
 * 10 requests per hour
 */
export const createAnamneseLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message:
    "Muitas submissões de anamnese, por favor tente novamente mais tarde.",
  standardHeaders: true,
  legacyHeaders: false,
});
