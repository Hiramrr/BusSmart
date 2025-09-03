import connectDB from "../config/mongo";

export const getRuta = async (req, res) => {
    try{
        const db = await connectDB();
        const rutas = await db.collection("rutas").find({}).toArray();
        res.json(rutas);
    }catch(error){
        console.error("Error al obtener las rutas:", error);
        res.status(500).json({ error: "Error al obtener las rutas" });
    }
};