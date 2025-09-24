import { ref, computed } from 'vue'
import userManager from '@/auth/authService'
import { useRouter } from 'vue-router'
import { crearUsuario } from '@/services/api.js'

const user = ref(null)
const isLoading = ref(true)
const isInitialized = ref(false)
const isAuthenticated = ref(false)

const initializeAuth = async () => {
  console.log('1. Iniciando comprobación de autenticación...')
  try {
    const userFromStorage = await userManager.getUser()
    if (userFromStorage && !userFromStorage.expired) {
      user.value = userFromStorage
      console.log('2. Usuario encontrado en sesión:', user.value.profile)
    } else {
      console.log('2. No se encontró sesión de usuario válida.')
    }
  } catch (error) {
    console.error('Error al inicializar la autenticación:', error)
    user.value = null
  } finally {
    isLoading.value = false
    isInitialized.value = true
    console.log('3. Inicialización de autenticación completada.')
  }
}

initializeAuth()

export function useAuth() {
  const router = useRouter()

  async function handleLoginCallback() {
    try {
      const oidcUser = await userManager.signinRedirectCallback()

      if (oidcUser && !oidcUser.expired) {
        const perfilParaBackend = {
          _id: oidcUser.profile.sub,
          email: oidcUser.profile.email,
          nombreUsuario: oidcUser.profile.name,
        }

        const usuarioDeMiDB = await crearUsuario(perfilParaBackend)

        user.value = oidcUser.profile
        isAuthenticated.value = true
        localStorage.setItem('usuarioId', usuarioDeMiDB._id)

        router.push('/')
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Error en el proceso de callback:', error)
      router.push('/login-error')
    }
  }

  return {
    user,
    isLoading,
    isInitialized,
    isAuthenticated: computed(() => !!user.value && !user.value.expired),
    // Funciones para que tus componentes las usen
    login: () => userManager.signinRedirect(),
    logout: () => {
      // Limpia el localStorage al cerrar sesión
      localStorage.removeItem('usuarioId')
      userManager.signoutRedirect()
    },
    handleLoginCallback,
  }
}
