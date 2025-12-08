import { Router } from "express";
import { registerVet, loginVet } from "../controllers/vet.controller";
import { authLimiter } from "../middleware/rateLimiter";
import {
  validateVetRegistration,
  validateVetLogin,
} from "../middleware/validators";

const router = Router();

router.post("/register", authLimiter, validateVetRegistration, registerVet);
router.post("/login", authLimiter, validateVetLogin, loginVet);

export default router;
