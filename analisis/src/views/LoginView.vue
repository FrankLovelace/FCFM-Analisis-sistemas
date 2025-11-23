<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/AuthStore';

const router = useRouter();
const authStore = useAuthStore();

const username = ref(''); 
const password = ref('');
const errorMsg = ref('');
const isLoading = ref(false);

const handleLogin = async () => {
  errorMsg.value = '';
  
  if(!username.value || !password.value) {
      errorMsg.value = 'Por favor ingresa usuario y contraseña';
      return;
  }

  isLoading.value = true;

  setTimeout(() => {
    const success = authStore.login(username.value, password.value);
    
    if (success) {
      router.push('/admin');
    } else {
      errorMsg.value = 'Credenciales inválidas.';
      isLoading.value = false;
    }
  }, 800);
};

const goHome = () => router.push('/');
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
    <div class="bg-white shadow-lg rounded-lg w-full max-w-md overflow-hidden">
      <div class="bg-uni-blue py-6 px-8 text-center">
        <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
          <span class="text-uni-blue font-bold text-2xl">U</span>
        </div>
        <h2 class="text-white text-xl font-bold tracking-wide">Acceso Administrativo</h2>
      </div>

      <div class="p-8">
        <form @submit.prevent="handleLogin" class="space-y-6">
          
          <!--Input Usuario -->
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
              Usuario
            </label>
            <input 
              v-model="username"
              id="username" 
              type="text" 
              placeholder="Ej. admin" 
              class="w-full px-4 py-3 rounded border border-gray-300 focus:outline-none focus:border-uni-blue focus:ring-1 focus:ring-uni-blue"
            >
          </div>

          <!-- Input Password -->
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
              Contraseña
            </label>
            <input 
              v-model="password"
              id="password" 
              type="password" 
              placeholder="••••••••" 
              class="w-full px-4 py-3 rounded border border-gray-300 focus:outline-none focus:border-uni-blue focus:ring-1 focus:ring-uni-blue"
            >
          </div>

          <div v-if="errorMsg" class="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
            {{ errorMsg }}
          </div>

          <button 
            type="submit" 
            :disabled="isLoading"
            class="w-full bg-uni-gold hover:bg-uni-gold-dark text-white font-bold py-3 px-4 rounded shadow transition-colors flex justify-center items-center"
          >
            <span v-if="!isLoading">Ingresar</span>
            <span v-else class="loader w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <a @click="goHome" class="text-sm text-uni-blue hover:underline cursor-pointer">
            ← Volver al inicio
          </a>
        </div>
      </div>
    </div>
  </div>
</template>