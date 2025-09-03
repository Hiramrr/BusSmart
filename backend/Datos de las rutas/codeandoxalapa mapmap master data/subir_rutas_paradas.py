import os
import json
from pymongo import MongoClient

client = MongoClient(
    "mongodb+srv://hiram:vIu6r3Y71870SLFT@bussmart.hblobwe.mongodb.net/"
    "?retryWrites=true&w=majority&appName=busSmart"
)

db = client["xalapa_rutas"]
col_rutas = db["rutas"]
col_paradas = db["paradas"]

BASE_DIR = "."

for root, dirs, files in os.walk(BASE_DIR):
    folder = os.path.basename(root)

    for file in files:
        if file.endswith(".geojson"):
            file_path = os.path.join(root, file)

            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)

                if isinstance(data, dict) and data.get("type") == "FeatureCollection":
                    ruta_nombre = os.path.basename(os.path.dirname(root))
                    data["ruta"] = ruta_nombre

                    if folder == "route":
                        col_rutas.insert_one(data)
                        print(f"[OK] Subido archivo completo a 'rutas' desde {file_path}")
                    elif folder == "stops":
                        col_paradas.insert_one(data)
                        print(f"[OK] Subido archivo completo a 'paradas' desde {file_path}")

            except Exception as e:
                print(f"[ERROR] No se pudo procesar {file_path}: {e}")
