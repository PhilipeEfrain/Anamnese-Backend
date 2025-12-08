import { Request, Response } from "express";
import Client from "../models/Client";
import Pet from "../models/Pet";
import {
  getPaginationParams,
  createPaginationResult,
  getSortParams,
  buildSortObject,
  buildSearchFilter,
} from "../utils/pagination";

export async function createClient(req: Request, res: Response) {
  try {
    const client = await Client.create(req.body);
    return res.status(201).json(client);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getAllClients(req: Request, res: Response) {
  try {
    const { page, limit, skip } = getPaginationParams(req);
    const sort = getSortParams(req, "name");
    const search = req.query.search as string;

    let filter: any = {};

    const searchFilter = buildSearchFilter(search, ["name", "email", "phone"]);
    if (searchFilter) {
      filter = { ...filter, ...searchFilter };
    }

    const [clients, total] = await Promise.all([
      Client.find(filter)
        .populate("pets")
        .sort(buildSortObject(sort))
        .skip(skip)
        .limit(limit),
      Client.countDocuments(filter),
    ]);

    return res.json(createPaginationResult(clients, total, page, limit));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Get client by ID
 */
export async function getClientById(req: Request, res: Response) {
  try {
    const client = await Client.findById(req.params.id).populate("pets");
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }
    return res.json(client);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Update client
 */
export async function updateClient(req: Request, res: Response) {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }
    return res.json(client);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Delete client
 */
export async function deleteClient(req: Request, res: Response) {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    // Remove all pets associated with this client
    await Pet.deleteMany({ owner: client._id } as any);

    return res.json({ message: "Client deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
