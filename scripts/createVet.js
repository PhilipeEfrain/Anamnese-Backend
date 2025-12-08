"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const Vet_1 = __importDefault(require("../src/models/Vet"));
async function create() {
    await mongoose_1.default.connect(process.env.MONGO_URI);
    const vet = await Vet_1.default.create({
        email: "vet@clinic.com",
        password: "123456",
    });
    console.log("Vet created:", vet.email);
    process.exit();
}
create();
