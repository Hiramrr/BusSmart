<template>
    <div class="autocomplete-container">
          <input
            type="text"
            id="destino-input"
            placeholder="Ingresa el destino..."
            autocomplete="off"
          >
          <ul id="destino-suggestions" class="suggestions-list"></ul>
        </div>

        <!-- Botón para calcular ruta -->
        <button id="btn-ruta">🚍 Buscar Ruta</button>
      </header>
</template>

<script setup>
function setupAutocomplete(inputId, suggestionsId) {
  const input = document.getElementById(inputId);
  const suggestions = document.getElementById(suggestionsId);

  const mostrarSugerencias = (lugares) => {
    suggestions.innerHTML = "";
    if (lugares.length === 0) {
      suggestions.style.display = "none";
      return;
    }

    lugares.forEach(lugar => {
      const li = document.createElement("li");
      li.textContent = lugar.nombre;
      li.addEventListener("click", () => {
        input.value = lugar.nombre;
        suggestions.style.display = "none";
        // Guardamos coordenadas seleccionadas para uso posterior
        console.log(`Coordenadas seleccionadas para ${inputId}:`, lugar.location.coordinates);
      });
      suggestions.appendChild(li);
    });

    suggestions.style.display = "block";
  };

  const handleInput = debounce(async () => {
    const query = input.value.trim();
    if (!query) {
      suggestions.style.display = "none";
      return;
    }

    const lugares = await fetchAutocomplete(query);
    mostrarSugerencias(lugares);
  }, 300); // espera 300ms entre peticiones

  input.addEventListener("input", handleInput);
}

// -------------------- Configuración de autocompletado para ambos inputs --------------------
setupAutocomplete("origen-input", "origen-suggestions");
setupAutocomplete("destino-input", "destino-suggestions");

</script>

<style scoped>
    /* Contenedor del autocompletado */
.autocomplete-container {
  position: relative;
  flex: 1; /* para mantener el mismo tamaño que el input */
}

/* Estilo de los inputs (origen y destino) */
#origen-input,
#destino-input {
  flex: 1; /* ocupan el espacio disponible */
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* Lista de sugerencias */
.suggestions-list {
  position: absolute;
  top: 100%; /* justo debajo del input */
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #ccc;
  border-top: none;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  list-style: none;
  padding: 0;
  margin: 0;
  display: none; /* se muestra solo cuando hay sugerencias */
}

/* Elementos dentro de la lista */
.suggestions-list li {
  padding: 8px 12px;
  cursor: pointer;
}

.suggestions-list li:hover {
  background-color: #f0f0f0;
}

/* Botón de buscar ruta */
#btn-ruta {
  background: #27ae60;
  color: #fff;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
}

#btn-ruta:hover {
  background: #2ecc71;
}

</style>
