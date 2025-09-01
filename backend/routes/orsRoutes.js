// routes/orsRoutes.js
import express from "express";
import { geocode, directions } from "../controllers/orsControllers.js";

const router = express.Router();

// Endpoints relativos a ORS
router.get("/geocode", geocode);       // /api/ors/geocode
router.get("/directions", directions); // /api/ors/directions

export default router;