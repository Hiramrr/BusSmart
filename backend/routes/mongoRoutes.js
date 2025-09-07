import express from "express";
import { getRuta } from "../controllers/mongoControllers.js";

const router = express.Router();

// Endpoints relativos a MongoDB
router.get("/rutas", getRuta); //api/rutas

router.get("/rutas/:id", getRutaById);

export default router;
