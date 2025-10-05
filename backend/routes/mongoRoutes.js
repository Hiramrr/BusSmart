import express from "express";
import {
  crearRuta,
  eliminarRuta,
  getRuta,
  autocomplete,
  sugerirRuta,
  getAllRutas,
  obtenerParadasDeRuta,
  actualizarRuta,
} from "../controllers/rutasControllers.js";

import { checkJwt, checkPermissions } from "../middleware/auth.js";

const router = express.Router();

router.get("/autocomplete", autocomplete);
router.get("/routes", getAllRutas);
router.get("/sugerir", sugerirRuta);
router.post("/crearRuta", crearRuta);
router.delete("/eliminarRuta/:id", eliminarRuta);
router.get("/:id", getRuta);

router.get("/:id/paradas", obtenerParadasDeRuta);
router.put("/actualizarRuta/:id", actualizarRuta);

export default router;
