import { Router } from "express";
import * as controller from "../controllers/anamnese.controller";
import { authenticateVet } from "../middleware/auth";
import { createAnamneseLimiter } from "../middleware/rateLimiter";
import { validateAnamneseCreation } from "../middleware/validators";

const router = Router();

// Tutor preenche (rota pública com rate limit e validação)
router.post(
  "/",
  createAnamneseLimiter,
  validateAnamneseCreation,
  controller.createAnamnese
);

// Vet acessa (rotas protegidas)
router.get("/", authenticateVet, controller.getAll);
router.get("/:id", authenticateVet, controller.getById);

export default router;
