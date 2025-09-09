import json
from pymongo import MongoClient

client = MongoClient(
    "mongodb+srv://hiram:vIu6r3Y71870SLFT@bussmart.hblobwe.mongodb.net/"
    "?retryWrites=true&w=majority&appName=busSmart"
)

db = client["xalapa_rutas"]
col_rutas = db["rutas"]
col_paradas = db["paradas"]

ruta_json = "./001/route/route.geojson"
parada_json = "./001/stops/route.geojson"

try:
    client.admin.command('ping')
    print("Conexión exitosa a MongoDB Atlas")
except Exception as e:
    print("Error de conexión:", e)


def subir_archivo(file_path, coleccion, ruta_nombre):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        if isinstance(data, dict) and data.get("type") == "FeatureCollection":
            features = data.get("features", [])
            if not features:
                print(f"[INFO] {file_path} no tiene features")
                return

            for feat in features:
                feat["ruta"] = ruta_nombre

            coleccion.insert_many(features)
            print(f"[OK] Subidas {len(features)} features desde {file_path}")

        else:
            print(f"[INFO] {file_path} no es un FeatureCollection válido")

    except Exception as e:
        print(f"[ERROR] No se pudo procesar {file_path}: {e}")


subir_archivo(ruta_json, col_rutas, "1_circuito")
subir_archivo(parada_json, col_paradas, "1_circuito")
