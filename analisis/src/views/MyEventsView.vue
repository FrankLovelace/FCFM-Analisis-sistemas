<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/AuthStore';
import { useEventStore } from '../stores/eventStore';
import type { UniversityEvent } from '../data/initialEvents';

const router = useRouter();
const authStore = useAuthStore();
const eventStore = useEventStore();

// Estados para los Modales
const showTicketModal = ref(false);
const showReviewModal = ref(false);
const selectedEvent = ref<UniversityEvent | null>(null);

// Estado para la reseña
const reviewForm = reactive({
  rating: 10,
  comment: ''
});

// Para simular que ya se dejó reseña en la sesión actual
const reviewedEventIds = ref<string[]>([]);

onMounted(() => {
    authStore.initAuth();
    eventStore.loadEvents();
});

// Filtrar eventos inscritos
const myEvents = computed(() => {
    const userEventIds = (authStore.currentUser as any)?.registeredEventIds || [];
    return eventStore.events.filter(event => userEventIds.includes(event.id));
});

const goHome = () => router.push('/');

// --- LÓGICA DE BOLETO ---
const openTicket = (event: UniversityEvent) => {
  selectedEvent.value = event;
  showTicketModal.value = true;
};

// --- LÓGICA DE RESEÑA ---
const openReview = (event: UniversityEvent) => {
  selectedEvent.value = event;
  reviewForm.rating = 10;
  reviewForm.comment = '';
  showReviewModal.value = true;
};

