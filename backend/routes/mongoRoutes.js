import express from "express";
import { getRuta } from "../controllers/mongoControllers.js"; // Asegúrate de que el nombre sea correcto

const router = express.Router();

router.get("/:id", getRuta);

export default router;
