// src/router/index.ts
// IMPORTACIÓN DE VISTAS
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import DashboardView from '../views/DashboardView.vue';
import EventDetailView from '../views/EventDetailView.vue';
import PaymentConfirmationView from '../views/PaymentConfirmationView.vue';
import MyEventsView from '../views/MyEventsView.vue'; 
import AdminApprovalsView from '../views/admin/AdminApprovalsView.vue';
import AdminReportsView from '../views/admin/AdminReportsView.vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import AdminLoginView from '../views/AdminLoginView.vue';

const router = createRouter({
  // CAMBIO AQUÍ: Usar Hash en lugar de WebHistory
  history: createWebHashHistory(),
  routes: [
    // 1. HOME (Pública)
    { 
      path: '/', 
      name: 'Home', 
      component: HomeView 
    },
    
    // 2. LOGIN
    { 
      path: '/login', 
      name: 'Login', 
      component: LoginView 
    },
     { 
      path: '/admin-login', 
      name: 'AdminLogin', 
      component: AdminLoginView 
    },

    // 3. REGISTRO
    { 
      path: '/register', 
      name: 'Register', 
      component: RegisterView 
    },

    // 4. DETALLE DE EVENTO (Pública o mixta)
    { 
      path: '/event/:id', 
      name: 'EventDetail', 
      component: EventDetailView 
    },
    { 
      path: '/my-events', 
      name: 'MyEvents', 
      component: MyEventsView,
      meta: { requiresAuth: true }
    },

    // 6. CONFIRMACIÓN DE PAGO (Requiere Auth)
    { 
      path: '/payment/:id', 
      name: 'Payment', 
      component: PaymentConfirmationView, 
      meta: { requiresAuth: true }
    },
     {
      path: '/admin',
      component: () => import('../views/DashboardView.vue'), // Dashboard Layout
      meta: { requiresAuth: true, role: 'admin' },
      children: [
        { path: '', name: 'AdminEvents', component: () => import('../components/AdminEventList.vue') }, 
        { path: 'reports', name: 'AdminReports', component: AdminReportsView }
      ]
    },

    // 7. ADMIN DASHBOARD (Requiere Auth y Rol Admin)
    { 
      path: '/admin', 
      name: 'Admin', 
      component: DashboardView, 
      meta: { requiresAuth: true, role: 'admin' }
    },
  ]
});

// GUARDIÁN DE NAVEGACIÓN (Seguridad)
router.beforeEach((to, _from, next) => {
  const session = localStorage.getItem('uni_session');
  const userStr = localStorage.getItem('uni_user');
  const isAuthenticated = session === 'valid' && userStr;
  
  let userRole = '';
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      userRole = user.role;
    } catch (e) {
      console.error("Error leyendo usuario");
    }
  }

  // REGLAS
  if (to.meta.requiresAuth && !isAuthenticated) {
    // Si requiere login y no estás logueado -> Login
    next('/login');
  } 
  else if (to.meta.role === 'admin' && userRole !== 'admin') {
    // Si requiere ser admin y no lo eres -> Home
    alert("Acceso denegado: Se requieren permisos de administrador.");
    next('/');
  }
  else if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
    // Si ya estás logueado no entres a login/register
    if (userRole === 'admin') next('/admin');
    else next('/');
  } 
  else {
    // Pasa
    next();
  }
});

export default router;