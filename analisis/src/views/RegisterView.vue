<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/AuthStore';

const router = useRouter();
const authStore = useAuthStore();

// Estados del flujo
const step = ref(1); // 1 = Datos, 2 = Código
const errorMsg = ref('');
const isLoading = ref(false);

// Datos del formulario
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const inputCode = ref('');

// Código generado (simulado)
const generatedCode = ref('');

// --- PASO 1: VALIDAR DATOS Y ENVIAR CÓDIGO ---
const handleContinue = () => {
  errorMsg.value = '';

  // 1. Validaciones básicas
  if (!email.value || !password.value || !confirmPassword.value) {
    errorMsg.value = 'Por favor completa todos los campos';
    return;
  }
  
  // 2. Validar correo UANL (Opcional, para demo aceptamos cualquiera)
  if (!email.value.includes('@')) {
     errorMsg.value = 'Ingresa un correo válido';
     return;
  }

  // 3. Validar coincidencia de contraseñas
  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'Las contraseñas no coinciden';
    return;
  }

  // 4. Validar si ya existe en la "BD"
  authStore.initAuth(); // Asegurar carga de usuarios
  if (authStore.emailExists(email.value)) {
    errorMsg.value = 'Error al Procesar la solicitud: Correo ya registrado';
    return;
  }

  // 5. Generar código y avanzar
  isLoading.value = true;
  
  setTimeout(() => {
    // Generar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    generatedCode.value = code;
    
    // IMPRIMIR EN CONSOLA (Como pediste)
    console.log('%c [SISTEMA DE CORREO SIMULADO] ', 'background: #222; color: #bada55');
    console.log(`Tu código de verificación para ${email.value} es: ${code}`);
    
    step.value = 2;
    isLoading.value = false;
  }, 1000);
};

// --- PASO 2: VALIDAR CÓDIGO Y REGISTRAR ---
const handleRegister = () => {
  errorMsg.value = '';

  if (inputCode.value !== generatedCode.value) {
    errorMsg.value = 'Error al Procesar la solicitud: Código incorrecto';
    return;
  }

  // Registrar en el Store
  const success = authStore.registerUser(email.value, password.value);

  if (success) {
    alert('Cuenta creada con éxito. Ahora puedes iniciar sesión.');
    router.push('/login');
  } else {
    errorMsg.value = 'Error desconocido al guardar usuario.';
  }
};

// Reenviar código
const resendCode = () => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  generatedCode.value = code;
  console.log(`Nuevo código enviado: ${code}`);
  alert(`Código reenviado a la consola.`);
};

const goToLogin = () => router.push('/login');
const goBack = () => { step.value = 1; errorMsg.value = ''; };
</script>

