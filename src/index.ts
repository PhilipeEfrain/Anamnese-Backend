import mongoose from "mongoose";
import "dotenv/config";
import app from "./app";

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB connected!");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Connection error:", err);
  }
}

start();
