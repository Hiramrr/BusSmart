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
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "https://bussmart.onrender.com",
      "https://bussmart.pages.dev",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ⭐ 2. Body parser
app.use(express.json());

// ⭐ 3. Middleware adicional para las imágenes (IMPORTANTE)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const imagesPath = path.join(
  __dirname,
  "Datos de las rutas",
  "codeandoxalapa mapmap master data",
);

// Configurar headers CORS específicamente para las imágenes
app.use("/images", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

// Servir imágenes estáticas
app.use(
  "/images",
  express.static(imagesPath, {
    maxAge: "1d",
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      res.setHeader("Cache-Control", "public, max-age=86400");
    },
  }),
);

console.log("📁 Sirviendo imágenes desde:", imagesPath);

// 4. Rutas de la API
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
      console.log(
        `🖼️  Imágenes disponibles en: http://localhost:${PORT}/images/`,
      );
    });
  } catch (error) {
    console.error("Falló el arranque del servidor:", error);
    process.exit(1);
  }
};

startServer();
