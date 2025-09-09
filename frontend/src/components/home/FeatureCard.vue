<template>
    <div class="feature-card">
      <div class="feature-icon">{{ icon }}</div>
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
    </div>
  </template>
  
  <script setup>
  // Definimos las "propiedades" que este componente espera recibir.
  // Son como los parámetros de una función.
  defineProps({
    icon: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  });
  </script>
  
  <style scoped>
  /* Estos estilos solo se aplican a este componente y no afectarán a otros. */
  .feature-card {
    background-color: #f9f9f9;
    border-radius: 12px;
    padding: 24px;
    text-align: center;
    border: 1px solid #eee;
    transition: transform 0.3s ease;
  }
  
  .feature-card:hover {
    transform: translateY(-5px);
  }
  
  .feature-icon {
    font-size: 2.5rem; /* 40px */
    margin-bottom: 16px;
  }
  
  h3 {
    margin-bottom: 8px;
    font-size: 1.25rem; /* 20px */
  }
  
  p {
    color: #666;
    line-height: 1.6;
  }
  </style>