import { Router } from "express";
import { registerVet, loginVet } from "../controllers/vet.controller";

const router = Router();

router.post("/register", registerVet);
router.post("/login", loginVet);

export default router;