const submitReview = () => {
  if (!selectedEvent.value) return;
  
  // Aquí iría la lógica para guardar en backend
  alert(`¡Reseña guardada!\nCalificación: ${reviewForm.rating}/10\nComentario: ${reviewForm.comment}`);
  
  // Marcar como reseñado visualmente
  reviewedEventIds.value.push(selectedEvent.value.id);
  
  showReviewModal.value = false;
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans pb-12">
    
    <!-- Header -->
    <div class="bg-[#004a8f] text-white py-6 shadow-md">
        <div class="container mx-auto px-4 flex justify-between items-center">
            <h1 class="text-2xl font-bold flex items-center gap-2">
                <span class="text-[#fbb034]">🎫</span> Mis Eventos
            </h1>
            <button @click="goHome" class="text-sm hover:underline text-blue-200">← Volver al inicio</button>
        </div>
    </div>

    <div class="container mx-auto px-4 py-8">
        
        <!-- Estado Vacío -->
        <div v-if="myEvents.length === 0" class="text-center py-20 bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="text-6xl mb-4">📅</div>
            <h2 class="text-xl font-bold text-gray-700">No tienes eventos próximos</h2>
            <p class="text-gray-500 mb-6 mt-2">Explora la cartelera para inscribirte.</p>
            <button @click="goHome" class="bg-[#004a8f] text-white py-2 px-6 rounded font-bold hover:bg-blue-900 transition shadow">
                Ir a la Cartelera
            </button>
        </div>

        <!-- Grid de Eventos -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="event in myEvents" :key="event.id" class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 flex flex-col group hover:shadow-lg transition-shadow">
                
                <!-- Imagen -->
                <div class="h-48 bg-gray-200 overflow-hidden relative">
                    <img :src="event.image" class="w-full h-full object-cover" alt="Evento">
                    <div class="absolute top-2 right-2 bg-green-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow z-10">
                        INSCRITO ✅
                    </div>
                </div>
                
                <!-- Detalles (Similar al Home) -->
                <div class="p-5 flex-1 flex flex-col">
                    <div class="flex justify-between items-start mb-2">
                         <span class="text-[10px] font-bold tracking-wider text-[#db2777] uppercase bg-pink-50 px-2 py-0.5 rounded">
                            {{ event.category }}
                         </span>
                         <span class="text-xs text-gray-500">{{ event.displayDate }}</span>
                    </div>

                    <h3 class="font-bold text-gray-800 text-lg mb-2 leading-tight">{{ event.title }}</h3>
                    
                    <p class="text-sm text-gray-600 mb-4 line-clamp-2">
                        {{ event.description }}
                    </p>
                    
                    <div class="mt-auto space-y-3">
                         <div class="flex items-center gap-2 text-xs text-gray-500">
                            <span>📍 {{ event.faculty }}</span>
                            <span>•</span>
                            <span>{{ event.modality }}</span>
                         </div>

                         <!-- BOTONES DE ACCIÓN (Requerimiento) -->
                         <div class="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                             <button 
                                @click="openTicket(event)"
                                class="bg-[#004a8f] text-white text-sm font-bold py-2 rounded hover:bg-blue-900 transition flex justify-center items-center gap-2"
                             >
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                                Ver Boleto
                             </button>

                             <button 
                                v-if="!reviewedEventIds.includes(event.id)"
                                @click="openReview(event)"
                                class="border border-[#fbb034] text-yellow-700 text-sm font-bold py-2 rounded hover:bg-yellow-50 transition flex justify-center items-center gap-2"
                             >
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                                Reseñar
                             </button>
                             <div v-else class="text-xs text-center text-green-600 font-bold flex items-center justify-center border border-transparent">
                                ¡Reseña enviada!
                             </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>

    </div>

    <!-- MODAL 1: VER BOLETO -->
    <div v-if="showTicketModal && selectedEvent" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div class="bg-white w-full max-w-md rounded-lg shadow-2xl overflow-hidden relative">
            <!-- Header Ticket -->
            <div class="bg-[#004a8f] p-4 text-center">
                <h3 class="text-white font-bold text-lg">Boleto Digital</h3>
                <p class="text-blue-200 text-xs uppercase tracking-widest">Acceso Personal</p>
            </div>
            
            <button @click="showTicketModal = false" class="absolute top-2 right-2 text-white hover:text-gray-200 text-2xl font-bold">&times;</button>

            <div class="p-6">
                <!-- QR Genérico -->
                <div class="flex justify-center mb-6">
                    <div class="bg-white p-2 border-2 border-gray-200 rounded">
                        <img src="https://placehold.co/150x150?text=QR+Code" alt="QR" class="w-40 h-40">
                    </div>
                </div>

                <!-- Detalles (Tabla similar a Detalles) -->
                <table class="w-full text-sm border-collapse">
                    <tbody>
                        <tr class="border-b">
                            <td class="py-2 text-gray-500 font-bold">Evento:</td>
                            <td class="py-2 text-right text-gray-800 font-semibold">{{ selectedEvent.title }}</td>
                        </tr>
                        <tr class="border-b">
                            <td class="py-2 text-gray-500 font-bold">Fecha:</td>
                            <td class="py-2 text-right text-gray-800">{{ selectedEvent.displayDate }}</td>
                        </tr>
                        <tr class="border-b">
                            <td class="py-2 text-gray-500 font-bold">Lugar:</td>
                            <td class="py-2 text-right text-gray-800">{{ selectedEvent.location }}</td>
                        </tr>
                        <tr class="border-b">
                            <td class="py-2 text-gray-500 font-bold">Dependencia:</td>
                            <td class="py-2 text-right text-gray-800">{{ selectedEvent.faculty }}</td>
                        </tr>
                        <tr>
                            <td class="py-2 text-gray-500 font-bold">Asistente:</td>
                            <td class="py-2 text-right text-gray-800">{{ authStore.currentUser?.name }}</td>
                        </tr>
                    </tbody>
                </table>

                <div class="mt-6 text-center">
                    <button @click="showTicketModal = false" class="text-[#004a8f] font-bold text-sm hover:underline">Cerrar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- MODAL 2: DEJAR RESEÑA -->
    <div v-if="showReviewModal && selectedEvent" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div class="bg-white w-full max-w-lg rounded-lg shadow-2xl overflow-hidden">
            <div class="bg-[#fbb034] p-4 flex justify-between items-center">
                <h3 class="text-yellow-900 font-bold text-lg">Calificar Evento</h3>
                <button @click="showReviewModal = false" class="text-yellow-900 text-2xl font-bold hover:opacity-75">&times;</button>
            </div>

            <div class="p-6 space-y-4">
                <p class="text-sm text-gray-600">
                    Cuéntanos tu experiencia en: <br>
                    <strong class="text-gray-900 text-base">{{ selectedEvent.title }}</strong>
                </p>

                <!-- Calificación 0-10 -->
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">Calificación (0 - 10)</label>
                    <select v-model="reviewForm.rating" class="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-yellow-400 outline-none">
                        <option v-for="n in 11" :key="n" :value="n-1">{{ n-1 }} {{ n-1 === 10 ? '(Excelente)' : n-1 === 0 ? '(Pésimo)' : '' }}</option>
                    </select>
                </div>

                <!-- Comentario -->
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">Comentario</label>
                    <textarea 
                        v-model="reviewForm.comment"
                        rows="4" 
                        class="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-yellow-400 outline-none resize-none"
                        placeholder="¿Qué te pareció el evento? ¿Qué podríamos mejorar?"
                    ></textarea>
                </div>

                <div class="flex justify-end gap-3 pt-2">
                    <button @click="showReviewModal = false" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded font-bold">Cancelar</button>
                    <button @click="submitReview" class="px-6 py-2 bg-[#004a8f] text-white rounded font-bold hover:bg-blue-900 shadow">Enviar Reseña</button>
                </div>
            </div>
        </div>
    </div>

  </div>
</template>