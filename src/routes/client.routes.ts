import { Router } from "express";
import * as controller from "../controllers/client.controller";
import { authenticateVet } from "../middleware/auth";
import { validateClientCreation } from "../middleware/validators";

const router = Router();

// All client routes are protected (only vets can manage clients)
router.post(
  "/",
  authenticateVet,
  validateClientCreation,
  controller.createClient
);
router.get("/", authenticateVet, controller.getAllClients);
router.get("/:id", authenticateVet, controller.getClientById);
router.put("/:id", authenticateVet, controller.updateClient);
router.delete("/:id", authenticateVet, controller.deleteClient);

export default router;
