import mongoose from "mongoose";
import "dotenv/config";

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);

    console.log("MongoDB connected!");
  } catch (err) {
    console.error("Connection error:", err);
  }
}

start();
