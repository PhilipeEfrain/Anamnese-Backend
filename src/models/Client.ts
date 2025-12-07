import { Schema, model } from "mongoose";
import { IClient } from "../interface/interface";

const ClientSchema = new Schema<IClient>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    pets: [{ type: Schema.Types.ObjectId, ref: "Pet" }],
  },
  { timestamps: true }
);

export default model<IClient>("Client", ClientSchema);
