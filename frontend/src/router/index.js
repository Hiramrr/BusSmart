import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

// Vistas del panel de administración
import AdminView from '../views/AdminView.vue'
import GestionRutasView from '../views/GestionRutasView.vue'
// import RutaEditorView from '../views/admin/RutaEditorView.vue';

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
      // NOTA: En el futuro, puedes añadir aquí "meta fields" para proteger estas rutas, por ejemplo:
      // meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: '', // Si alguien va a /admin, lo redirigimos a la gestión de rutas
          redirect: '/admin/rutas'
        },
        {
          path: 'rutas',
          name: 'gestion-rutas',
          component: GestionRutasView
        },
        // --- Rutas para crear y editar (descomentar cuando crees RutaEditorView.vue) ---
        /*
        {
          path: 'rutas/crear',
          name: 'crear-ruta',
          component: RutaEditorView
        },
        {
          path: 'rutas/editar/:id', // Usamos un parámetro dinámico para el ID de la ruta
          name: 'editar-ruta',
          component: RutaEditorView // Reutilizamos el mismo componente para editar
        }
        */
      ]
    }
  ],
})

export default router