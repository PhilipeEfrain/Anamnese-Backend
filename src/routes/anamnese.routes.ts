import { Router } from "express";
import * as controller from "../controllers/anamnese.controller";
import { authenticateVet } from "../middleware/auth";

const router = Router();

// Tutor preenche (rota pública)
router.post("/", controller.createAnamnese);

// Vet acessa (rota protegida)
router.get("/", authenticateVet, controller.getAll);
router.get("/:id", authenticateVet, controller.getById);

export default router;
