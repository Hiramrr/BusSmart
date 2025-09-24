import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useForoStore = defineStore('foro', () => {
  // Reportes en memoria, luego se conectará a la BD
  const reportes = ref([]);

  function agregarReporte(reporte) {
    reportes.value.unshift({ ...reporte, fecha: new Date().toLocaleString() });
    // Aquí se puede agregar lógica para guardar en la BD en el futuro
  }

  return { reportes, agregarReporte };
});
