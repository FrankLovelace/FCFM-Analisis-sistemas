<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/AuthStore';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const errorMsg = ref('');

const handleLogin = () => {
  errorMsg.value = '';
  
  if (!email.value || !password.value) {
    errorMsg.value = 'Ocurrió un problema al procesar la solicitud: Completa las credenciales.';
    return;
  }
  
  const success = authStore.login(email.value, password.value);

  if (success) {
    // Validar Rol ADMIN
    if (authStore.currentUser?.role !== 'admin') {
        errorMsg.value = 'Ocurrió un problema al procesar la solicitud: No tienes permisos de administrador.';
        authStore.logout();
        return;
    }
    router.push('/admin'); // Ir al Dashboard
  } else {
    errorMsg.value = 'Ocurrió un problema al procesar la solicitud: Credenciales inválidas.';
  }
};

const goToUserLogin = () => router.push('/login');
const goHome = () => router.push('/');
</script>

<template>
  <div class="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-gray-900">
    
    <div class="bg-white w-full max-w-md rounded-lg shadow-2xl p-8 relative z-10 mx-4 border-t-8 border-uni-blue">
      
      <!-- Botón Volver -->
      <button 
        @click="goHome"
        class="absolute top-4 left-4 text-gray-400 hover:text-uni-blue text-xs font-bold"
      >
        ← Inicio
      </button>

      <div class="text-center mb-6 mt-2">
        <h1 class="text-2xl font-bold text-uni-blue">Portal Administrativo</h1>
        <p class="text-gray-500 text-sm">Gestión de Eventos UANL</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div class="space-y-1">
          <label class="block text-gray-700 font-bold text-sm">Ingresar correo:</label>
          <input v-model="email" type="text" class="w-full border rounded p-2 focus:ring-2 focus:ring-uni-blue outline-none">
        </div>

        <div class="space-y-1">
          <label class="block text-gray-700 font-bold text-sm">Contraseña:</label>
          <div class="relative">
            <input v-model="password" :type="showPassword ? 'text' : 'password'" class="w-full border rounded p-2 pr-10 focus:ring-2 focus:ring-uni-blue outline-none">
            <button type="button" @click="showPassword = !showPassword" class="absolute right-2 top-2 text-gray-400">
                {{ showPassword ? '🔒' : '👁️' }}
            </button>
          </div>
        </div>

        <button type="submit" class="w-full bg-uni-blue hover:bg-blue-800 text-white font-bold py-2 rounded shadow">
            Iniciar Sesión
        </button>
      </form>

      <div class="mt-6 text-center">
        <button @click="goToUserLogin" class="text-sm text-gray-500 hover:text-uni-blue underline">
            ← Volver al login de alumnos
        </button>
      </div>

    </div>
    
    <!-- Error Estandarizado -->
    <div v-if="errorMsg" class="absolute bottom-10 w-[90%] md:w-auto text-center bg-red-600 text-white px-6 py-3 rounded shadow font-bold animate-bounce">
        {{ errorMsg }}
    </div>
  </div>
</template>