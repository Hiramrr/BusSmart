import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

import { domain, client_id } from './auth/auth_config.json'
import { Auth0Plugin } from './auth'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(Auth0Plugin, {
  domain,
  client_id,
})

app.mount('#app')
