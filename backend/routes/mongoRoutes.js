import express from "express";
import {
  getRuta,
  autocomplete,
  getAllRutas,
  sugerirRuta,
  agregarRutaFavorita,
  quitarRutaFavorita,
  crearUsuario,
} from "../controllers/mongoControllers.js";

import { crearRuta } from "../controllers/rutasControllers.js";

import { checkJwt, asegurarUsuario } from "../middleware/auth.js";

const router = express.Router();

router.get("/autocomplete", autocomplete);
router.get("/routes", getAllRutas);
router.get("/sugerir", sugerirRuta);
router.get("/:id", getRuta);

router.post(
  "/",
  checkJwt,
  checkPermissions(["create:routes"]),
  crearRuta
);

/*
router.post("/usuarios/crearUsuario", crearUsuario);

router.delete("/usuarios/:userId/favoritos/:rutaId", quitarRutaFavorita);

const middlewaresProtegidos = [checkJwt, asegurarUsuario];

router.put("/favoritos", middlewaresProtegidos, agregarRutaFavorita);

router.delete("/favoritos/:rutaId", middlewaresProtegidos, quitarRutaFavorita);

router.get("/usuarios/perfil", middlewaresProtegidos, (req, res) => {
  res.status(200).json(req.usuario);
});
*/

export default router;
