<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEventStore } from '../stores/eventStore';
import { useAuthStore } from '../stores/AuthStore';

const route = useRoute();
const router = useRouter();
const eventStore = useEventStore();
const authStore = useAuthStore();

const eventId = route.params.id as string;
const event = computed(() => eventStore.events.find(e => e.id === eventId));

// Datos del Formulario
const formData = ref({
  name: '',
  matricula: '',
  career: '',
  email: ''
});

// Autocompletar datos si el usuario está logueado
onMounted(() => {
  if (authStore.currentUser) {
    formData.value.email = authStore.currentUser.email;
    formData.value.name = authStore.currentUser.name || '';
  }
});

// Lógica de Precios
const priceDetails = computed(() => {
  if (!event.value) return { price: 0, commission: 0, total: 0 };

  // Extraer valor numérico del string (ej: "$100 MXN" -> 100)
  // Si es "Gratis", retorna 0
  const numericPrice = parseFloat(event.value.price.replace(/[^0-9.]/g, '')) || 0;
  
  const commission = numericPrice > 0 ? numericPrice * 0.10 : 0; // 10% comisión
  const total = numericPrice + commission;

  return {
    price: numericPrice.toFixed(2),
    commission: commission.toFixed(2),
    total: total.toFixed(2)
  };
});

const goBack = () => router.back();

const handlePayment = () => {
  if(!formData.value.name || !formData.value.matricula || !formData.value.email) {
      alert("Por favor completa todos los campos requeridos.");
      return;
  }
  
  // Aquí iría la integración con pasarela de pago real
  alert("¡Pago procesado y registro completado!");
  router.push('/'); // Volver al inicio
};
</script>

<template>
  <div class="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-[#002e5f] py-10">
    
    <!-- Fondo Geométrico -->
    <div class="absolute inset-0 opacity-10 pointer-events-none">
       <div class="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)]" style="background-size: 60px 60px;"></div>
    </div>

    <!-- TARJETA PRINCIPAL -->
    <div class="bg-white w-full max-w-5xl rounded-[30px] shadow-2xl p-8 md:p-12 relative z-10 mx-4">
      
      <!-- CABECERA -->
      <div class="flex justify-between items-start mb-8">
        <div class="flex-1 text-center md:text-left md:pl-8 pt-4">
          <h1 class="text-2xl md:text-3xl font-bold text-black leading-tight">
            Confirmación de Registro e<br>información de Pago
          </h1>
        </div>
        <div class="w-16 md:w-24">
             <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Uanl_logo.png" alt="UANL" class="w-full h-auto">
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12" v-if="event">
        
        <!-- COLUMNA IZQUIERDA: FORMULARIO -->
        <div class="space-y-5">
          
          <div class="space-y-1">
            <label class="block text-black font-bold text-sm">Nombre Completo:</label>
            <input v-model="formData.name" type="text" placeholder="Nombre Completo" class="w-full border border-gray-400 rounded p-2.5 text-gray-600 focus:outline-none focus:border-blue-800">
          </div>

          <div class="space-y-1">
            <label class="block text-black font-bold text-sm">Número de matrícula (si aplica):</label>
            <input v-model="formData.matricula" type="text" placeholder="Ej. 1283192" class="w-full border border-gray-400 rounded p-2.5 text-gray-600 focus:outline-none focus:border-blue-800">
          </div>

          <div class="space-y-1">
            <label class="block text-black font-bold text-sm">Carrera o dependencia (si aplica):</label>
            <input v-model="formData.career" type="text" placeholder="Ej. Medicina" class="w-full border border-gray-400 rounded p-2.5 text-gray-600 focus:outline-none focus:border-blue-800">
          </div>

          <div class="space-y-1">
            <label class="block text-black font-bold text-sm">Correo electrónico ligado a teams:</label>
            <input v-model="formData.email" type="email" placeholder="example@uanl.edu.mx" class="w-full border border-gray-400 rounded p-2.5 text-gray-600 focus:outline-none focus:border-blue-800">
          </div>

          <!-- Botones Acción -->
          <div class="flex justify-between pt-8 gap-4">
             <button @click="goBack" class="bg-[#dc3545] hover:bg-red-700 text-white font-bold py-2 px-8 rounded shadow flex items-center gap-2">
               Regresar
               <span class="text-[10px] bg-green-500 text-white px-1 rounded">⚡</span>
             </button>

             <button @click="handlePayment" class="bg-[#fff200] hover:bg-yellow-400 text-black font-bold py-2 px-12 rounded shadow border border-yellow-500 flex items-center gap-2">
               Continuar
               <span class="text-[10px] bg-green-500 text-white px-1 rounded">⚡</span>
             </button>
          </div>

        </div>

        <!-- COLUMNA DERECHA: RESUMEN -->
        <div>
          <h3 class="font-bold text-lg text-black mb-2 text-center md:text-left">Resumen del Evento</h3>
          
          <div class="border border-black p-6 rounded-sm bg-white h-full flex flex-col">
            
            <!-- Imagen Evento -->
            <div class="bg-gray-400 w-32 h-32 mx-auto mb-6 flex items-center justify-center rounded">
               <img v-if="event.image" :src="event.image" class="w-full h-full object-cover rounded" alt="Evento">
               <span v-else class="text-white text-4xl">📷</span>
            </div>

            <div class="flex-1">
              <h4 class="font-bold text-gray-800 mb-2">{{ event.title }}</h4>
              
              <p class="text-gray-500 text-sm mb-4">
                {{ event.displayDate }}
                <br>
                Facultad de {{ event.faculty }}
              </p>

              <hr class="border-gray-300 my-4">

              <!-- Tabla de Totales -->
              <div class="space-y-2 text-sm font-bold text-black">
                <div class="flex justify-between">
                  <span>Precio:</span>
                  <span>${{ priceDetails.price }} MXN</span>
                </div>
                <div class="flex justify-between">
                  <span>Comisión:</span>
                  <span>${{ priceDetails.commission }} MXN</span>
                </div>
                <div class="flex justify-between text-base mt-2 pt-2 border-t border-gray-200">
                  <span>Total:</span>
                  <span>${{ priceDetails.total }} MXN</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      <!-- Estado de carga o error si no hay ID -->
      <div v-else class="text-center py-20 text-gray-500">
        Cargando información del evento...
      </div>

    </div>
  </div>
</template>