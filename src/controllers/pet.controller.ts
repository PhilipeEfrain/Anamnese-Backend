import { Request, Response } from "express";
import Pet from "../models/Pet";
import Client from "../models/Client";
import {
  getPaginationParams,
  createPaginationResult,
  getSortParams,
  buildSortObject,
  buildSearchFilter,
} from "../utils/pagination";

export async function createPet(req: Request, res: Response) {
  try {
    const { owner, ...petData } = req.body;

    const client = await Client.findById(owner);
    if (!client) {
      return res.status(404).json({ error: "Owner (client) not found" });
    }

    const pet = await Pet.create({ owner, ...petData });

    (client.pets as any).push((pet as any)._id);
    await client.save();

    return res.status(201).json(pet);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getAllPets(req: Request, res: Response) {
  try {
    const { page, limit, skip } = getPaginationParams(req);
    const sort = getSortParams(req, "name");
    const search = req.query.search as string;
    const species = req.query.species as string;
    const owner = req.query.owner as string;

    let filter: any = {};

    const searchFilter = buildSearchFilter(search, ["name", "breed"]);
    if (searchFilter) {
      filter = { ...filter, ...searchFilter };
    }

    if (species) {
      filter.species = new RegExp(species, "i");
    }

    if (owner) {
      filter.owner = owner;
    }

    const [pets, total] = await Promise.all([
      Pet.find(filter)
        .populate("owner")
        .sort(buildSortObject(sort))
        .skip(skip)
        .limit(limit),
      Pet.countDocuments(filter),
    ]);

    return res.json(createPaginationResult(pets, total, page, limit));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Get pet by ID
 */
export async function getPetById(req: Request, res: Response) {
  try {
    const pet = await Pet.findById(req.params.id)
      .populate("owner")
      .populate("anamneses");
    if (!pet) {
      return res.status(404).json({ error: "Pet not found" });
    }
    return res.json(pet);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Update pet
 */
export async function updatePet(req: Request, res: Response) {
  try {
    const pet = await Pet.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!pet) {
      return res.status(404).json({ error: "Pet not found" });
    }
    return res.json(pet);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Delete pet
 */
export async function deletePet(req: Request, res: Response) {
  try {
    const pet = await Pet.findByIdAndDelete(req.params.id);
    if (!pet) {
      return res.status(404).json({ error: "Pet not found" });
    }

    // Remove pet from client's pets array
    await Client.findByIdAndUpdate(pet.owner, {
      $pull: { pets: pet._id },
    });

    return res.json({ message: "Pet deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
