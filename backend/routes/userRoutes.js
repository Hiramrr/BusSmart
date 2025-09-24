import express from "express";

import {
  crearUsuario,
  quitarRutaFavorita,
  agregarRutaFavorita,
} from "../controllers/mongoControllers.js";

import { checkJwt, asegurarUsuario } from "../middleware/auth.js";

const router = express.Router();

router.post("/crearUsuario", crearUsuario);

const middlewaresProtegidos = [checkJwt, asegurarUsuario];

router.put("/favoritos", middlewaresProtegidos, agregarRutaFavorita);

router.delete("/favoritos/:rutaId", middlewaresProtegidos, quitarRutaFavorita);

export default router;
