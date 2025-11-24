<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useEventStore } from '../../stores/eventStore';
import type { AdminEvent } from '../../stores/eventStore';

const eventStore = useEventStore();

// --- FILTROS  ---
const filters = ref({
  search: '', category: '', faculty: '', modality: '', date: ''
});

// --- ESTADO DEL MODAL DE DETALLES ---
const showDetailModal = ref(false);
const selectedEvent = ref<AdminEvent | null>(null);
const denyReason = ref('');
const showDenyInput = ref(false);

onMounted(() => {
    eventStore.loadEvents();
});

// --- FILTRADO DE EVENTOS PENDIENTES ---
const filteredPendingEvents = computed(() => {
  return eventStore.pendingEvents.filter(event => {
    const matchSearch = event.title.toLowerCase().includes(filters.value.search.toLowerCase());
    const matchCategory = filters.value.category ? event.category === filters.value.category : true;
    const matchFaculty = filters.value.faculty ? event.faculty === filters.value.faculty : true;
    const matchModality = filters.value.modality ? event.modality === filters.value.modality : true;
    const matchDate = filters.value.date ? event.date === filters.value.date : true;

    return matchSearch && matchCategory && matchFaculty && matchModality && matchDate;
  });
});

// --- ACCIONES ---
const openDetails = (event: AdminEvent) => {
    selectedEvent.value = event;
    denyReason.value = '';
    showDenyInput.value = false;
    showDetailModal.value = true;
};

const handleApprove = () => {
    if (!selectedEvent.value) return;
    if(confirm('¿Aceptar y publicar este evento?')) {
        eventStore.approveEvent(selectedEvent.value.id);
        showDetailModal.value = false;
    }
};

const handleDenyClick = () => {
    showDenyInput.value = true; 
};

const confirmDenial = () => {
    if (!selectedEvent.value) return;
    if (!denyReason.value.trim()) {
        alert("El motivo es obligatorio para denegar.");
        return;
    }
    eventStore.rejectEvent(selectedEvent.value.id);
    alert(`Evento denegado. Motivo enviado: "${denyReason.value}"`);
    showDetailModal.value = false;
};
</script>

<template>
    <div class="space-y-6">
        <!-- HEADER Y FILTROS -->
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 class="text-2xl font-bold text-uni-blue mb-4">Solicitudes de Aprobación</h2>
            
            <!-- Buscador -->
            <div class="mb-4">
                <input v-model="filters.search" type="text" placeholder="Buscar solicitud..." class="w-full border rounded p-2 focus:ring-2 focus:ring-uni-blue outline-none">
            </div>

            <!-- Grid Filtros -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <select v-model="filters.category" class="border rounded p-2 text-sm"><option value="">Todas Categorías</option><option>Académico</option><option>Cultural</option><option>Deportivo</option></select>
                <select v-model="filters.faculty" class="border rounded p-2 text-sm"><option value="">Todas Dependencias</option><option>FIME</option><option>FACPYA</option><option>Artes Musicales</option></select>
                <input v-model="filters.date" type="date" class="border rounded p-2 text-sm">
                <select v-model="filters.modality" class="border rounded p-2 text-sm"><option value="">Todas Modalidades</option><option>Presencial</option><option>Virtual</option></select>
            </div>
        </div>

        <!-- LISTA DE TARJETAS (Interfaz Landing Page) -->
        <div v-if="filteredPendingEvents.length === 0" class="text-center py-12 text-gray-500 bg-white rounded">
            No hay solicitudes pendientes con estos filtros.
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="event in filteredPendingEvents" :key="event.id" class="bg-white rounded-lg shadow border border-gray-100 flex flex-col group relative">
                <!-- Badge Pendiente -->
                <div class="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded z-10 shadow">
                    PENDIENTE
                </div>

                <div class="h-40 bg-gray-200 overflow-hidden rounded-t-lg">
                    <img :src="event.image" class="w-full h-full object-cover grayscale" alt="Evento">
                </div>

                <div class="p-4 flex-1 flex flex-col">
                    <h3 class="font-bold text-gray-800 mb-1">{{ event.title }}</h3>
                    <p class="text-xs text-gray-500 mb-4">{{ event.faculty }} • {{ event.displayDate }}</p>
                    
                    <button 
                        @click="openDetails(event)"
                        class="mt-auto w-full bg-uni-blue hover:bg-blue-800 text-white text-sm font-bold py-2 rounded transition-colors"
                    >
                        Ver Detalles
                    </button>
                </div>
            </div>
        </div>

        <!-- MODAL DE DETALLES (Tipo Editar pero Read-Only) -->
        <div v-if="showDetailModal && selectedEvent" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div class="bg-white w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                
                <div class="bg-gray-100 px-6 py-4 border-b flex justify-between items-center">
                    <h3 class="font-bold text-lg text-gray-800">Revisión de Evento</h3>
                    <button @click="showDetailModal = false" class="text-gray-500 hover:text-black text-2xl">&times;</button>
                </div>

                <div class="p-6 space-y-4">
                    <!-- Campos en modo lectura (disabled) -->
                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase">Título</label>
                        <input :value="selectedEvent.title" disabled class="w-full border bg-gray-50 rounded p-2 text-gray-700">
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase">Dependencia</label>
                            <input :value="selectedEvent.faculty" disabled class="w-full border bg-gray-50 rounded p-2 text-gray-700">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase">Categoría</label>
                            <input :value="selectedEvent.category" disabled class="w-full border bg-gray-50 rounded p-2 text-gray-700">
                        </div>
                    </div>

                    <div class="grid grid-cols-3 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase">Fecha</label>
                            <input :value="selectedEvent.displayDate" disabled class="w-full border bg-gray-50 rounded p-2 text-gray-700">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase">Modalidad</label>
                            <input :value="selectedEvent.modality" disabled class="w-full border bg-gray-50 rounded p-2 text-gray-700">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase">Precio</label>
                            <input :value="selectedEvent.price" disabled class="w-full border bg-gray-50 rounded p-2 text-gray-700">
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase">Descripción</label>
                        <textarea :value="selectedEvent.description" disabled rows="3" class="w-full border bg-gray-50 rounded p-2 text-gray-700"></textarea>
                    </div>

                    <!-- SECCIÓN DE DENEGACIÓN (Aparece al dar clic en Denegar) -->
                    <div v-if="showDenyInput" class="bg-red-50 border border-red-200 p-4 rounded animate-fade-in">
                        <label class="block text-sm font-bold text-red-800 mb-1">Motivo de rechazo (Obligatorio):</label>
                        <textarea v-model="denyReason" rows="2" class="w-full border border-red-300 rounded p-2 focus:outline-none focus:border-red-500" placeholder="Ej. Falta información en la descripción..."></textarea>
                        <div class="flex justify-end mt-2">
                            <button @click="confirmDenial" class="bg-red-600 text-white text-xs font-bold px-4 py-2 rounded hover:bg-red-700">Confirmar Rechazo</button>
                        </div>
                    </div>

                </div>

                <!-- FOOTER ACCIONES -->
                <div class="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
                    <button v-if="!showDenyInput" @click="handleDenyClick" class="px-6 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded font-bold transition-colors">
                        Denegar
                    </button>
                    <button v-if="!showDenyInput" @click="handleApprove" class="px-6 py-2 bg-green-600 text-white hover:bg-green-700 rounded font-bold transition-colors shadow">
                        Aceptar
                    </button>
                    
                    <button v-if="showDenyInput" @click="showDenyInput = false" class="text-gray-500 text-sm underline">Cancelar rechazo</button>
                </div>

            </div>
        </div>

    </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
</style>