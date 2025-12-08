import { Router } from "express";
import {
  registerVet,
  loginVet,
  refreshAccessToken,
  logout,
} from "../controllers/vet.controller";
import { authLimiter } from "../middleware/rateLimiter";
import {
  validateVetRegistration,
  validateVetLogin,
  validateRefreshToken,
} from "../middleware/validators";

const router = Router();

router.post("/register", authLimiter, validateVetRegistration, registerVet);
router.post("/login", authLimiter, validateVetLogin, loginVet);
router.post("/refresh", validateRefreshToken, refreshAccessToken);
router.post("/logout", validateRefreshToken, logout);

export default router;
