import express from "express";
import { getRuta, autocomplete } from "../controllers/mongoControllers.js"; // Asegúrate de que el nombre sea correcto

const router = express.Router();

router.get("/autocomplete", autocomplete);
router.get("/:id", getRuta);


export default router;
