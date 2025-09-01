import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let client;

const connectDB = async () => {
  try {
    client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    console.log("Conexion a mongo exitgosa");
    return client.db("busSmart");
  } catch (error) {
    console.error("❌ Error de conexión:", error.message);
    process.exit(1);
  }
};

export default connectDB;