<template>
  <div class="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-[#002e5f]">
    
    <!-- Background pattern -->
    <div class="absolute inset-0 opacity-10 pointer-events-none">
       <div class="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)]" style="background-size: 60px 60px;"></div>
    </div>

    <!-- MAIN CARD -->
    <div class="bg-white w-full max-w-2xl rounded-[30px] shadow-2xl p-8 md:p-12 relative z-10 mx-4">
      
      <!-- HEADER -->
      <div class="flex flex-col items-center mb-6">
        <div class="w-full flex justify-between items-start">
           <div class="w-16"></div>
           <div class="text-center">
             <h1 class="text-3xl font-bold text-black">Registro de Nuevo Usuario</h1>
             <h2 class="text-xl font-bold text-[#e6b012] mt-1 tracking-widest">Crear cuenta</h2>
           </div>
           <div class="w-16 md:w-20">
                     <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Logo_de_la_UANL.svg/1080px-Logo_de_la_UANL.svg.png" alt="Logo" class="w-full h-auto object-contain">  </div>
        </div>
      </div>

      <!-- STEP 1: FORMULARIO -->
      <div v-if="step === 1" class="space-y-5 animate-fade-in">
        
        <div class="space-y-1">
          <label class="block font-bold text-sm" :class="errorMsg ? 'text-red-700' : 'text-gray-900'">Correo universitario y/o personal:</label>
          <input v-model="email" type="email" placeholder="example@uanl.edu.mx" class="w-full border border-gray-400 rounded p-2 text-gray-600 focus:border-red-500 focus:outline-none" :class="{'border-red-500': errorMsg && errorMsg.includes('Correo')}">
        </div>

        <div class="space-y-1">
          <label class="block text-black font-bold text-sm">Contraseña:</label>
          <div class="relative">
            <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="•••••••••••" class="w-full border border-gray-400 rounded p-2 text-gray-600 pr-10 focus:outline-none">
            <button type="button" @click="showPassword = !showPassword" class="absolute inset-y-0 right-0 pr-3 text-gray-400">
               <svg v-if="!showPassword" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
               <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
            </button>
          </div>
        </div>

        <div class="space-y-1">
          <label class="block text-black font-bold text-sm">Confirmar Contraseña:</label>
          <div class="relative">
             <input v-model="confirmPassword" :type="showPassword ? 'text' : 'password'" placeholder="•••••••••••" class="w-full border border-gray-400 rounded p-2 text-gray-600 focus:outline-none" :class="{'border-red-500': errorMsg && errorMsg.includes('contraseña')}">
             <button type="button" class="absolute inset-y-0 right-0 pr-3 text-gray-400">
               <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
             </button>
          </div>
        </div>

        <div class="flex justify-center pt-2">
          <button 
             @click="handleContinue" 
             :disabled="isLoading"
             class="bg-[#dc3545] hover:bg-red-700 text-white font-bold text-lg py-2 px-12 rounded shadow relative"
          >
             <span v-if="!isLoading">Continuar</span>
             <span v-else>Procesando...</span>
             <span class="absolute top-1 right-1 text-[10px]">⚡</span>
          </button>
        </div>

        <div class="mt-6 flex items-center justify-center gap-4 text-sm font-bold">
          <span class="text-black italic">¿Ya tienes una cuenta?</span>
          <button @click="goToLogin" class="bg-[#e6b012] hover:bg-yellow-600 text-white font-bold py-1 px-6 rounded shadow relative">
            Iniciar Sesión
            <span class="absolute top-0 right-1 text-[10px]">⚡</span>
          </button>
        </div>

      </div>

      <!-- STEP 2: CÓDIGO -->
      <div v-else class="space-y-6 text-center animate-fade-in">
        
        <p class="font-bold text-black text-sm">
          Te hemos enviado un código de 6 dígitos al correo:
          <br>
          <span class="text-gray-400 text-xs">{{ email }}</span>
        </p>

        <div class="space-y-2">
          <label class="block text-black font-bold text-left pl-10 md:pl-20">Ingresa el Código:</label>
          <div class="flex justify-center">
            <!-- Simulación visual de inputs separados con tracking-widest -->
            <input 
              v-model="inputCode"
              type="text" 
              maxlength="6"
              placeholder="* * * * * *"
              class="w-3/4 text-center text-3xl tracking-[0.5em] font-bold text-gray-500 border-b-2 border-gray-400 focus:border-red-500 focus:outline-none bg-transparent"
            >
          </div>
        </div>

        <div class="flex justify-center pt-4">
           <button 
             @click="handleRegister" 
             class="bg-[#dc3545] hover:bg-red-700 text-white font-bold text-lg py-2 px-12 rounded shadow relative"
           >
             Registrarme
             <span class="absolute top-1 right-1 text-[10px]">⚡</span>
           </button>
        </div>

        <div class="mt-4 flex items-center justify-center gap-4 text-sm font-bold">
          <span class="text-black italic">¿No recibiste el correo?</span>
          <button @click="resendCode" class="bg-[#e6b012] hover:bg-yellow-600 text-white font-bold py-1 px-6 rounded shadow">
            Reenviar Código
          </button>
        </div>

        <div class="flex justify-start mt-4">
           <button @click="goBack" class="bg-[#002e5f] text-white text-xs px-3 py-1 rounded shadow flex items-center gap-1">
             <span class="font-bold">←</span> Regresar
             <span class="text-[#e6b012] text-[10px]">⚡</span>
           </button>
        </div>

      </div>

    </div>

    <!-- ERROR BAR -->
    <div v-if="errorMsg" class="absolute bottom-8 w-[90%] md:w-auto animate-bounce">
      <div class="bg-[#ff6b6b] text-white font-bold py-3 px-8 rounded-full shadow-lg text-center border-2 border-red-400">
        {{ errorMsg }}
      </div>
    </div>

  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>