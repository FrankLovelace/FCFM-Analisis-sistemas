<!-- src/views/PaymentConfirmationView.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEventStore } from '../stores/eventStore';
import { useAuthStore } from '../stores/AuthStore';

const route = useRoute();
const router = useRouter();
const eventStore = useEventStore();
const authStore = useAuthStore();

const eventId = route.params.id as string;
const event = computed(() => eventStore.events.find(e => e.id === eventId));

// Datos del Usuario
const userData = reactive({
  name: '', matricula: '', career: '', email: ''
});

// Datos de Tarjeta
const cardData = reactive({
  cardName: '', cardNumber: '', expiry: '', cvv: ''
});

// Estados del Proceso
const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle');
const statusMessage = ref('');
const statusColor = ref(''); // 'blue', 'green', 'red'

onMounted(() => {
  if (authStore.currentUser) {
    userData.email = authStore.currentUser.email;
    userData.name = authStore.currentUser.name || '';
  }
});

// Detectar si es Gratuito
const isFree = computed(() => {
    if (!event.value) return true;
    return event.value.price.toLowerCase().includes('gratis') || event.value.price === '0';
});

const goBack = () => router.back();

const handleProcess = () => {
  // 1. Validaciones Generales
  if(!userData.name || !userData.matricula || !userData.email) {
      alert("Por favor completa los datos del asistente.");
      return;
  }

  // 2. Validación Tarjeta (Solo si es de pago)
  if (!isFree.value) {
      if(!cardData.cardName || !cardData.cardNumber || !cardData.expiry || !cardData.cvv) {
          alert("Faltan datos de la tarjeta.");
          return;
      }
  }

  // 3. Iniciar Proceso (Simulación)
  status.value = 'loading';
  statusMessage.value = isFree.value ? "Procesando..." : "Cargando...";
  statusColor.value = 'blue'; // Azul o gris según requerimiento

  setTimeout(() => {
      // Simular 10% de fallo en pago
      const randomFail = !isFree.value && Math.random() < 0.1; 

      if (randomFail) {
          status.value = 'error';
          statusMessage.value = "Ocurrió un problema al procesar el pago: Fondos insuficientes";
          statusColor.value = 'red';
          
          // Duración del mensaje de error (2 seg)
          setTimeout(() => { status.value = 'idle'; }, 2000);
      } else {
          // ÉXITO
          status.value = 'success';
          if (isFree.value) {
              statusMessage.value = "Operación exitosa: Boleto generado correctamente";
          } else {
              statusMessage.value = "Pago realizado correctamente"; // Primer mensaje pago
              
              // Secuencia requerida para pago: Pago Ok -> Operación Exitosa
              setTimeout(() => {
                  statusMessage.value = "Operación exitosa: Boleto generado correctamente";
              }, 1500);
          }
          statusColor.value = 'green';

          // Guardar registro y redirigir después de 2 segs
          authStore.registerUserEvent(eventId);
          setTimeout(() => {
              router.push('/my-events');
          }, 2000);
      }
  }, 2000); // Simular 2 segs de carga
};
</script>

<template>
  <div class="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-[#002e5f] py-10">
    
    <div class="absolute inset-0 opacity-10 pointer-events-none">
       <div class="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)]" style="background-size: 60px 60px;"></div>
    </div>

    <div class="bg-white w-full max-w-4xl rounded-[30px] shadow-2xl p-8 relative z-10 mx-4">
      
      <!-- Header -->
      <div class="flex justify-between items-center mb-6 border-b pb-4">
        <h1 class="text-2xl font-bold text-black">
            {{ isFree ? 'Registro al Evento' : 'Información de Pago' }}
        </h1>
        <div class="w-16">
             <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Uanl_logo.png" alt="UANL" class="w-full h-auto">
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-10" v-if="event">
        
        <!-- COLUMNA IZQUIERDA: Formularios -->
        <div class="space-y-6">
          
          <!-- Datos del Asistente -->
          <div class="bg-gray-50 p-4 rounded border border-gray-200">
              <h3 class="font-bold text-gray-700 mb-3 text-sm uppercase">Datos del Asistente</h3>
              <div class="space-y-3">
                <input v-model="userData.name" type="text" placeholder="Nombre Completo" class="w-full border rounded p-2 text-sm">
                <input v-model="userData.matricula" type="text" placeholder="Matrícula" class="w-full border rounded p-2 text-sm">
                <input v-model="userData.email" type="email" placeholder="Correo (Teams)" class="w-full border rounded p-2 text-sm">
              </div>
          </div>

          <!-- Datos de Tarjeta (SOLO SI ES DE PAGO) -->
          <div v-if="!isFree" class="bg-blue-50 p-4 rounded border border-blue-200 animate-fade-in">
              <h3 class="font-bold text-blue-800 mb-3 text-sm uppercase flex items-center gap-2">
                  💳 Tarjeta de Crédito/Débito
              </h3>
              <div class="space-y-3">
                <input v-model="cardData.cardName" type="text" placeholder="Nombre en la tarjeta" class="w-full border rounded p-2 text-sm">
                <input v-model="cardData.cardNumber" type="text" placeholder="Número de tarjeta" maxlength="19" class="w-full border rounded p-2 text-sm">
                <div class="flex gap-3">
                    <input v-model="cardData.expiry" type="text" placeholder="MM/AA" maxlength="5" class="w-1/2 border rounded p-2 text-sm">
                    <input v-model="cardData.cvv" type="password" placeholder="CVV" maxlength="4" class="w-1/2 border rounded p-2 text-sm">
                </div>
              </div>
          </div>

        </div>

        <!-- COLUMNA DERECHA: Resumen -->
        <div class="flex flex-col">
            <div class="border border-gray-300 p-6 rounded bg-white flex-1">
                <h4 class="font-bold text-gray-800 mb-4 text-lg">{{ event.title }}</h4>
                <p class="text-sm text-gray-600 mb-2">📅 {{ event.displayDate }}</p>
                <p class="text-sm text-gray-600 mb-4">📍 {{ event.location }}</p>
                
                <hr class="my-4">
                
                <div class="flex justify-between items-center text-xl font-bold">
                    <span>Total:</span>
                    <span :class="isFree ? 'text-green-600' : 'text-blue-800'">{{ event.price }}</span>
                </div>
            </div>

            <!-- BOTONES Y MENSAJES DE ESTADO -->
            <div class="mt-6 space-y-4">
                
                <!-- Botones (Solo visibles si no está procesando ni terminó) -->
                <div v-if="status === 'idle'" class="flex justify-between gap-4">
                    <button @click="goBack" class="w-1/3 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 rounded shadow">
                        Cancelar
                    </button>
                    <button @click="handleProcess" class="flex-1 bg-[#fff200] hover:bg-yellow-400 text-black font-bold py-2 rounded shadow border border-yellow-500">
                        {{ isFree ? 'Confirmar Registro' : 'Pagar y Registrar' }}
                    </button>
                </div>

                <!-- MENSAJES DE ESTADO (Requerimiento específico de colores y textos) -->
                <div v-else class="p-4 rounded text-center font-bold text-white shadow-lg transition-all duration-300 transform scale-105"
                     :class="{
                        'bg-blue-600': statusColor === 'blue',
                        'bg-green-600': statusColor === 'green',
                        'bg-red-600': statusColor === 'red'
                     }">
                    
                    <!-- Spinner solo si está cargando -->
                    <div v-if="status === 'loading'" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    
                    {{ statusMessage }}
                </div>

            </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.5s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>