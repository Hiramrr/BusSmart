<template>
  <div class="ruta-card-admin">
    <div class="card-header">
      <div class="ruta-avatar">
        <img
          v-if="ruta.image || ruta.ruta"
          :src="getImageUrl(ruta.image)"
          :alt="'Imagen de ' + ruta.nombre"
          class="ruta-image"
          @error="handleImageError"
        />
        <span v-else class="ruta-numero">🚌</span>
      </div>
      <div class="header-info">
        <h3 class="ruta-nombre">{{ ruta.nombre }}</h3>
        <span class="ruta-id">Ruta #{{ ruta.numero_ruta }}</span>
      </div>
    </div>

    <div class="card-body">
      <p v-if="ruta.descripcion" class="ruta-descripcion">
        {{ ruta.descripcion }}
      </p>
      <div v-else class="ruta-horarios-fallback">
        <div class="ruta-horario">
          <span class="icon">⏰</span>
          <span><strong>Primer Autobús:</strong> 5:30 am</span>
        </div>
        <div class="ruta-horario">
          <span class="icon">🌙</span>
          <span><strong>Último Autobús:</strong> 10:00 pm</span>
        </div>
        <div class="ruta-horario">
          <span class="icon">🕑</span>
          <span><strong>Frecuencia:</strong> 10 - 20 min.</span>
        </div>
      </div>
    </div>

    <div class="card-footer">
      <div class="ruta-info">
        <span class="info-badge"> 📍 {{ ruta.puntos_recorrido || 0 }} puntos </span>
      </div>
      <div class="card-actions">
        <button @click="$emit('editar', ruta.id)" class="btn-action btn-editar" title="Editar ruta">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          <span>Editar</span>
        </button>
        <button
          @click="$emit('eliminar', ruta.id)"
          class="btn-action btn-eliminar"
          title="Eliminar ruta"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="3 6 5 6 21 6"></polyline>
            <path
              d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
            ></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
          <span>Eliminar</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getImageUrl } from '@/config.js'

defineProps({
  ruta: {
    type: Object,
    required: true,
  },
})

defineEmits(['editar', 'eliminar'])

function handleImageError(event) {
  event.target.style.display = 'none'
  event.target.parentElement.innerHTML = '<span class="ruta-numero">🚌</span>'
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap');

.ruta-card-admin {
  background: linear-gradient(135deg, #e3f0ff 0%, #f9f9f9 100%);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(44, 62, 80, 0.08);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: 'Montserrat', Arial, sans-serif;
  border: 1px solid rgba(52, 152, 219, 0.1);
}

.ruta-card-admin:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 8px 24px rgba(44, 62, 80, 0.15);
  border-color: rgba(52, 152, 219, 0.3);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.ruta-avatar {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
}

.ruta-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ruta-numero {
  font-size: 1.8rem;
  filter: brightness(0) invert(1);
}

.header-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.ruta-nombre {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.3;
}

.ruta-id {
  font-size: 0.85rem;
  color: #3498db;
  font-weight: 500;
}

.card-body {
  flex-grow: 1;
  font-size: 0.95rem;
  color: #555;
}

.ruta-descripcion {
  margin: 0;
  line-height: 1.6;
  color: #555;
}

.ruta-horarios-fallback {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.ruta-horario {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.9rem;
  color: #555;
}

.ruta-horario .icon {
  font-size: 1.1rem;
}

.card-footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ruta-info {
  display: flex;
  align-items: center;
}

.info-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: #7f8c8d;
  background: rgba(255, 255, 255, 0.7);
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-weight: 500;
}

.card-actions {
  display: flex;
  gap: 0.6rem;
  width: 100%;
}

.btn-action {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  padding: 0.7rem 1rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Montserrat', Arial, sans-serif;
}

.btn-action svg {
  flex-shrink: 0;
}

.btn-editar {
  background: #2ecc71;
  color: white;
  box-shadow: 0 2px 8px rgba(46, 204, 113, 0.3);
}

.btn-editar:hover {
  background: #27ae60;
  box-shadow: 0 4px 12px rgba(46, 204, 113, 0.4);
  transform: translateY(-2px);
}

.btn-eliminar {
  background: #e74c3c;
  color: white;
  box-shadow: 0 2px 8px rgba(231, 76, 60, 0.3);
}

.btn-eliminar:hover {
  background: #c0392b;
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4);
  transform: translateY(-2px);
}

.btn-action:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .card-actions {
    flex-direction: column;
  }

  .btn-action {
    width: 100%;
  }
}
</style>
