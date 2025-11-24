import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import HomeView from '../views/HomeView.vue'; 

// Haremos lazy loading del dashboard para mejor práctica
const DashboardView = () => import('../views/DashboardView.vue');

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'Login', component: LoginView },
    { path: '/', name: 'Dashboard', component: DashboardView, meta: { requiresAuth: true } },
    { path: '/admin', name: 'Admin', component: () => import('../views/DashboardView.vue'), meta: { requiresAuth: true } },
  ]
});

// Guard de navegación (Protección de rutas)
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('uni_session') === 'valid';
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;