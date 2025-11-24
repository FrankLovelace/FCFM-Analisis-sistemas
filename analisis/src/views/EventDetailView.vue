<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEventStore } from '../stores/eventStore';
import { useAuthStore } from '../stores/AuthStore';

const route = useRoute();
const router = useRouter();
const eventStore = useEventStore();
const authStore = useAuthStore();

// Obtenemos el ID de la URL
const eventId = route.params.id as string;

// Buscamos el evento específico en el Store
const event = computed(() => eventStore.events.find(e => e.id === eventId));

// Acciones
const closeView = () => {
  router.push('/'); // Vuelve al inicio
};

const handleRegister = () => {
  if (authStore.isAuthenticated) {
    // CAMBIO: Ahora redirigimos al pago con el ID del evento
    router.push(`/payment/${event.value?.id}`);
  } else {
    // Si no está logueado, lo mandamos al login
    if(confirm("Para registrarte necesitas iniciar sesión. ¿Ir al Login?")) {
        router.push('/login');
    }
  }
};

// Generamos datos "falsos" para los campos que no tenemos en la BD básica
// para que se vea lleno como en tu diseño (Hora, Dependencias extra, etc)
const eventDetails = computed(() => {
    if(!event.value) return null;
    return {
        ...event.value,
        time: '16:00 - 20:00 los días establecidos', // Simulado
        longLocation: event.value.location + ' y Teams', // Simulado
    }
});
</script>

<template>
  <div class="min-h-screen bg-white font-sans text-gray-800 pb-12">
    
    <!-- Si no se encuentra el evento (por si ponen un ID raro en la URL) -->
    <div v-if="!event" class="flex flex-col items-center justify-center h-screen">
      <h2 class="text-2xl font-bold text-gray-400">Evento no encontrado</h2>
      <button @click="closeView" class="mt-4 text-uni-blue underline">Volver al inicio</button>
    </div>

    <!-- Contenido del Evento -->
    <div v-else class="container mx-auto px-4 py-6 max-w-5xl">
      
      <!-- CABECERA: Título y Botón Cerrar -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 class="text-2xl md:text-3xl font-bold text-uni-blue leading-tight flex-1">
          {{ event.title }}
        </h1>
        <button 
          @click="closeView"
          class="bg-[#dc3545] hover:bg-red-700 text-white font-bold py-1.5 px-6 rounded shadow text-sm uppercase tracking-wide transition-colors flex-shrink-0"
        >
          Cerrar vista
        </button>
      </div>

      <!-- HERO IMAGE -->
      <div class="w-full h-64 md:h-96 bg-gray-200 mb-8 rounded-sm overflow-hidden">
        <img :src="event.image" class="w-full h-full object-cover" alt="Hero Evento">
      </div>

      <!-- DESCRIPCIÓN PRINCIPAL -->
      <div class="mb-10">
        <h2 class="text-xl font-bold mb-3 text-gray-800">Descripción del evento</h2>
        <p class="text-justify text-gray-700 leading-relaxed">
          {{ event.description }}
        </p>
      </div>

      <!-- GRID: TABLA y OTROS DETALLES -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
        
        <!-- COLUMNA IZQUIERDA: Tabla de Detalles -->
        <div>
          <div class="border border-gray-300 rounded-sm overflow-hidden">
            <!-- Header de la tabla -->
            <div class="bg-gray-200 p-3 font-bold text-gray-700 border-b border-gray-300">
              Detalles del Evento
            </div>
            
            <table class="w-full text-sm">
              <tbody class="divide-y divide-gray-300">
                <!-- Fecha -->
                <tr>
                  <td class="p-3 font-semibold text-gray-700 w-1/3 align-top">Fecha</td>
                  <td class="p-3 text-gray-800">{{ eventDetails?.displayDate }}</td>
                </tr>
                <!-- Hora (Simulada) -->
                <tr>
                  <td class="p-3 font-semibold text-gray-700 align-top">Hora</td>
                  <td class="p-3 text-gray-800">{{ eventDetails?.time }}</td>
                </tr>
                <!-- Modalidad -->
                <tr>
                  <td class="p-3 font-semibold text-gray-700 align-top">Modalidad</td>
                  <td class="p-3 text-gray-800">{{ event.modality }}</td>
                </tr>
                <!-- Lugar -->
                <tr>
                  <td class="p-3 font-semibold text-gray-700 align-top">Lugar</td>
                  <td class="p-3 text-gray-800">{{ eventDetails?.longLocation }}</td>
                </tr>
                <!-- Dependencias -->
                <tr>
                  <td class="p-3 font-semibold text-gray-700 align-top">Dependencias</td>
                  <td class="p-3 text-gray-800">{{ event.faculty }}</td>
                </tr>
                <!-- Precio -->
                <tr>
                  <td class="p-3 font-semibold text-gray-700 align-top">Precio</td>
                  <td class="p-3 text-gray-800">{{ event.price }} por persona</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- COLUMNA DERECHA: Otros detalles + Imagen pequeña -->
        <div class="flex flex-col h-full">
          <h3 class="text-xl font-bold mb-3 text-gray-800">Otros detalles del evento</h3>
          <p class="text-justify text-gray-700 text-sm mb-6 leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            <br><br>
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
          
          <!-- Imagen Secundaria -->
          <div class="bg-gray-200 h-40 w-full rounded-sm mt-auto overflow-hidden">
             <img :src="event.image" class="w-full h-full object-cover opacity-80" alt="Detalle Extra">
          </div>
        </div>

      </div>

      <!-- FOOTER: Botón Registrarse -->
      <div class="flex justify-center mt-8">
        <button 
          @click="handleRegister"
          class="bg-uni-blue hover:bg-blue-900 text-white font-bold py-3 px-12 rounded shadow-md text-sm md:text-base transition-transform transform hover:scale-105"
        >
          Registrarse al evento
        </button>
      </div>

    </div>
  </div>
</template>