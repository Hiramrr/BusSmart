import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

// Vistas del panel de administración (RUTAS CORREGIDAS)
import AdminView from '../views/AdminView.vue'
import GestionRutasView from '../views/GestionRutasView.vue'
import RutaEditorView from '../views/RutaEditorView.vue'

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
    {
      path: '/admin',
      component: AdminView,
      children: [
        {
          path: '',
          redirect: '/admin/rutas'
        },
        {
          path: 'rutas',
          name: 'gestion-rutas',
          component: GestionRutasView
        },
        {
          path: 'rutas/crear',
          name: 'crear-ruta',
          component: RutaEditorView
        },
        {
          path: 'rutas/editar/:id',
          name: 'editar-ruta',
          component: RutaEditorView
        }
      ]
    }
  ],
})

export default router