// controllers/orsController.js
import fetch from "node-fetch";

export const geocode = async (req, res) => {
  try {
    const lugar = req.query.text;
    if (!lugar) return res.status(400).json({ error: "Falta el parámetro text" });

    const url = `https://api.openrouteservice.org/geocode/search?api_key=${process.env.API_KEY}&text=${encodeURIComponent(lugar)}`;
    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const directions = async (req, res) => {
  try {
    const { startLng, startLat, endLng, endLat } = req.query;
    if (!startLng || !startLat || !endLng || !endLat)
      return res.status(400).json({ error: "Faltan parámetros de coordenadas" });

    const url = `https://api.openrouteservice.org/v2/directions/driving-hgv?api_key=${process.env.API_KEY}&start=${startLng},${startLat}&end=${endLng},${endLat}`;
    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
