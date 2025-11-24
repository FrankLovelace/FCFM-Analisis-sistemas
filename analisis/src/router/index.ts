// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import EventDetailView from '../views/EventDetailView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Home', component: HomeView },
    { path: '/login', name: 'Login', component: LoginView },
    { path: '/register', name: 'Register', component: RegisterView },
    { path: '/event/:id', name: 'EventDetail', component: EventDetailView },
    { 
      path: '/admin', 
      name: 'Admin', 
      component: () => import('../views/DashboardView.vue'), 
      meta: { requiresAuth: true, role: 'admin' } // <--- AÑADIMOS REQUISITO DE ROL
    },
  ]
});

router.beforeEach((to, from, next) => {
  const session = localStorage.getItem('uni_session');
  const userStr = localStorage.getItem('uni_user');
  const isAuthenticated = session === 'valid' && userStr;
  
  let userRole = '';
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      userRole = user.role;
    } catch (e) {
      console.error("Error al leer usuario");
    }
  }

  // 1. Si la ruta requiere Login y no lo tenemos -> Login
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } 
  // 2. Si la ruta requiere ser ADMIN y somos STUDENT -> Home (o error)
  else if (to.meta.role === 'admin' && userRole !== 'admin') {
    alert("No tienes permisos de administrador para acceder a esta zona.");
    next('/'); // Lo mandamos al inicio
  }
  // 3. Si ya estamos logueados y queremos ir a Login o Register -> Redirigir según rol
  else if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
    if (userRole === 'admin') next('/admin');
    else next('/');
  } 
  else {
    next();
  }
});

export default router;