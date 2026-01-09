import bcrypt from "bcryptjs";
import mongoose, { Schema } from "mongoose";
import { IVetDocument } from "../interface/interface";

const VetSchema = new Schema<IVetDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    crmv: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

// Hash password before saving
VetSchema.pre<IVetDocument>("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password for login
VetSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IVetDocument>("Vet", VetSchema);
