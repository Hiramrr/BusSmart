import express from "express";
import { getRuta } from "../controllers/mongoControllers.js";

const router = express.Router();

router.get("/rutas/:id", getRuta);

export default router;
