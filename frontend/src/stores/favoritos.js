import { ref } from 'vue';

const favoritos = ref([]);

export function useFavoritos() {
  function agregarFavorito(ruta) {
    if (!favoritos.value.find(r => r.id === ruta.id)) {
      favoritos.value.push(ruta);
    }
  }
  function quitarFavorito(rutaId) {
    favoritos.value = favoritos.value.filter(r => r.id !== rutaId);
  }
  function esFavorito(rutaId) {
    return favoritos.value.some(r => r.id === rutaId);
  }
  return {
    favoritos,
    agregarFavorito,
    quitarFavorito,
    esFavorito
  };
}
