import express from "express";
import {
  obtenerReportes,
  crearReporte,
  obtenerReportesRecientes,
  desactivarReporte,
} from "../controllers/foroControllers.js";

const router = express.Router();

router.get("/reportes", obtenerReportes);
router.post("/reportes", crearReporte);
router.get("/reportes/recientes", obtenerReportesRecientes);

router.patch("/reportes/:id/desactivar", desactivarReporte);

export default router;
