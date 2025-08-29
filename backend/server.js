//Montamos el servidor para hacer de intermediario entre el frontend y la API de OpenRouteService

import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors"; // evita problemas de CORS entre frontend y backend


dotenv.config();

const app = express();
app.use(cors()); 
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

app.get("/geocode", async (req, res) => {
  try {
    const lugar = req.query.text;
    if (!lugar) return res.status(400).json({ error: "Falta el parámetro text" });

    const url = `https://api.openrouteservice.org/geocode/search?api_key=${API_KEY}&text=${encodeURIComponent(lugar)}`;
    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/directions", async (req, res) => {
  try {
    const { startLng, startLat, endLng, endLat } = req.query;
    if (!startLng || !startLat || !endLng || !endLat)
      return res.status(400).json({ error: "Faltan parámetros de coordenadas" });

    const url = `https://api.openrouteservice.org/v2/directions/driving-hgv?api_key=${API_KEY}&start=${startLng},${startLat}&end=${endLng},${endLat}`;
    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
