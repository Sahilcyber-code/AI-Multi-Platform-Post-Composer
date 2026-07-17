import mongoose from "mongoose";

const connectDB = async () => {
  console.log("🚀 connectDB() called");
  console.log("URI:", process.env.MONGODB_URI);

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB Connected!");
    console.log(conn.connection.host);
  } catch (error) {
    console.error("❌ MongoDB Error");
    console.error(error);
  }
};

export default connectDB;