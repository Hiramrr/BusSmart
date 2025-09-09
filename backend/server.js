// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/mongo.js";

// Rutas
import orsRoutes from "./routes/orsRoutes.js";
import mongoRoutes from "./routes/mongoRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // para poder recibir JSON en POST, PUT

const PORT = process.env.PORT || 3000;

// Conexión a Mongo y luego levantar servidor
connectDB().then(() => {
  // Montamos las rutas con URL base /api
  app.use("/api/ors", orsRoutes); // Rutas relativas a OpenRouteService
  app.use("/api/rutas", mongoRoutes); // Rutas relativas a MongoDB

  app.listen(PORT, () => {
    console.log(`Servidor y conexión a Mongo corriendo en http://localhost:${PORT}`);
  });
});
