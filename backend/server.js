import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/mongo.js";

// Rutas
import orsRoutes from "./routes/orsRoutes.js";
import mongoRoutes from "./routes/mongoRoutes.js";

//inicializador de la caché con todas las paradas
import { initializeCache } from "./cache.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // para poder recibir JSON en POST, PUT

// Montamos las rutas con URL base /api
app.use("/api/ors", orsRoutes); // Rutas relativas a OpenRouteService
app.use("/api/rutas", mongoRoutes); // Rutas relativas a MongoDB

const PORT = process.env.PORT || 3000;

//función asíncrona para controlar el orden de arranque: primero DB, luego caché, luego servidor
const startServer = async () => {
  try {
    //conectamos a la base de datos
    await connectDB();
    console.log("MongoDB conectado exitosamente.");

    //cargamos los datos en nuestra caché en memoria
    await initializeCache();

    // Finalmente iniciamos el servidor
    app.listen(PORT, () => {
      console.log(`Servidor listo y escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Falló el arranque del servidor:", error);
    process.exit(1); // Si algo falla (DB o caché), detenemos la aplicación
  }
};

// Llamamos a la función para arrancar el servidor
startServer();