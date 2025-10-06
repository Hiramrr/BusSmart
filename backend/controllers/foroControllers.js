import connectDB from "../config/mongo.js";

export const obtenerReportes = async (req, res) => {
  try {
    const db = await connectDB();
    const reportes = await db
      .collection("reportes")
      .find({ activo: true })
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    res.json(reportes);
  } catch (error) {
    console.error("Error al obtener reportes:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const crearReporte = async (req, res) => {
  try {
    const { tipo, descripcion, ubicacion, lat, lng } = req.body;

    if (!tipo || !descripcion) {
      return res
        .status(400)
        .json({ error: "Tipo y descripción son requeridos" });
    }

    if (!["alerta", "incidencia"].includes(tipo)) {
      return res
        .status(400)
        .json({ error: 'Tipo debe ser "alerta" o "incidencia"' });
    }

    const db = await connectDB();
    const nuevoReporte = {
      tipo,
      descripcion: descripcion.trim(),
      ubicacion: ubicacion ? ubicacion.trim() : null,
      // Optional coordinates when user marks location on map
      ...(typeof lat === 'number' && typeof lng === 'number'
        ? { lat: Number(lat), lng: Number(lng), location: { type: 'Point', coordinates: [Number(lng), Number(lat)] } }
        : {}),
      fecha: new Date().toLocaleString('es-MX', {
        timeZone: 'America/Mexico_City',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      timestamp: new Date(),
      activo: true,
    };

    const resultado = await db.collection("reportes").insertOne(nuevoReporte);

    const reporteCreado = {
      ...nuevoReporte,
      _id: resultado.insertedId,
    };

    res.status(201).json(reporteCreado);
  } catch (error) {
    console.error("Error al crear reporte:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const obtenerReportesRecientes = async (req, res) => {
  try {
    const db = await connectDB();
    const hace24Horas = new Date();
    hace24Horas.setHours(hace24Horas.getHours() - 24);

    const reportes = await db
      .collection("reportes")
      .find({
        timestamp: { $gte: hace24Horas },
        activo: true,
      })
      .sort({ timestamp: -1 })
      .toArray();

    res.json(reportes);
  } catch (error) {
    console.error("Error al obtener reportes recientes:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const desactivarReporte = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "ID de reporte inválido" });
    }

    const db = await connectDB();
    const { ObjectId } = await import("mongodb");

    const resultado = await db.collection("reportes").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          activo: false,
          fechaDesactivacion: new Date(),
        },
      },
    );

    if (resultado.matchedCount === 0) {
      return res.status(404).json({ error: "Reporte no encontrado" });
    }

    res.json({ mensaje: "Reporte desactivado correctamente" });
  } catch (error) {
    console.error("Error al desactivar reporte:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
