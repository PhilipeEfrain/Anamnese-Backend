import { Schema, model } from "mongoose";
import { IClient } from "../interface/interface";

const ClientSchema = new Schema<IClient>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    pets: [{ type: Schema.Types.ObjectId, ref: "Pet" }],
    vets: {
      type: [{ type: Schema.Types.ObjectId, ref: "Vet" }],
      required: true,
      validate: {
        validator: function (v: any[]) {
          return v && v.length > 0;
        },
        message: "Client must be linked to at least one veterinarian",
      },
    },
  },
  { timestamps: true }
);

export default model<IClient>("Client", ClientSchema);
