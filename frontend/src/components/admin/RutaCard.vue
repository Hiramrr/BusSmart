<template>
  <div class="ruta-card">
    <div class="card-content">
      <h3 class="ruta-nombre">{{ ruta.nombre }}</h3>
      <p class="ruta-descripcion">{{ ruta.descripcion || 'Sin descripción.' }}</p>
      
      <div class="ruta-detalles">
        <span class="detalle-item">
          <strong>Número:</strong> {{ ruta.numero_ruta || 'N/A' }}
        </span>
        <span class="detalle-item">
          <strong>Puntos en Trazado:</strong> {{ ruta.puntos_recorrido }}
        </span>
      </div>
    </div>
    
    <div class="card-actions">
      <button @click="$emit('editar', ruta.id)" class="action-btn edit-btn">Editar</button>
      <button @click="$emit('eliminar', ruta.id)" class="action-btn delete-btn">Eliminar</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  ruta: {
    type: Object,
    required: true
  }
});

defineEmits(['editar', 'eliminar']);
</script>

<style scoped>
.ruta-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(44, 62, 80, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  margin-bottom: 1rem;
  flex-wrap: wrap; /* Para mejor responsividad */
}

.ruta-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(44, 62, 80, 0.12);
}

.card-content {
  flex-grow: 1;
}

.ruta-nombre {
  font-weight: 600;
  font-size: 1.2rem;
  color: #2c3e50;
  margin: 0 0 0.5rem 0; /* Aumentado el margen inferior */
}

.ruta-descripcion {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0 0 1rem 0; /* Aumentado el margen inferior */
  max-width: 90%; /* Evita que el texto largo se pegue a los botones */
}

/* --- NUEVOS ESTILOS PARA LA SECCIÓN DE DETALLES --- */
.ruta-detalles {
  display: flex;
  gap: 1.5rem;
  font-size: 0.85rem;
  color: #34495e;
}

.detalle-item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.detalle-item strong {
  font-weight: 600;
}
/* ----------------------------------------------- */

.card-actions {
  display: flex;
  gap: 0.75rem;
  margin-left: 1rem; /* Asegura un espacio con el contenido */
}

.action-btn {
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap; /* Evita que el texto del botón se rompa */
}

.edit-btn {
  background-color: #ecf0f1;
  color: #34495e;
}

.edit-btn:hover {
  background-color: #dfe6e9;
}

.delete-btn {
  background-color: #e74c3c;
  color: white;
}

.delete-btn:hover {
  background-color: #c0392b;
}
</style>