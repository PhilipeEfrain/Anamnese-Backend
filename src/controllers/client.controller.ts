import { Request, Response } from "express";
import Client from "../models/Client";
import Pet from "../models/Pet";

/**
 * Create a new client
 */
export async function createClient(req: Request, res: Response) {
  try {
    const client = await Client.create(req.body);
    return res.status(201).json(client);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Get all clients
 */
export async function getAllClients(req: Request, res: Response) {
  try {
    const clients = await Client.find().populate("pets");
    return res.json(clients);
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
