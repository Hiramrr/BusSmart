import express from "express";
import { 
    getRuta, 
    autocomplete,
    getAllRutas,
    sugerirRuta,
} from "../controllers/mongoControllers.js"; 

const router = express.Router();

router.get("/autocomplete", autocomplete);
router.get("/routes", getAllRutas);
router.get("/sugerir", sugerirRuta);
router.get("/:id", getRuta);

export default router;
