import { UserManager, WebStorageStateStore } from 'oidc-client-ts'

const settings = {
  authority: 'https://dev-rpyuayp11lw3b1hr.us.auth0.com',
  client_id: 'R17ZqQ6NgSSSsl8UStd0sqQOwVxMpzw4',
  redirect_uri: `${window.location.origin}/callback`,
  silent_redirect_uri: `${window.location.origin}/silent-renew.html`,
  automaticSilentRenew: true,
  post_logout_redirect_uri: window.location.origin,
  response_type: 'code',
  scope: 'openid profile email',
  extraQueryParams: {
    audience: import.meta.env.DEV ? 'http://localhost:3000' : 'https://bussmart.onrender.com',
  },
  userStore: new WebStorageStateStore({ store: window.localStorage }),
}

const userManager = new UserManager(settings)

userManager.events.addUserSignedOut(() => {
  console.log('Usuario cerró sesión')
})

export default userManager
