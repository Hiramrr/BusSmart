import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/mongo.js";
import orsRoutes from "./routes/orsRoutes.js";
import mongoRoutes from "./routes/mongoRoutes.js";
import { initializeCaches } from "./cache.js";
import { checkJwt, checkPermissions } from "./middleware/auth.js";
import userRoutes from "./routes/userRoutes.js";
import foroRoutes from "./routes/foroRoutes.js";

dotenv.config();

const app = express();

// Servir imágenes estáticas
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const imagesPath = path.join(
  __dirname,
  "Datos de las rutas",
  "codeandoxalapa mapmap master data",
);
app.use("/images", express.static(imagesPath));

app.use(cors());
app.use(express.json());

app.use("/api/ors", orsRoutes);
app.use("/api/rutas", mongoRoutes);
app.use("/api/user", userRoutes);
app.use("/api/foro", foroRoutes);

const PORT = process.env.PORT || 3000;

app.get("/api/rutas", (req, res) => {
  res.send({ messsage: "rutas publicas" });
});

app.post(
  "/api/rutas",
  checkJwt,
  checkPermissions(["create:routes"]),
  (req, res) => {
    res.status(201).send({ message: "ruta creada" });
  },
);

app.delete(
  "/api/rutas/:id",
  checkJwt,
  checkPermissions(["delete:routes"]),
  (req, res) => {
    res.send({ message: "ruta eliminada ${req.params.id}" });
  },
);

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
