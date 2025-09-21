import { ref, computed } from 'vue'
import userManager from '@/auth/authService'
import { useRouter } from 'vue-router'

const user = ref(null)
const isLoading = ref(true)
const isInitialized = ref(false) // <--- NUEVO ESTADO

const initializeAuth = async () => {
  console.log('1. Iniciando comprobación de autenticación...')
  try {
    const userFromStorage = await userManager.getUser()
    if (userFromStorage && !userFromStorage.expired) {
      user.value = userFromStorage
      console.log('2. Usuario encontrado en sesión:', user.value)
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

  const handleLoginCallback = async () => {
    console.log('CALLBACK: Entrando en handleLoginCallback...')
    try {
      const returnedUser = await userManager.signinRedirectCallback()
      console.log('CALLBACK SUCCESS: Usuario procesado correctamente.', returnedUser)

      if (returnedUser) {
        user.value = returnedUser
        console.log('CALLBACK: Estado de usuario actualizado. Redirigiendo a /')
        router.push('/')
      } else {
        console.warn('CALLBACK WARN: No se retornó ningún usuario. Redirigiendo a /')
        router.push('/')
      }
    } catch (error) {
      console.error('CALLBACK ERROR: Falló el signinRedirectCallback.', error)
      console.error('Detalles del error:', {
        name: error.name,
        message: error.message,
        error_details: error.error,
      })

      router.push('/')
    }
  }

  return {
    user,
    isLoading,
    isInitialized,
    isAuthenticated: computed(() => !!user.value && !user.value.expired),
    login: () => userManager.signinRedirect(),
    logout: () => userManager.signoutRedirect(),
    handleLoginCallback,
  }
}
