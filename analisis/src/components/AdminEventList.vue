<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useEventStore } from '../stores/eventStore';
import type { AdminEvent } from '../stores/eventStore';

const eventStore = useEventStore();
const router = useRouter();

const emit = defineEmits<{
  (e: 'create'): void;
  (e: 'edit', event: AdminEvent): void;
}>();

// --- FILTROS (Iguales a HomeView) ---
const filters = ref({
  search: '',
  category: '',
  faculty: '',
  modality: '',
  price: '',
  date: ''
});

// --- ESTADO DEL MODAL REPORTE ---
const showReportModal = ref(false);
const reportEvent = ref<(AdminEvent & { commentsList?: any[] }) | null>(null);

// --- LÓGICA DE FILTRADO ---
const filteredEvents = computed(() => {
  return eventStore.events.filter(event => {
    // Excluir rechazados
    if (event.status === 'rejected') return false;

    // Filtros de Texto
    const matchSearch = event.title.toLowerCase().includes(filters.value.search.toLowerCase());
    
    // Filtros Selectores
    const matchCategory = filters.value.category ? event.category === filters.value.category : true;
    const matchFaculty = filters.value.faculty ? event.faculty === filters.value.faculty : true;
    const matchModality = filters.value.modality ? event.modality === filters.value.modality : true;
    const matchDate = filters.value.date ? event.date === filters.value.date : true;

    // Filtro Precio
    let matchPrice = true;
    if (filters.value.price === 'Gratis') matchPrice = event.price.toLowerCase().includes('gratis') || event.price === '0';
    if (filters.value.price === 'Pago') matchPrice = !event.price.toLowerCase().includes('gratis') && event.price !== '0';

    return matchSearch && matchCategory && matchFaculty && matchModality && matchPrice && matchDate;
  });
});

// --- ACCIONES ---
const handleDelete = (id: string) => {
  if (confirm('¿Eliminar evento permanentemente?')) eventStore.deleteEvent(id);
};

const goToDetail = (id: string) => {
    // Redirige a la vista pública de detalle
    router.push(`/event/${id}`);
};

const openReport = (event: AdminEvent) => {
    reportEvent.value = event as (AdminEvent & { commentsList?: any[] });
    showReportModal.value = true;
};

// --- CÁLCULOS DEL REPORTE ---
const reportStats = computed(() => {
    if (!reportEvent.value) return null;
    const e = reportEvent.value;

    // 1. Ocupación
    const capacity = (e as any).capacity || 100; // Default simulado
    const occupancyRate = Math.round((e.registrations / capacity) * 100);

    // 2. Recaudación
    // Extraer números de "$100 MXN" -> 100
    const priceNum = parseFloat(e.price.replace(/[^0-9.]/g, '')) || 0;
    const revenue = priceNum * e.registrations;

    // 3. Estado de finalización (Simulamos que hoy es 2025-10-01)
    // Si la fecha del evento es menor a hoy, ya finalizó.
    const today = '2025-10-01'; 
    const isFinished = e.date < today;

    return {
        capacity,
        occupancyRate,
        revenue,
        isFinished,
        // Datos simulados para gráficas
        attendancePercent: Math.round((e.attendance / e.registrations) * 100) || 0
    };
});
</script>

