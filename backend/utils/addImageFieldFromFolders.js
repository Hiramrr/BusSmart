// backend/utils/addImageFieldFromFolders.js
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import { MongoClient } from "mongodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

// Función para buscar el route.json en diferentes ubicaciones
function findRouteJson(folderPath) {
  const possiblePaths = [
    path.join(folderPath, "route/route.json"),
    path.join(folderPath, "ida/route/route.json"),
    path.join(folderPath, "vuelta/route/route.json"),
  ];

  for (const routePath of possiblePaths) {
    if (fs.existsSync(routePath)) {
      return routePath;
    }
  }

  return null;
}

async function addImageFieldFromFolders() {
  let client;

  try {
    // Conectar a MongoDB directamente
    client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    console.log("✅ Conectado a MongoDB\n");

    const db = client.db("xalapa_rutas");
    const collection = db.collection("rutas");

    // Ruta base a las carpetas
    const basePath = path.join(
      __dirname,
      "../Datos de las rutas/codeandoxalapa mapmap master data",
    );

    let actualizadas = 0;
    let sinJson = [];
    let sinImagen = [];
    let noEncontradas = [];
    let errores = [];

    // Iterar por cada carpeta (001-120)
    for (let i = 1; i <= 120; i++) {
      const folderNum = String(i).padStart(3, "0"); // 001, 002, etc.
      const folderPath = path.join(basePath, folderNum);

      // Verificar que la carpeta existe
      if (!fs.existsSync(folderPath)) {
        console.log(`⚠️  Carpeta ${folderNum} no existe, saltando...`);
        continue;
      }

      // Buscar el route.json
      const routeJsonPath = findRouteJson(folderPath);

      if (!routeJsonPath) {
        sinJson.push(folderNum);
        console.log(
          `⚠️  ${folderNum}: No tiene route.json en ninguna ubicación`,
        );
        continue;
      }

      try {
        // Leer y parsear el JSON
        const routeData = JSON.parse(fs.readFileSync(routeJsonPath, "utf8"));
        const routeId = routeData.id;

        if (!routeId) {
          console.log(`⚠️  ${folderNum}: route.json no tiene campo "id"`);
          continue;
        }

        // Verificar que existe la imagen
        const imagePath = path.join(folderPath, "imagen/bus.jpg");
        if (!fs.existsSync(imagePath)) {
          sinImagen.push({ folder: folderNum, id: routeId });
          console.log(`⚠️  ${folderNum}: No tiene imagen/bus.jpg`);
          continue;
        }

        // 🔑 CORRECCIÓN: Buscar en features[0].properties.id
        const ruta = await collection.findOne({
          $or: [
            { "features.0.properties.id": routeId },
            { "features.0.properties.id": String(routeId) },
          ],
        });

        if (!ruta) {
          noEncontradas.push({ folder: folderNum, id: routeId });
          console.log(
            `⚠️  ${folderNum}: No se encontró ruta con features[0].properties.id="${routeId}" en MongoDB`,
          );
          continue;
        }

        // Actualizar el campo image
        const imageUrl = `/images/${folderNum}/imagen/bus.jpg`;

        const result = await collection.updateOne(
          { _id: ruta._id },
          { $set: { image: imageUrl } },
        );

        if (result.modifiedCount > 0) {
          const rutaName = ruta.features?.[0]?.properties?.name || "Sin nombre";
          console.log(
            `✅ ${folderNum}: "${rutaName}" (ID: ${routeId}) → ${imageUrl}`,
          );
          actualizadas++;
        } else {
          console.log(
            `⚠️  ${folderNum}: No se pudo actualizar (ID: ${routeId})`,
          );
        }
      } catch (error) {
        errores.push({ folder: folderNum, error: error.message });
        console.error(`❌ ${folderNum}: Error - ${error.message}`);
      }
    }

    // Resumen
    console.log(`\n${"=".repeat(70)}`);
    console.log(`📊 RESUMEN:`);
    console.log(`${"=".repeat(70)}`);
    console.log(`✅ Rutas actualizadas con campo 'image': ${actualizadas}`);
    console.log(`⚠️  Carpetas sin route.json: ${sinJson.length}`);
    console.log(`⚠️  Carpetas sin imagen: ${sinImagen.length}`);
    console.log(`⚠️  No encontradas en MongoDB: ${noEncontradas.length}`);
    console.log(`❌ Errores: ${errores.length}`);

    if (sinJson.length > 0) {
      console.log(`\n📋 Carpetas sin route.json: ${sinJson.join(", ")}`);
    }

    if (sinImagen.length > 0) {
      console.log(`\n📋 Carpetas sin imagen:`);
      sinImagen.forEach((s) => console.log(`  - ${s.folder} (ID: ${s.id})`));
    }

    if (noEncontradas.length > 0) {
      console.log(`\n📋 No encontradas en MongoDB (primeras 20):`);
      noEncontradas.slice(0, 20).forEach((n) => {
        console.log(`  - Carpeta ${n.folder}: ID="${n.id}"`);
      });
      if (noEncontradas.length > 20) {
        console.log(`  ... y ${noEncontradas.length - 20} más`);
      }
    }

    if (errores.length > 0) {
      console.log(`\n📋 Errores:`);
      errores.forEach((e) => console.log(`  - ${e.folder}: ${e.error}`));
    }

    console.log(`\n✅ Proceso completado`);
  } catch (error) {
    console.error("❌ Error fatal:", error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log(`✅ Desconectado de MongoDB`);
    }
    process.exit(0);
  }
}

addImageFieldFromFolders();
