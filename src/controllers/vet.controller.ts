import Vet from "../models/Vet";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

/**
 * Register a new veterinarian
 */
export async function registerVet(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingVet = await Vet.findOne({ email });
    if (existingVet) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // Create vet (hash handled by schema)
    const vet = await Vet.create({ email, password });

    return res.status(201).json({
      message: "Vet registered successfully",
      vet: { id: vet._id, email: vet.email },
    });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
}

/**
 * Login veterinarian
 */
export async function loginVet(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const vet = await Vet.findOne({ email });
    if (!vet) return res.status(404).json({ error: "User not found" });

    // Use model method instead of bcrypt here
    const isMatch = await vet.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: "Wrong password" });

    const token = jwt.sign(
      { id: vet._id, email: vet.email },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    return res.json({ token });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
}