<template>
  <div class="space-y-6">
    
    <!-- HEADER Y FILTROS (Copia de HomeView) -->
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-gray-800">Gestión de Eventos</h2>
            <button @click="$emit('create')" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow flex gap-2">
                <span>+</span> Nuevo
            </button>
        </div>

        <!-- Buscador -->
        <div class="mb-4">
            <input v-model="filters.search" type="text" placeholder="Buscar por título..." class="w-full border rounded p-2 focus:ring-2 focus:ring-uni-blue outline-none">
        </div>

        <!-- Grid Filtros -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <select v-model="filters.category" class="border rounded p-2 text-sm"><option value="">Todas Categorías</option><option>Académico</option><option>Cultural</option><option>Deportivo</option></select>
            <select v-model="filters.faculty" class="border rounded p-2 text-sm"><option value="">Todas Dependencias</option><option>FIME</option><option>FACPYA</option><option>Artes Musicales</option></select>
            <input v-model="filters.date" type="date" class="border rounded p-2 text-sm">
            <select v-model="filters.modality" class="border rounded p-2 text-sm"><option value="">Todas Modalidades</option><option>Presencial</option><option>Virtual</option></select>
            <select v-model="filters.price" class="border rounded p-2 text-sm"><option value="">Todos Precios</option><option>Gratis</option><option>Pago</option></select>
        </div>
    </div>

    <!-- LISTA DE TARJETAS (Estilo Home) -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="event in filteredEvents" :key="event.id" class="bg-white rounded-lg shadow border border-gray-100 flex flex-col group hover:shadow-lg transition-all relative">
            
            <!-- Botones Admin Flotantes (Editar/Eliminar) -->
            <div class="absolute top-2 right-2 flex gap-1 z-10">
                <button @click="$emit('edit', event)" class="bg-white p-1.5 rounded-full shadow hover:text-blue-600" title="Editar">✏️</button>
                <button @click="handleDelete(event.id)" class="bg-white p-1.5 rounded-full shadow hover:text-red-600" title="Eliminar">🗑️</button>
            </div>

            <!-- Imagen -->
            <div class="h-40 bg-gray-200 overflow-hidden rounded-t-lg">
                <img :src="event.image" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Evento">
            </div>

            <div class="p-4 flex-1 flex flex-col">
                <div class="flex justify-between mb-2">
                    <span class="text-[10px] font-bold uppercase bg-gray-100 px-2 py-0.5 rounded text-gray-600">{{ event.category }}</span>
                    <span class="text-xs text-gray-500">{{ event.displayDate }}</span>
                </div>
                
                <h3 class="font-bold text-gray-800 leading-tight mb-1">{{ event.title }}</h3>
                <p class="text-xs text-gray-500 mb-4">{{ event.faculty }} • {{ event.modality }}</p>

                <!-- BOTONES DE ACCIÓN (Requerimiento b) -->
                <div class="mt-auto grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                    <button 
                        @click="goToDetail(event.id)"
                        class="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2 rounded transition-colors"
                    >
                        Ver Detalles
                    </button>
                    
                    <button 
                        @click="openReport(event)"
                        class="bg-uni-blue hover:bg-blue-800 text-white text-xs font-bold py-2 rounded transition-colors flex items-center justify-center gap-1"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        Ver Reporte
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- MODAL DE REPORTE -->
    <div v-if="showReportModal && reportEvent && reportStats" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div class="bg-white w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            
            <div class="bg-uni-blue p-4 flex justify-between items-center text-white">
                <h3 class="font-bold text-lg">Reporte de Evento</h3>
                <button @click="showReportModal = false" class="text-2xl hover:text-gray-300">&times;</button>
            </div>

            <div class="p-6 space-y-6">
                <!-- Info General -->
                <div class="border-b pb-4">
                    <h2 class="text-xl font-bold text-gray-800">{{ reportEvent.title }}</h2>
                    <p class="text-sm text-gray-500 mt-1">
                        {{ reportEvent.displayDate }} • 
                        <span :class="reportStats.isFinished ? 'text-red-600 font-bold' : 'text-green-600 font-bold'">
                            {{ reportStats.isFinished ? 'Finalizado' : 'Activo / Próximo' }}
                        </span>
                    </p>
                </div>

                <!-- 1, 2, 3. Estadísticas Generales -->
                <div class="grid grid-cols-3 gap-4 text-center">
                    <div class="bg-gray-50 p-3 rounded border">
                        <div class="text-xs text-gray-500 uppercase font-bold">Total Registros</div>
                        <div class="text-2xl font-bold text-uni-blue">{{ reportEvent.registrations }}</div>
                    </div>
                    <div class="bg-gray-50 p-3 rounded border">
                        <div class="text-xs text-gray-500 uppercase font-bold">Ocupación</div>
                        <div class="text-2xl font-bold" :class="reportStats.occupancyRate > 90 ? 'text-green-600' : 'text-gray-800'">
                            {{ reportStats.occupancyRate }}%
                        </div>
                        <div class="text-[10px] text-gray-400">Cupo: {{ reportStats.capacity }}</div>
                    </div>
                    <div class="bg-gray-50 p-3 rounded border">
                        <div class="text-xs text-gray-500 uppercase font-bold">Recaudación</div>
                        <div class="text-2xl font-bold text-green-700">${{ reportStats.revenue }}</div>
                    </div>
                </div>

                <!-- SECCIÓN: SOLO SI FINALIZÓ (Requerimientos 4, 5, 6, 7) -->
                <div v-if="reportStats.isFinished" class="space-y-6 animate-fade-in">
                    <hr>
                    
                    <!-- 4 y 5. Calificación y Total Comentarios -->
                    <div class="flex gap-6 items-center">
                        <div class="flex-1 bg-yellow-50 p-4 rounded border border-yellow-200 flex items-center justify-between">
                            <div>
                                <div class="text-sm font-bold text-yellow-800">Calificación Promedio</div>
                                <div class="text-3xl font-bold text-yellow-600 mt-1">★ {{ reportEvent.rating }}</div>
                            </div>
                            <div class="text-right">
                                <div class="text-2xl font-bold text-gray-700">{{ reportEvent.commentsList?.length || 0 }}</div>
                                <div class="text-xs text-gray-500">Comentarios</div>
                            </div>
                        </div>
                    </div>

                    <!-- 7. Comparativa Registros vs Asistencia -->
                    <div class="border p-4 rounded bg-white">
                        <h4 class="font-bold text-gray-700 mb-4 text-sm uppercase">Asistencia Real vs Esperada</h4>
                        
                        <div class="space-y-3">
                            <div>
                                <div class="flex justify-between text-xs mb-1">
                                    <span>Registrados ({{ reportEvent.registrations }})</span>
                                </div>
                                <div class="w-full bg-gray-200 h-4 rounded-full">
                                    <div class="bg-blue-300 h-4 rounded-full w-full"></div>
                                </div>
                            </div>
                            <div>
                                <div class="flex justify-between text-xs mb-1">
                                    <span class="font-bold">Asistencia Real ({{ reportEvent.attendance }})</span>
                                    <span class="font-bold">{{ reportStats.attendancePercent }}%</span>
                                </div>
                                <div class="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
                                    <div class="bg-blue-600 h-4 rounded-full transition-all duration-1000" :style="{ width: reportStats.attendancePercent + '%' }"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 6. Listado de Comentarios -->
                    <div>
                        <h4 class="font-bold text-gray-700 mb-3 text-sm uppercase">Comentarios Recientes</h4>
                        <div class="bg-gray-50 rounded border max-h-40 overflow-y-auto p-2 space-y-2">
                            <div v-for="(comment, i) in reportEvent.commentsList" :key="i" class="bg-white p-2 rounded shadow-sm text-sm border border-gray-100">
                                <div class="flex justify-between mb-1">
                                    <span class="font-bold text-xs text-gray-700">{{ comment.user }}</span>
                                    <span class="text-xs text-yellow-600 font-bold">★ {{ comment.rating }}</span>
                                </div>
                                <p class="text-gray-600 text-xs">"{{ comment.text }}"</p>
                            </div>
                            <div v-if="!reportEvent.commentsList?.length" class="text-center text-xs text-gray-400 py-2">
                                No hay comentarios disponibles.
                            </div>
                        </div>
                    </div>

                </div>

                <!-- MENSAJE SI NO HA FINALIZADO -->
                <div v-else class="bg-blue-50 text-blue-800 p-4 rounded text-center text-sm border border-blue-100">
                    ℹ️ Las estadísticas de asistencia, calificaciones y comentarios estarán disponibles una vez que el evento haya finalizado.
                </div>

                <div class="text-right">
                    <button @click="showReportModal = false" class="text-gray-500 hover:text-gray-700 text-sm font-bold underline">Cerrar Reporte</button>
                </div>
            </div>
        </div>
    </div>

  </div>
</template>