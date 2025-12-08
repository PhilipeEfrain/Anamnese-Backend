import { Router } from "express";
import * as controller from "../controllers/pet.controller";
import { authenticateVet } from "../middleware/auth";
import { validatePetCreation } from "../middleware/validators";

const router = Router();

// All pet routes are protected (only vets can manage pets)
router.post("/", authenticateVet, validatePetCreation, controller.createPet);
router.get("/", authenticateVet, controller.getAllPets);
router.get("/:id", authenticateVet, controller.getPetById);
router.put("/:id", authenticateVet, controller.updatePet);
router.delete("/:id", authenticateVet, controller.deletePet);

export default router;
