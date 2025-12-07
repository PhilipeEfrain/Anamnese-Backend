import { Schema, model, Document } from "mongoose";
import { IPet } from "../interface/interface";

const PetSchema = new Schema<IPet>(
  {
    owner: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    name: { type: String, required: true },
    species: { type: String, required: true },
    breed: { type: String },
    age: { type: Number },
    weight: { type: Number },
    anamneses: [{ type: Schema.Types.ObjectId, ref: "Anamnese" }],
  },
  { timestamps: true }
);

export default model<IPet>("Pet", PetSchema);
