<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/AuthStore';
import { useEventStore } from '../stores/eventStore';

const router = useRouter();
const authStore = useAuthStore();
const eventStore = useEventStore();

onMounted(() => {
    // Aseguramos que la sesión y los eventos estén cargados
    authStore.initAuth();
    eventStore.loadEvents();
});

// Lógica de Filtrado:
// Comparamos todos los eventos vs los IDs que tiene el usuario en su array
const myEvents = computed(() => {
    // Si no hay usuario o no tiene eventos, retornamos array vacío
    const userEventIds = (authStore.currentUser as any)?.registeredEventIds || [];
    
    return eventStore.events.filter(event => userEventIds.includes(event.id));
});

const goToDetail = (id: string) => router.push(`/event/${id}`);
const goHome = () => router.push('/');
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans pb-12">
    
    <!-- Header Simple -->
    <div class="bg-[#004a8f] text-white py-6 shadow-md">
        <div class="container mx-auto px-4 flex justify-between items-center">
            <h1 class="text-2xl font-bold flex items-center gap-2">
                <span class="text-[#fbb034]">📅</span> Mis Eventos Inscritos
            </h1>
            <button @click="goHome" class="text-sm hover:underline text-blue-200">← Volver al inicio</button>
        </div>
    </div>

    <div class="container mx-auto px-4 py-8">
        
        <!-- ESTADO VACÍO (Si no se ha inscrito a nada) -->
        <div v-if="myEvents.length === 0" class="text-center py-20 bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="text-6xl mb-4">🎫</div>
            <h2 class="text-xl font-bold text-gray-700">Aún no tienes eventos registrados</h2>
            <p class="text-gray-500 mb-6 mt-2">Explora la cartelera y regístrate en las actividades de tu interés.</p>
            <button @click="goHome" class="bg-[#004a8f] text-white py-2 px-6 rounded font-bold hover:bg-blue-900 transition shadow">
                Ir a la Cartelera
            </button>
        </div>

        <!-- GRID DE EVENTOS -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="event in myEvents" :key="event.id" class="bg-white rounded-lg shadow overflow-hidden border border-gray-100 flex flex-col relative group hover:shadow-lg transition-shadow">
                
                <!-- Etiqueta de Inscrito -->
                <div class="absolute top-2 right-2 bg-green-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow z-10">
                    INSCRITO ✅
                </div>

                <!-- Imagen -->
                <div class="h-40 bg-gray-200 overflow-hidden cursor-pointer" @click="goToDetail(event.id)">
                    <img :src="event.image" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Evento">
                </div>
                
                <!-- Info -->
                <div class="p-5 flex-1 flex flex-col">
                    <h3 class="font-bold text-gray-800 mb-2 leading-tight">{{ event.title }}</h3>
                    <p class="text-xs text-gray-500 mb-4">{{ event.displayDate }} • {{ event.faculty }}</p>
                    
                    <div class="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
                         <span class="text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded font-semibold">{{ event.modality }}</span>
                         <button @click="goToDetail(event.id)" class="text-[#004a8f] text-sm font-bold hover:underline">
                             Ver Detalles
                         </button>
                    </div>
                </div>
            </div>
        </div>

    </div>
  </div>
</template>