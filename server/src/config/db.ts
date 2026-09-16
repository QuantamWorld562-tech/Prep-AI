import mongoose from "mongoose";

const connectDb = async ():Promise<void> => {
  try {
   const mongoUri = process.env.MONGO_URI;
   if(!mongoUri) throw new Error("MONGO_URI environment variable is not defined");
    await mongoose.connect(mongoUri);
    console.log("MongoDb connected successfully");
  } catch (error) {
    console.log(error, "mongo db connection error");
    process.exit(1);
  }
};

export default connectDb;