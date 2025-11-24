<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/AuthStore';

const router = useRouter();
const authStore = useAuthStore();

// 'student' es el default, 'admin' es para personal
const loginType = ref<'student' | 'admin'>('student');

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const errorMsg = ref('');

// Cambiar de pestaña limpia los campos y errores
const setLoginType = (type: 'student' | 'admin') => {
  loginType.value = type;
  errorMsg.value = '';
  email.value = '';
  password.value = '';
};

const handleLogin = () => {
  errorMsg.value = '';

  if (!email.value || !password.value) {
    errorMsg.value = 'Por favor completa todos los campos.';
    return;
  }

  // 1. Intentamos loguear con el store (verifica credenciales)
  const success = authStore.login(email.value, password.value);

  if (success) {
    // 2. Verificamos que el ROL del usuario coincida con la PESTAÑA activa
    const currentUser = authStore.currentUser;

    if (loginType.value === 'admin' && currentUser?.role !== 'admin') {
      errorMsg.value = 'Error: Esta cuenta no tiene permisos administrativos.';
      authStore.logout(); // Cerramos la sesión "falsa" creada
      return;
    }

    if (loginType.value === 'student' && currentUser?.role !== 'student') {
      // Opcional: Permitir que un admin entre como alumno, pero por seguridad lo bloqueamos aquí
      errorMsg.value = 'Por favor utiliza la pestaña de Personal Administrativo.';
      authStore.logout();
      return;
    }

    // 3. Redirección según rol
    if (loginType.value === 'admin') {
      router.push('/admin'); // Al Dashboard
    } else {
      router.push('/'); // Al Home (Usuario ya logueado)
    }

  } else {
    errorMsg.value = 'Credenciales incorrectas.';
  }
};

const goToRegister = () => {
  router.push('/register'); // <--- 
};
</script>

<template>
  <div class="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-[#002e5f]">
    
    <!-- Background pattern -->
    <div class="absolute inset-0 opacity-10 pointer-events-none">
       <div class="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)]" style="background-size: 60px 60px;"></div>
    </div>

    <div class="bg-white w-full max-w-2xl rounded-[30px] shadow-2xl overflow-hidden relative z-10 mx-4 flex flex-col">
      
      <!-- PESTAÑAS SUPERIORES -->
      <div class="flex text-center font-bold text-sm md:text-lg">
        <button 
          @click="setLoginType('student')"
          class="flex-1 py-4 transition-colors duration-300"
          :class="loginType === 'student' ? 'bg-white text-[#002e5f] border-b-4 border-[#e6b012]' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'"
        >
          ALUMNOS
        </button>
        <button 
          @click="setLoginType('admin')"
          class="flex-1 py-4 transition-colors duration-300"
          :class="loginType === 'admin' ? 'bg-white text-[#002e5f] border-b-4 border-[#e6b012]' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'"
        >
          PERSONAL / ADMIN
        </button>
      </div>

      <div class="p-8 md:p-12">
        
        <!-- Header -->
        <div class="flex flex-col items-center mb-8">
           <div class="w-full flex justify-between items-start mb-2">
             <div class="w-16"></div>
             <div class="text-center">
               <h1 class="text-3xl font-bold text-black">Inicio de Sesión</h1>
               <!-- Texto dinámico según pestaña -->
               <h2 class="text-xl font-bold text-[#e6b012] mt-1 tracking-widest uppercase">
                 {{ loginType === 'student' ? 'Servicios en Línea' : 'Administración' }}
               </h2>
             </div>
             <div class="w-16 md:w-20">
               <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Logo_de_la_UANL.svg/1080px-Logo_de_la_UANL.svg.png" alt="Logo" class="w-full h-auto object-contain">
             </div>
          </div>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          
          <div class="space-y-2">
            <label class="block text-gray-900 font-bold">
              {{ loginType === 'student' ? 'Matrícula o Correo:' : 'No. Empleado o Correo:' }}
            </label>
            <input 
              v-model="email"
              type="text" 
              placeholder="Ingrese sus credenciales" 
              class="w-full border border-gray-400 rounded p-3 text-gray-600 focus:outline-none focus:border-[#e6b012] focus:ring-1 focus:ring-[#e6b012]"
            >
          </div>

          <div class="space-y-2">
            <label class="block text-red-600 font-bold">Contraseña:</label>
            <div class="relative">
              <input 
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="w-full border border-gray-400 rounded p-3 text-gray-600 pr-10 focus:border-[#e6b012] focus:ring-1 focus:ring-[#e6b012] focus:outline-none"
                :class="{'border-red-400': errorMsg}"
              >
              <button type="button" @click="showPassword = !showPassword" class="absolute inset-y-0 right-0 pr-3 text-gray-400 hover:text-gray-600">
                <!-- Icono ojo simple -->
                <span v-if="!showPassword">👁️</span>
                <span v-else>🔒</span>
              </button>
            </div>
          </div>

          <div class="flex justify-center pt-4">
            <button 
              type="submit"
              class="bg-[#e6b012] hover:bg-[#c99a0e] text-white font-bold text-lg py-2 px-12 rounded shadow-md w-full md:w-auto"
            >
              Entrar como {{ loginType === 'student' ? 'Alumno' : 'Admin' }}
            </button>
          </div>

        </form>

        <div v-if="loginType === 'student'" class="mt-8 flex items-center justify-center gap-4 text-sm font-bold">
          <span>¿Eres nuevo ingreso?</span>
          <button @click="goToRegister" class="text-[#dc3545] underline hover:text-red-700">Regístrate aquí</button>
        </div>
        
        <!-- Mensaje distinto para admins -->
        <div v-else class="mt-8 text-center text-xs text-gray-400">
          Uso exclusivo para personal autorizado por la Dirección de Tecnologías.
        </div>
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