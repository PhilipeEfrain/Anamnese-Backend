import { Schema, model, Document } from "mongoose";
import { IAnamnese } from "../interface/interface";

const AnamneseSchema = new Schema<IAnamnese>(
  {
    pet: { type: Schema.Types.ObjectId, ref: "Pet", required: true },

    date: { type: Date, default: Date.now },
    reason: { type: String, required: true },

    clinicalHistory: {
      previousDiseases: String,
      medications: String,
      allergies: String,
      surgeries: String,
      vaccines: String,
      diet: String,
    },

    symptoms: {
      vomiting: Boolean,
      diarrhea: Boolean,
      coughing: Boolean,
      sneezing: Boolean,
      itching: Boolean,
      bleeding: Boolean,
      lethargy: Boolean,
      appetiteLoss: Boolean,
      notes: String,
    },

    physicalExam: {
      temperature: Number,
      heartRate: Number,
      respiratoryRate: Number,
      hydration: String,
      mucousColor: String,
      observations: String,
    },

    assessment: String,
    plan: String,
  },
  { timestamps: true }
);

export default model<IAnamnese>("Anamnese", AnamneseSchema);
