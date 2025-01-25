import mongoose from "mongoose";
export const ConnectDb = async () => {
  const PASSWORD = "UbIxJD17w9GRG6aj";
  try {
    const conn = await mongoose.connect(
      `mongodb+srv://rehmanaashir23:${PASSWORD}@cluster0.9ngfk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
    );
    console.log(`MongoDB connected ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
