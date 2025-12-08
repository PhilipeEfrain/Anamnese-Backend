import { Request, Response } from "express";
import Anamnese from "../models/Anamnese";

// 1) Tutor envia a anamnese
export const createAnamnese = async (req: Request, res: Response) => {
  try {
    const anamnese = await Anamnese.create(req.body);
    return res.status(201).json(anamnese);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// 2) Vet pega todas
export const getAll = async (req: Request, res: Response) => {
  try {
    const list = await Anamnese.find().populate("pet");
    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// 3) Vet pega uma
export const getById = async (req: Request, res: Response) => {
  try {
    const item = await Anamnese.findById(req.params.id).populate("pet");
    if (!item) {
      return res.status(404).json({ error: "Anamnese not found" });
    }
    return res.json(item);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
