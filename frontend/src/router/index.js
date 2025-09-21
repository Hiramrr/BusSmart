import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/Map',
      name: 'Map',
      component: () => import('../views/MapView.vue'),
    },
    {
      path: '/callback',
      name: 'Callback',
      component: () => import('../views/CallBack.vue'),
    },
    {
      path: '/perfil',
      name: 'perfil',
      component: () => import('../views/UserView.vue'),
    },
  ],
})

export default router
