<template>
  <div class="ruta-card-admin">
    <div class="card-header">
      <div class="ruta-avatar">
        <img v-if="ruta.image" :src="getImageUrl(ruta.image)" :alt="'Imagen de ' + ruta.nombre" class="ruta-image">
        <span v-else class="ruta-numero">#{{ ruta.numero_ruta }}</span>
      </div>
      <h3 class="ruta-nombre">{{ ruta.nombre }}</h3>
    </div>
    
    <div class="card-body">
      <p v-if="ruta.descripcion" class="ruta-descripcion">
        {{ ruta.descripcion }}
      </p>
      <div v-else class="ruta-horarios-fallback">
        <div class="ruta-horario"><span>⏰</span><strong>Primer Autobús:</strong> 5:30 am</div>
        <div class="ruta-horario"><span>🌙</span><strong>Último Autobús:</strong> 10:00 pm</div>
        <div class="ruta-horario"><span>🕑</span><strong>Frecuencia:</strong> 10 - 20 min.</div>
      </div>
    </div>

    <div class="card-footer">
      <div class="ruta-info">
        📍 {{ ruta.puntos_recorrido || 0 }} puntos en el recorrido
      </div>
      <div class="card-actions">
        <button @click="$emit('editar', ruta.id)" class="btn-editar">Editar</button>
        <button @click="$emit('eliminar', ruta.id)" class="btn-eliminar">Eliminar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { API_BASE_URL } from '@/config.js'; // Importamos la URL base

defineProps({
  ruta: {
    type: Object,
    required: true,
  },
});

defineEmits(['editar', 'eliminar']);

function getImageUrl(imagePath) {
  return imagePath ? `${API_BASE_URL}${imagePath}` : '';
}
</script>

<style scoped>
.ruta-card-admin {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
}
.ruta-card-admin:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}
.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
}
.ruta-avatar {
  width: 50px;
  height: 50px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  background-color: #e9ecef;
}
.ruta-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.ruta-numero {
  background-color: #3498db;
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ruta-nombre {
  margin: 0;
  font-size: 1.25rem;
  color: #2c3e50;
}
.card-body {
  flex-grow: 1;
  padding: 1rem 0;
  font-size: 0.95rem;
  color: #555;
}
.ruta-horarios-fallback {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.ruta-horario {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.card-footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.ruta-info {
  font-size: 0.85rem;
  color: #7f8c8d;
}
.card-actions {
  display: flex;
  gap: 0.5rem;
}
.btn-editar, .btn-eliminar {
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}
.btn-editar {
  background-color: #2ecc71;
  color: white;
}
.btn-editar:hover {
  background-color: #27ae60;
}
.btn-eliminar {
  background-color: #e74c3c;
  color: white;
}
.btn-eliminar:hover {
  background-color: #c0392b;
}
</style>