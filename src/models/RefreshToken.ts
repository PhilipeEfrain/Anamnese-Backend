import { Schema, model } from "mongoose";
import { IRefreshToken } from "../interface/interface";

const RefreshTokenSchema = new Schema<IRefreshToken>({
  vet: { type: Schema.Types.ObjectId, ref: "Vet", required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default model<IRefreshToken>("RefreshToken", RefreshTokenSchema);
