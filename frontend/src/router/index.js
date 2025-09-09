import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    }
    // {
    //   path: '/mapa',
    //   name: 'mapa',
    //   // Esta es una forma de "carga diferida" (lazy-loading).
    //   // El código de MapaView solo se descarga cuando el usuario visita /mapa.
    //   // ¡Es una buena práctica para optimizar la carga inicial de tu app!
    //   component: () => import('../views/MapaView.vue')
    // },
    // {
    //   path: '/login',
    //   name: 'login',
    //   // También usamos carga diferida para la vista de login.
    //   component: () => import('../views/LoginView.vue')
    // }
  ]
})

export default router