import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import mongoose from 'mongoose';

dotenv.config();

let client;

const connectDB = async () => {
  try {
    client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    console.log("Conexion a mongo exitosa");
    return client.db("xalapa_rutas");
  } catch (error) {
    console.error("❌ Error de conexión:", error.message);
    process.exit(1);
  }
};

export const connectMongoose = async () => {
  // Si ya hay una conexión de Mongoose, la reutilizamos para no crear múltiples conexiones.
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  // Si no, creamos una nueva.
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Conexión a Mongoose exitosa");
  } catch (error) {
    console.error("❌ Error de conexión con Mongoose:", error.message);
    process.exit(1);
  }
};


export default connectDB;
