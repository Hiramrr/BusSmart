import express from "express";
import { crearRuta,
  eliminarRuta,
  getRuta,
  autocomplete,
  sugerirRuta, 
  getAllRutas
} from "../controllers/rutasControllers.js";

import { checkJwt, checkPermissions } from "../middleware/auth.js";

const router = express.Router();

router.get("/autocomplete", autocomplete);
router.get("/routes", getAllRutas);
router.get("/sugerir", sugerirRuta);
router.post("/crearRuta", crearRuta);
router.delete("/eliminarRuta/:id", eliminarRuta);
router.get("/:id", getRuta);

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
