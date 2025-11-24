// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // RUTA PÚBLICA: Página principal de eventos
    { 
      path: '/', 
      name: 'Home', 
      component: HomeView 
    },
    
    // RUTA PÚBLICA: Login
    { 
      path: '/login', 
      name: 'Login', 
      component: LoginView 
    },

    // RUTA PRIVADA: Panel de Administración (CRUD)
    { 
      path: '/admin', 
      name: 'Admin', 
      component: () => import('../views/DashboardView.vue'), 
      meta: { requiresAuth: true } 
    },
  ]
});

// GUARDIÁN DE NAVEGACIÓN
router.beforeEach((to, from, next) => {
  // Verificamos si hay sesión
  const isAuthenticated = localStorage.getItem('uni_session') === 'valid';
  
  // CASO 1: La ruta requiere autenticación y NO estamos logueados
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login'); // Te mando al login
  } 
  // CASO 2: Ya estamos logueados y queremos ir al login (Redirigir al admin para no loguear de nuevo)
  else if (to.path === '/login' && isAuthenticated) {
    next('/admin');
  } 
  // CASO 3: Ruta pública (como la Home), pasa sin problemas
  else {
    next();
  }
});

export default router;