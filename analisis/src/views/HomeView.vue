<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useEventStore } from '../stores/eventStore';
import LoadingScreen from '../components/loadingScreen.vue';

const router = useRouter();
const eventStore = useEventStore();

const isLoading = ref(true);
const searchQuery = ref('');

// Simulación de carga inicial
onMounted(() => {
  eventStore.loadEvents();
  setTimeout(() => {
    isLoading.value = false;
  }, 1500);
});

// Lógica para separar eventos Próximos vs Finalizados
// (Simulamos que "hoy" es 1 de Octubre de 2025 para que se vean datos)
const currentDate = '2025-10-01';

const upcomingEvents = computed(() => {
  return eventStore.events.filter(e => e.date >= currentDate && 
    e.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const pastEvents = computed(() => {
  return eventStore.events.filter(e => e.date < currentDate);
});

const goToLogin = () => router.push('/login');
</script>

<template>
  <!-- Loading Overlay -->
  <LoadingScreen v-if="isLoading" />

  <div v-else class="min-h-screen bg-gray-100 font-sans text-slate-800">
    
    <!-- HEADER -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="container mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-8">
          <!-- Logo Simulado -->
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-uni-blue rounded-full flex items-center justify-center text-white text-xs font-bold">U</div>
            <span class="font-bold text-uni-blue text-lg tracking-tight">UANL</span>
          </div>
          
          <!-- Nav Links -->
          <nav class="hidden md:flex gap-6 text-sm font-semibold text-gray-600">
            <a href="#" class="text-uni-blue border-b-2 border-uni-blue pb-5 mt-5">Eventos</a>
            <a href="#" class="hover:text-uni-blue transition-colors pb-5 mt-5">Mis Eventos</a>
          </nav>
        </div>

        <button 
          @click="goToLogin"
          class="bg-uni-gold hover:bg-uni-gold-dark text-white font-bold py-1.5 px-6 rounded shadow-sm transition-colors text-sm"
        >
          Iniciar Sesión
        </button>
      </div>
    </header>

    <!-- MAIN CONTENT -->
    <main class="container mx-auto px-4 py-8">
      
      <!-- SEARCH & FILTERS SECTION -->
      <div class="bg-white p-4 rounded shadow-sm mb-8">
        <!-- Buscador -->
        <div class="flex gap-2 mb-4">
          <div class="relative flex-1">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </span>
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Buscar Evento" 
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-uni-blue"
            >
          </div>
          <button class="p-2 border border-gray-300 rounded hover:bg-gray-50">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-gray-600">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
            </svg>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <select class="border border-gray-300 rounded p-2 text-sm text-gray-600 w-full"><option>Académica</option></select>
          <select class="border border-gray-300 rounded p-2 text-sm text-gray-600 w-full"><option>FIME</option></select>
          <select class="border border-gray-300 rounded p-2 text-sm text-gray-600 w-full"><option>Precio</option></select>
          <div class="hidden md:block"></div> 
          
          <select class="border border-gray-300 rounded p-2 text-sm text-gray-600 w-full"><option>Fecha</option></select>
          <select class="border border-gray-300 rounded p-2 text-sm text-gray-600 w-full"><option>Tipo</option></select>
          
          <button class="bg-uni-blue text-white text-sm font-bold py-2 px-4 rounded flex items-center justify-center gap-2 col-span-1 md:col-start-4 md:row-start-2">
            Aplicar filtros
            <span class="text-xs bg-green-500 rounded-full p-0.5">⚡</span>
          </button>
        </div>
      </div>

      <!-- GRID LAYOUT: PRÓXIMOS vs FINALIZADOS -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Columna Izquierda: Próximos (2/3 ancho) -->
        <div class="lg:col-span-2">
          <h2 class="text-xl font-bold mb-4 text-gray-800">Próximos eventos</h2>
          <div class="space-y-4">
            
            <!-- Event Card Component (Inline for simplicity here) -->
            <div v-for="event in upcomingEvents" :key="event.id" class="bg-white border border-gray-200 rounded shadow-sm flex flex-col md:flex-row overflow-hidden group hover:shadow-md transition-shadow">
              <!-- Imagen -->
              <div class="w-full md:w-48 h-32 md:h-auto bg-gray-200 flex-shrink-0 overflow-hidden relative">
                 <img :src="event.image" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="Event">
                 <div class="absolute inset-0 bg-black/10"></div>
              </div>
              
              <!-- Info -->
              <div class="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 class="font-bold text-gray-800 text-lg leading-tight mb-1">{{ event.title }}</h3>
                  <p class="text-sm text-gray-500 mb-2">
                    {{ event.category }} • {{ event.displayDate }} • {{ event.faculty }} • {{ event.modality }}
                  </p>
                </div>
                <div class="flex items-center justify-between mt-2">
                  <span class="text-gray-700 font-semibold text-sm">{{ event.price }}</span>
                  <button class="bg-uni-blue hover:bg-blue-900 text-white text-xs font-bold py-1.5 px-4 rounded">
                    Ver Detalles
                  </button>
                </div>
              </div>
            </div>

            <div v-if="upcomingEvents.length === 0" class="p-8 text-center text-gray-500 bg-white rounded">
              No hay eventos próximos con ese criterio.
            </div>

          </div>
        </div>

        <div class="lg:col-span-1">
          <h2 class="text-xl font-bold mb-4 text-gray-800">Eventos Finalizados</h2>
          <div class="space-y-4">
    
            <div v-for="event in pastEvents" :key="event.id" class="bg-white border border-gray-200 rounded shadow-sm p-3 flex gap-3">
               <div class="w-20 h-20 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                 <img :src="event.image" class="w-full h-full object-cover grayscale opacity-80" alt="Event">
               </div>
               <div class="flex-1 flex flex-col justify-between">
                 <h4 class="font-bold text-gray-700 text-sm leading-tight line-clamp-2">{{ event.title }}</h4>
                 <div class="flex justify-between items-end mt-1">
                   <span class="text-xs text-gray-500">{{ event.displayDate }}</span>
                   <button class="bg-uni-blue text-white text-[10px] font-bold py-1 px-2 rounded">
                     Ver Detalles
                   </button>
                 </div>
               </div>
            </div>

          </div>
        </div>

      </div>
    </main>

  </div>
</template>