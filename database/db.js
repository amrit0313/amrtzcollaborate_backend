import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
  (await mongoose.connect(process.env.DATABASE_URL),
    console.log("mongodb connected"));
};

export default connectDB;
