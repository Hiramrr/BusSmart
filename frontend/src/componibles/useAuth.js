import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import userManager from '@/auth/authService.js'
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

const getUserRoles = (user) => {
  if (!user || !user.profile) return []

  const roles =
    user.profile['https://bussmart.com/roles'] ||
    user.profile.roles ||
    user.profile['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
    []

  return Array.isArray(roles) ? roles : [roles]
}

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

  const isAdmin = computed(() => {
    if (!user.value) return false
    const roles = getUserRoles(user.value)
    return roles.includes('Administrador') || roles.includes('Administrator')
  })

  const userRoles = computed(() => {
    if (!user.value) return []
    return getUserRoles(user.value)
  })

  return {
    user,
    isLoading,
    isInitialized,
    isAuthenticated: computed(() => !!user.value && !user.value.expired),
    isAdmin,
    userRoles,
    login: () => userManager.signinRedirect(),
    logout: () => {
      localStorage.removeItem('usuarioId')
      userManager.signoutRedirect()
    },
    handleLoginCallback,
  }
}

if (typeof window !== 'undefined') {
  window.debugAuth = async () => {
    try {
      const user = await userManager.getUser()
      if (user && user.access_token) {
        console.log('🎫 Usuario:', user.profile)
        console.log('🔑 Roles:', getUserRoles(user))
        console.log('🎫 Token completo:', user.access_token)

        const tokenParts = user.access_token.split('.')
        const payload = JSON.parse(atob(tokenParts[1]))
        console.log('📋 Payload del token:', payload)

        return { user, payload, roles: getUserRoles(user) }
      } else {
        console.log('No hay usuario autenticado')
      }
    } catch (error) {
      console.error('Error al obtener info del usuario:', error)
    }
  }
}
