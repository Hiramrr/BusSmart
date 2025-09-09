import connectDB from "../config/mongo.js";

export const getRuta = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await connectDB();

    const ruta = await db
      .collection("rutas")
      .findOne({ "features.properties.id": id });

    if (ruta) {
      res.json(ruta);
    } else {
      res.status(404).json({ message: "Ruta no encontrada" });
    }
  } catch (error) {
    console.error("Error al buscar ruta", error);
    res.status(500).json({ error: "No se encontró la ruta" });
  }
};

export const autocomplete = async (req, res) => {
  try {
    const query = req.query.query || "";
    if (!query) {
      return res.status(400).json({ error: "Se requiere el parámetro query" });
    }

    const db = await connectDB(); // 👈 conexión reutilizable
    const collection = db.collection("geocodificacion");

    const results = await collection
      .find(
        { nombre: { $regex: query, $options: "i" } },
        { projection: { nombre: 1, location: 1 } },
      )
      .limit(10)
      .toArray();

    // Imprimir coordenadas en consola
    results.forEach((r) => {
      if (r.location?.coordinates) {
        console.log(
          `Lugar: ${r.nombre}, Coordenadas: ${r.location.coordinates}`,
        );
      }
    });

    res.json(results);
  } catch (error) {
    console.error("Error en autocomplete:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

export const getAllRutas = async (req, res) => {
  try {
    const db = await connectDB();
    const options = {
      projection: {
        name: 1,
        desc: 1,
        notes: 1,
        id: 1,
        peak_am: 1,
        midday: 1,
        peak_pm: 10,
        night: 1,
      },
    };
    const rutas = await db.collection("rutas").find({}, options).toArray();
    res.json(rutas);
  } catch (error) {
    console.error("Error al obtener todas las rutas", error);
    res.status(500).json({ error: "Error al obtener las rutas" });
  }
};
