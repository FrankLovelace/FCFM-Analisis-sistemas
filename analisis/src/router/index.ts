// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';

// IMPORTACIÓN DE VISTAS
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import DashboardView from '../views/DashboardView.vue';
import EventDetailView from '../views/EventDetailView.vue';
import PaymentConfirmationView from '../views/PaymentConfirmationView.vue';
import MyEventsView from '../views/MyEventsView.vue'; // <--- AQUÍ ESTÁ LA VISTA NUEVA

const router = createRouter({
  history: createWebHistory(),
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

    // 5. MIS EVENTOS (Requiere Auth) <-- ESTA ES LA QUE TE FALTABA
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