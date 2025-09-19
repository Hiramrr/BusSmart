import { reactive, toRefs } from 'vue'
import { UserManager } from 'oidc-client-ts'

const state = reactive({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
})

let userManager

const methods = {
  login() {
    return userManager.signinRedirect()
  },

  async handleRedirectCallback() {
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
    try {
      const user = await userManager.signinSilent()
      state.user = user.profile
      state.isAuthenticated = true
      return user
    } catch (e) {
      state.isAuthenticated = false
      state.user = null
      state.error = e
    }
  },
}

async function initAuth(options) {
  const settings = {
    authority: `https://${options.domain}`,
    client_id: options.client_id,
    redirect_uri: window.location.origin,
    post_logout_redirect_uri: window.location.origin,
    response_type: 'code',
    scope: 'openid profile email',
  }

  userManager = new UserManager(settings)

  if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
    try {
      await methods.handleRedirectCallback()
      window.history.replaceState({}, document.title, window.location.pathname)
    } catch (e) {
      console.error('Error en el callback de redirección:', e)
      state.error = e
    }
  } else {
    await methods.renewToken()
  }

  state.isLoading = false
}

export const Auth0Plugin = {
  install: (app, options) => {
    app.config.globalProperties.$auth = {
      ...toRefs(state),
      ...methods,
    }

    initAuth(options)
  },
}
