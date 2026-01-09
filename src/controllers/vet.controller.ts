import Vet from "../models/Vet";
import RefreshToken from "../models/RefreshToken";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export async function registerVet(req: Request, res: Response) {
  try {
    const { name, crmv, email, password } = req.body;

    const existingVet = await Vet.findOne({ email });
    if (existingVet) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const vet = await Vet.create({ name, crmv, email, password });

    return res.status(201).json({
      message: "Vet registered successfully",
      vet: {
        id: vet._id,
        name: vet.name,
        crmv: vet.crmv,
        email: vet.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
}

export async function loginVet(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const vet = await Vet.findOne({ email });
    if (!vet) return res.status(404).json({ error: "User not found" });

    const isMatch = await vet.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: "Wrong password" });

    const accessToken = jwt.sign(
      { id: vet._id, email: vet.email },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    const refreshTokenValue = crypto.randomBytes(64).toString("hex");
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

    await RefreshToken.create({
      vet: vet._id as any,
      token: refreshTokenValue,
      expiresAt: refreshTokenExpiry,
    });

    return res.json({
      accessToken,
      refreshToken: refreshTokenValue,
      expiresIn: 3600,
      vet: {
        _id: vet._id.toString(),
        email: vet.email,
        name: vet.name,
        createdAt: vet.createdAt?.toISOString(),
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
}

export async function refreshAccessToken(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token is required" });
    }

    const storedToken = await RefreshToken.findOne({ token: refreshToken });

    if (!storedToken) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    if (storedToken.expiresAt < new Date()) {
      await RefreshToken.deleteOne({ _id: storedToken._id });
      return res.status(401).json({ error: "Refresh token expired" });
    }

    const vet = await Vet.findById(storedToken.vet);
    if (!vet) {
      return res.status(404).json({ error: "User not found" });
    }

    const newAccessToken = jwt.sign(
      { id: vet._id, email: vet.email },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    return res.json({
      accessToken: newAccessToken,
      expiresIn: 3600,
    });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token is required" });
    }

    await RefreshToken.deleteOne({ token: refreshToken });

    return res.json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
}

export async function getAllVets(req: Request, res: Response) {
  try {
    const vets = await Vet.find()
      .select("_id name email crmv createdAt")
      .lean();

    const vetList = vets.map((vet) => ({
      value: vet.name,
      id: vet._id.toString(),
    }));

    return res.json(vetList);
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
}
