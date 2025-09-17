// src/auth/index.js
import { reactive, toRefs } from 'vue'
import { UserManager } from 'oidc-client-ts'

// Estado reactivo global
const state = reactive({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
})

let userManager

// Métodos para interactuar
const methods = {
  login() {
    // Redirige a Auth0 para iniciar sesión
    return userManager.signinRedirect()
  },

  async handleRedirectCallback() {
    // Maneja la respuesta de Auth0 después de la redirección
    try {
      const user = await userManager.signinRedirectCallback()
      state.user = user.profile // Guardamos el perfil del usuario
      state.isAuthenticated = true
      return user
    } catch (e) {
      state.error = e
      throw e
    }
  },

  logout() {
    // Cierra la sesión
    return userManager.signoutRedirect()
  },

  async renewToken() {
    // Renueva el token silenciosamente
    try {
      const user = await userManager.signinSilent()
      state.user = user.profile
      state.isAuthenticated = true
      return user
    } catch (e) {
      // Si falla el inicio de sesión silencioso, cerramos la sesión
      state.isAuthenticated = false
      state.user = null
    }
  },
}

// Función para inicializar y comprobar la sesión al cargar la página
async function initAuth(options) {
  const settings = {
    authority: `https://${options.domain}`, // Tu dominio de Auth0
    client_id: options.client_id, // Tu client_id
    redirect_uri: window.location.origin, // A dónde volver después del login
    post_logout_redirect_uri: window.location.origin, // A dónde ir después del logout
    response_type: 'code',
    scope: 'openid profile email',
  }

  userManager = new UserManager(settings)

  // Revisa si el usuario viene de una redirección de login
  if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
    try {
      await methods.handleRedirectCallback()
      // Limpia la URL para quitar los parámetros de Auth0
      window.history.replaceState({}, document.title, window.location.pathname)
    } catch (e) {
      console.error('Error en el callback de redirección:', e)
      state.error = e
    }
  } else {
    // Si no es un callback, intenta renovar la sesión silenciosamente
    await methods.renewToken()
  }

  state.isLoading = false
}

// El plugin de Vue
export const Auth0Plugin = {
  install: (app, options) => {
    // Exponemos el estado y los métodos globalmente
    app.config.globalProperties.$auth = {
      ...toRefs(state),
      ...methods,
    }

    // Inicializamos todo
    initAuth(options)
  },
}
