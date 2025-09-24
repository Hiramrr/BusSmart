import { ref } from 'vue'

const userId = ref(localStorage.getItem('usuarioId'))

const favoritos = ref([])

export function useFavoritos() {
  async function cargarFavoritos() {
    if (!userId.value) {
      console.log('No hay usuario, no se pueden cargar favoritos.')
      return
    }
    try {
      const respuesta = await fetch(`/api/usuarios/${userId.value}`) // Endpoint para obtener datos del usuario
      if (!respuesta.ok) throw new Error('No se pudo obtener la información del usuario.')

      const datosUsuario = await respuesta.json()
      favoritos.value = datosUsuario.rutasFavoritas || []
      console.log('Favoritos cargados:', favoritos.value)
    } catch (error) {
      console.error('Error al cargar favoritos:', error)
      favoritos.value = [] // En caso de error, dejamos la lista vacía
    }
  }
  async function agregarFavorito(ruta) {
    if (!userId.value) return
    try {
      const url = `/api/usuarios/${userId.value}/favoritos`
      const respuesta = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruta: ruta.id }),
      })
      if (!respuesta.ok) throw new Error('Error al agregar favorito.')
      const usuarioActualizado = await respuesta.json()
      favoritos.value = usuarioActualizado.rutasFavoritas // Sincroniza el estado
    } catch (error) {
      console.error(error)
    }
  }

  async function quitarFavorito(ruta) {
    if (!userId.value) return
    try {
      const url = `/api/usuarios/${userId.value}/favoritos/${ruta.id}`
      const respuesta = await fetch(url, {
        method: 'DELETE',
      })
      if (!respuesta.ok) throw new Error('Error al quitar favorito.')
      const usuarioActualizado = await respuesta.json()
      favoritos.value = usuarioActualizado.rutasFavoritas // Sincroniza el estado
    } catch (error) {
      console.error(error)
    }
  }

  function esFavorito(rutaId) {
    return favoritos.value.some((favId) => favId === rutaId)
  }
  return {
    cargarFavoritos,
    favoritos,
    agregarFavorito,
    quitarFavorito,
    esFavorito,
  }
}
