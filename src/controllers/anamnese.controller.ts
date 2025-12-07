import Anamnese from "../models/Anamnese";

// 1) Tutor envia a anamnese
export const createAnamnese = async (req, res) => {
  try {
    const anamnese = await Anamnese.create(req.body);
    return res.status(201).json(anamnese);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 2) Vet pega todas
export const getAll = async (req, res) => {
  try {
    const list = await Anamnese.find().populate("client pet");
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 3) Vet pega uma
export const getById = async (req, res) => {
  try {
    const item = await Anamnese.findById(req.params.id).populate("client pet");
    return res.json(item);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
