import { Request, Response } from "express";
import Anamnese from "../models/Anamnese";
import {
  getPaginationParams,
  createPaginationResult,
  getSortParams,
  buildSortObject,
  buildSearchFilter,
  buildDateRangeFilter,
} from "../utils/pagination";

export const createAnamnese = async (req: Request, res: Response) => {
  try {
    const anamnese = await Anamnese.create(req.body);
    return res.status(201).json(anamnese);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = getPaginationParams(req);
    const sort = getSortParams(req, "date", "desc");
    const search = req.query.search as string;
    const status = req.query.status as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    let filter: any = {};

    const searchFilter = buildSearchFilter(search, [
      "reason",
      "assessment",
      "diagnosis",
      "treatment",
    ]);
    if (searchFilter) {
      filter = { ...filter, ...searchFilter };
    }

    if (status) {
      filter.status = status;
    }

    const dateFilter = buildDateRangeFilter("date", startDate, endDate);
    if (dateFilter) {
      filter = { ...filter, ...dateFilter };
    }

    const [list, total] = await Promise.all([
      Anamnese.find(filter)
        .populate("pet")
        .sort(buildSortObject(sort))
        .skip(skip)
        .limit(limit),
      Anamnese.countDocuments(filter),
    ]);

    return res.json(createPaginationResult(list, total, page, limit));
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
