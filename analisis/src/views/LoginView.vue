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
  
  // Validación campos vacíos
  if (!email.value || !password.value) {
    errorMsg.value = 'Ocurrió un problema al procesar la solicitud: Por favor completa todos los campos.';
    return;
  }

  // Intentar login
  const success = authStore.login(email.value, password.value);

  if (success) {
    // Validar que sea rol estudiante
    if (authStore.currentUser?.role !== 'student') {
        errorMsg.value = 'Ocurrió un problema al procesar la solicitud: Esta cuenta es de administrador. Usa el portal administrativo.';
        authStore.logout();
        return;
    }
    router.push('/'); // Ir a Home
  } else {
    // Error de credenciales
    errorMsg.value = 'Ocurrió un problema al procesar la solicitud: Credenciales incorrectas.';
  }
};

const goToRegister = () => router.push('/register');
const goToAdmin = () => router.push('/admin-login');
const goHome = () => router.push('/'); // Acción para volver
</script>

<template>
  <div class="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-[#002e5f]">
    
    <!-- Patrón de fondo -->
    <div class="absolute inset-0 opacity-10 pointer-events-none">
       <div class="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)]" style="background-size: 60px 60px;"></div>
    </div>

    <div class="bg-white w-full max-w-xl rounded-[30px] shadow-2xl p-8 md:p-12 relative z-10 mx-4">
      
      <!-- Botón flotante para volver al Home -->
      <button 
        @click="goHome"
        class="absolute top-4 left-4 text-gray-400 hover:text-[#002e5f] text-sm font-bold flex items-center gap-1"
      >
        ← Volver al Inicio
      </button>

      <!-- Header -->
      <div class="flex flex-col items-center mb-8 mt-4">
         <div class="w-full flex justify-between items-start mb-2">
           <div class="w-16"></div>
           <div class="text-center">
             <h1 class="text-3xl font-bold text-black">Inicio de Sesión</h1>
             <h2 class="text-xl font-bold text-[#e6b012] mt-1 tracking-widest uppercase">Servicios en Línea</h2>
           </div>
           <div class="w-16 md:w-20">
             <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Logo_de_la_UANL.svg/1200px-Logo_de_la_UANL.svg.png" alt="Logo" class="w-full h-auto object-contain">
           </div>
        </div>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        
        <div class="space-y-2">
          <label class="block text-gray-900 font-bold">Ingresar correo:</label>
          <input 
            v-model="email"
            type="text" 
            placeholder="example@uanl.edu.mx" 
            class="w-full border border-gray-400 rounded p-3 text-gray-600 focus:outline-none focus:border-[#e6b012]"
          >
        </div>

        <div class="space-y-2">
          <label class="block text-red-600 font-bold">Contraseña:</label>
          <div class="relative">
            <input v-model="password" :type="showPassword ? 'text' : 'password'" class="w-full border border-gray-400 rounded p-3 text-gray-600 pr-10 focus:outline-none focus:border-[#e6b012]">
            <button type="button" @click="showPassword = !showPassword" class="absolute inset-y-0 right-0 pr-3 text-gray-400">
              {{ showPassword ? '🔒' : '👁️' }}
            </button>
          </div>
        </div>

        <div class="flex justify-center pt-4">
          <button type="submit" class="bg-[#e6b012] hover:bg-[#c99a0e] text-white font-bold text-lg py-2 px-12 rounded shadow-md w-full md:w-auto">
            Entrar
          </button>
        </div>
      </form>

      <div class="mt-8 flex flex-col items-center gap-2 text-sm">
        <div class="flex gap-2 font-bold">
            <span>¿Eres nuevo ingreso?</span>
            <button @click="goToRegister" class="text-[#dc3545] underline">Regístrate aquí</button>
        </div>
        <button @click="goToAdmin" class="text-gray-400 underline text-xs mt-2">Acceso Administrativo</button>
      </div>

    </div>
    
    <!-- Error Alert -->
    <div v-if="errorMsg" class="absolute bottom-8 w-[90%] md:w-auto animate-bounce">
      <div class="bg-[#ff6b6b] text-white font-bold py-3 px-8 rounded-full shadow-lg text-center">
        {{ errorMsg }}
      </div>
    </div>
  </div>
</template>