import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/mongo.js";

import orsRoutes from "./routes/orsRoutes.js";
import mongoRoutes from "./routes/mongoRoutes.js";
import { initializeCaches } from "./cache.js"; 

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/ors", orsRoutes);
app.use("/api/rutas", mongoRoutes);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    console.log("MongoDB conectado exitosamente.");
    await initializeCaches(); 
    app.listen(PORT, () => {
      console.log(`🚀 Servidor listo y escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Falló el arranque del servidor:", error);
    process.exit(1);
  }
};

startServer();