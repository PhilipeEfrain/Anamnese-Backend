import Vet from "../models/Vet";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";

export async function loginVet(req: Request, res: Response) {
  const { email, password } = req.body;

  const vet = await Vet.findOne({ email });
  if (!vet) return res.status(404).json({ error: "User not found" });

  const isMatch = await bcrypt.compare(password, vet.password);
  if (!isMatch) return res.status(400).json({ error: "Wrong password" });

  const token = jwt.sign(
    { id: vet._id, email: vet.email },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" }
  );

  return res.json({ token });
}
