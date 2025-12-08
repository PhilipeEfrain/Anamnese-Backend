import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      errors: errors.array(),
    });
  }
  next();
};

/**
 * Validation rules for vet registration
 */
export const validateVetRegistration = [
  body("name").trim().notEmpty().withMessage("Nome é obrigatório"),
  body("crmv").trim().notEmpty().withMessage("CRMV é obrigatório"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Email válido é obrigatório"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Senha deve ter pelo menos 8 caracteres")
    .matches(/\d/)
    .withMessage("Senha deve conter pelo menos um número")
    .matches(/[a-z]/)
    .withMessage("Senha deve conter pelo menos uma letra minúscula")
    .matches(/[A-Z]/)
    .withMessage("Senha deve conter pelo menos uma letra maiúscula"),
  handleValidationErrors,
];

/**
 * Validation rules for vet login
 */
export const validateVetLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Email válido é obrigatório"),
  body("password").notEmpty().withMessage("Senha é obrigatória"),
  handleValidationErrors,
];

/**
 * Validation rules for client creation
 */
export const validateClientCreation = [
  body("name").trim().notEmpty().withMessage("Nome é obrigatório"),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Telefone é obrigatório")
    .matches(/^[0-9]{10,11}$/)
    .withMessage("Telefone deve conter 10 ou 11 dígitos"),
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Email válido é obrigatório"),
  body("address").optional().trim(),
  handleValidationErrors,
];

/**
 * Validation rules for pet creation
 */
export const validatePetCreation = [
  body("owner")
    .isMongoId()
    .withMessage("ID do proprietário válido é obrigatório"),
  body("name").trim().notEmpty().withMessage("Nome do pet é obrigatório"),
  body("species").trim().notEmpty().withMessage("Espécie é obrigatória"),
  body("breed").optional().trim(),
  body("age")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Idade deve ser um número positivo"),
  body("weight")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Peso deve ser positivo"),
  handleValidationErrors,
];

/**
 * Validation rules for anamnese creation
 */
export const validateAnamneseCreation = [
  body("pet").isMongoId().withMessage("ID do pet válido é obrigatório"),
  body("reason")
    .trim()
    .notEmpty()
    .withMessage("Motivo da visita é obrigatório"),
  body("clinicalHistory").optional().isObject(),
  body("symptoms").optional().isObject(),
  body("physicalExam").optional().isObject(),
  body("assessment").optional().trim(),
  body("plan").optional().trim(),
  handleValidationErrors,
];
