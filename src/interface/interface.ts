import { Schema, Document } from "mongoose";

export interface IAnamnese extends Document {
  pet: Schema.Types.ObjectId;

  // Basic info about the visit
  date: Date;
  reason: string;

  // Clinical history
  clinicalHistory: {
    previousDiseases?: string;
    medications?: string;
    allergies?: string;
    surgeries?: string;
    vaccines?: string;
    diet?: string;
  };

  // Symptoms
  symptoms: {
    vomiting?: boolean;
    diarrhea?: boolean;
    coughing?: boolean;
    sneezing?: boolean;
    itching?: boolean;
    bleeding?: boolean;
    lethargy?: boolean;
    appetiteLoss?: boolean;
    notes?: string;
  };

  // Physical exam
  physicalExam: {
    temperature?: number;
    heartRate?: number;
    respiratoryRate?: number;
    hydration?: string;
    mucousColor?: string;
    observations?: string;
  };

  // Vet conclusion
  assessment?: string;
  plan?: string;
}

export interface IPet extends Document {
  owner: Schema.Types.ObjectId;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  weight?: number;
  anamneses: Schema.Types.ObjectId[];
}

export interface IClient extends Document {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  pets: Schema.Types.ObjectId[];
}
