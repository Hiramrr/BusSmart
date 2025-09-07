import connectDB from "../config/mongo.js";

export const getRuta = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await connectDB();

    const ruta = await db.collection("rutas").findOne({ "properties.id": id });

    if (ruta) {
      res.json(ruta);
    } else {
      res.status(404).json({ message: "Ruta no encontrada" });
    }
  } catch (error) {
    console.error("Espero y no falle al encontrar la ruta nooo", error);
    res.status(500).json({ error: "No se econtro la ruta" });
  }
};
