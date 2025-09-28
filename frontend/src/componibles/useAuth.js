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

        try {
          const usuarioDeMiDB = await crearUsuario(perfilParaBackend)

          user.value = oidcUser
          isAuthenticated.value = true
          localStorage.setItem('usuarioId', usuarioDeMiDB._id)

          await router.push('/')
        } catch (backendError) {
          console.error('❌ Error del backend, pero permitiendo login:', backendError)
          user.value = oidcUser
          isAuthenticated.value = true
          await router.push('/')
        }
      } else {
        await router.push('/')
      }
    } catch (error) {
      console.error('❌ Error en callback:', error)
      await router.push('/?error=login_failed')
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

// En useAuth.js, actualiza la función debugAuth
if (typeof window !== 'undefined') {
  window.debugAuth = async () => {
    try {
      const user = await userManager.getUser()
      if (user && user.access_token) {
        console.log('🎫 Token completo para curl:')
        console.log(user.access_token)
        console.log('\n📋 Comando curl listo para usar:')
        console.log(`curl -X PUT http://localhost:3000/api/user/favoritos \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${user.access_token}" \\
  -d '{"rutaId": "2744"}' \\
  -v`)

        const tokenParts = user.access_token.split('.')
        const payload = JSON.parse(atob(tokenParts[1]))
        console.log('Audience en token:', payload.aud)
        return { user, payload }
      } else {
        console.log('No hay usuario autenticado')
      }
    } catch (error) {
      console.error('Error al obtener info del usuario:', error)
    }
  }
}
