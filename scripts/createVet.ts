import "dotenv/config";
import mongoose from "mongoose";
import Vet from "../src/models/Vet";

async function create() {
  await mongoose.connect(process.env.MONGO_URI!);

  const vet = await Vet.create({
    email: "vet@clinic.com",
    password: "123456",
  });

  console.log("Vet created:", vet.email);
  process.exit();
}

create();
