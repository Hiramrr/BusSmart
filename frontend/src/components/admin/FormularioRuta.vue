<template>
  <h1>Crear una nueva ruta</h1>
  <form>
    <ul>
      <li>
        <label for="nombre">Nombre de la ruta</label>
        <input type="text" id="nombre" name="nombre_ruta" />
      </li>
      <li>
        <label for="id">ID de la ruta</label>
        <input type="numer" id="id" name="id_ruta" />
      </li>
      <li>
        <label for="peak_am">Hora de salida</label>
        <input type="number" id="salida" name="salida_ruta" />
      </li>
      <li>
        <label for="peak_pm">Ultima hora de salida</label>
        <input type="number" id="salida" name="salida_ruta" />
      </li>
      <li>
        <label for="foto">Foto del autobus</label>
        <input type="file" id="foto" name="foto" accept="image/png, image/jpeg" />
      </li>
      <li>
        <label for="geojson">GeoJson de la ruta</label>
        <input
          type="file"
          id="GeoJson"
          name="GeoJson"
          accept=".geojson, .json, application/geo+json"
        />
      </li>
      <li>
        <label for="geojson">GeoJson de la ruta</label>
        <input
          type="file"
          id="GeoJson"
          name="GeoJson"
          accept=".geojson, .json, application/geo+json"
        />
        <a href="<<!nav>>geojson.io<<!/nav>>" target="_blank">
          <button>O crear un geojson en geojson.io</button>
        </a>
      </li>
    </ul>
  </form>
</template>
