import { Router } from "express";
import * as controller from "../controllers/anamnese.controller";

const router = Router();

// Tutor preenche (rota pública)
router.post("/", controller.createAnamnese);

// Vet acessa (rota protegida – adicionamos o middleware depois)
router.get("/", controller.getAll);
router.get("/:id", controller.getById);

export default router;
