<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useEventStore } from '../../stores/eventStore';

const eventStore = useEventStore();

// --- ESTADOS DE LOS FILTROS ---
const selectedDependency = ref('GENERAL');
const selectedSemester = ref('GENERAL');

// Listas para los dropdowns
const dependencies = ['GENERAL', 'FIME', 'FACPYA', 'Artes Musicales', 'Dirección de Deportes', 'Rectoría'];
// Generamos semestres simulados basados en las fechas de los eventos
const semesters = ['GENERAL', 'Ago-Dic 2025', 'Ene-Jun 2026'];

onMounted(() => {
    eventStore.loadEvents();
});

// --- HELPER: Obtener semestre de una fecha ---
const getSemesterFromDate = (dateString: string) => {
    const d = new Date(dateString);
    const month = d.getMonth() + 1; // 1-12
    const year = d.getFullYear();
    
    // Lógica simple UANL: Ene-Jun (1-6) / Jul-Dic (7-12) (Simulada Ago-Dic)
    if (month <= 6) return `Ene-Jun ${year}`;
    return `Ago-Dic ${year}`;
};

// --- COMPUTED PRINCIPAL: EVENTOS FILTRADOS ---
// Esta lista alimenta a los puntos 1 al 7
const filteredEvents = computed(() => {
    return eventStore.events.filter(event => {
        // 1. Filtro Dependencia
        const matchDep = selectedDependency.value === 'GENERAL' || event.faculty === selectedDependency.value;
        
        // 2. Filtro Semestre
        const eventSem = getSemesterFromDate(event.date);
        const matchSem = selectedSemester.value === 'GENERAL' || eventSem === selectedSemester.value;

        return matchDep && matchSem;
    });
});

// --- CÁLCULOS DINÁMICOS (Basados en filteredEvents) ---

// 1, 2 y 3. Totales
const kpiStats = computed(() => {
    const totalPublished = filteredEvents.value.filter(e => e.status === 'published').length;
    // Asumimos que "Activos" son los publicados que aún no pasan de fecha (simulado hoy: 2025-10-01)
    const today = '2025-10-01';
    const totalActive = filteredEvents.value.filter(e => e.status === 'published' && e.date >= today).length;
    
    // Suma de registros (usando el campo registrations que agregamos al store)
    const totalRegistrations = filteredEvents.value.reduce((acc, e) => acc + (e.registrations || 0), 0);

    return { totalPublished, totalActive, totalRegistrations };
});

// 4. Top 10 Eventos
const top10Events = computed(() => {
    return [...filteredEvents.value]
        .sort((a, b) => (b.registrations || 0) - (a.registrations || 0))
        .slice(0, 10);
});

// 5. Comparativo Gratis vs Pago
const paymentStats = computed(() => {
    let free = 0;
    let paid = 0;
    filteredEvents.value.forEach(e => {
        // Normalizamos texto a minúsculas para comparar
        if (e.price.toLowerCase().includes('gratis') || e.price === '0') free++;
        else paid++;
    });
    const total = free + paid || 1; // Evitar división por 0
    return { free, paid, total };
});

// 6. Distribución por Tipo
const typeStats = computed(() => {
    const counts: Record<string, number> = {};
    filteredEvents.value.forEach(e => {
        counts[e.category] = (counts[e.category] || 0) + 1;
    });
    return counts;
});

// 7. Distribución por Modalidad
const modalityStats = computed(() => {
    const counts: Record<string, number> = {};
    filteredEvents.value.forEach(e => {
        counts[e.modality] = (counts[e.modality] || 0) + 1;
    });
    return counts;
});

// --- CÁLCULO FIJO (Ranking Dependencias) ---
// Este SIEMPRE usa eventStore.events completo (ignora filtros)
const dependencyRanking = computed(() => {
    const depCounts: Record<string, number> = {};
    
    eventStore.events.forEach(e => {
        // Sumamos registros/asistencia por dependencia
        depCounts[e.faculty] = (depCounts[e.faculty] || 0) + (e.registrations || 0);
    });

    // Convertir a array y ordenar
    return Object.entries(depCounts)
        .sort((a, b) => b[1] - a[1]) // Orden descendente
        .map(([name, count]) => ({ name, count }));
});

// Helper visual para porcentajes
const getPercent = (val: number, total: number) => {
    if (!total) return 0;
    return Math.round((val / total) * 100);
};
</script>

<template>
    <div class="space-y-8 pb-12">
        
        <!-- HEADER Y FILTROS -->
        <div class="bg-white p-6 rounded shadow-sm border border-gray-200">
            <h2 class="text-2xl font-bold text-uni-blue mb-6 border-b pb-2">Reportes y Estadísticas</h2>
            
            <div class="flex flex-col md:flex-row gap-6 items-end">
                <!-- Filtro Dependencia -->
                <div class="w-full md:w-1/3">
                    <label class="block text-sm font-bold text-gray-700 mb-2">Dependencia</label>
                    <select v-model="selectedDependency" class="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-uni-blue outline-none bg-gray-50">
                        <option v-for="dep in dependencies" :key="dep" :value="dep">{{ dep }}</option>
                    </select>
                </div>

                <!-- Filtro Semestre -->
                <div class="w-full md:w-1/3">
                    <label class="block text-sm font-bold text-gray-700 mb-2">Semestre</label>
                    <select v-model="selectedSemester" class="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-uni-blue outline-none bg-gray-50">
                        <option v-for="sem in semesters" :key="sem" :value="sem">{{ sem }}</option>
                    </select>
                </div>

                <div class="w-full md:w-1/3 pb-2 text-xs text-gray-500">
                    * Estos filtros aplican a las gráficas y KPIs inferiores.
                </div>
            </div>
        </div>

        <!-- 1, 2, 3. KPIS (Tarjetas) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white p-6 rounded shadow border-l-4 border-uni-blue">
                <div class="text-gray-500 text-xs font-bold uppercase">Total Publicados</div>
                <div class="text-4xl font-bold text-gray-800 mt-2">{{ kpiStats.totalPublished }}</div>
                <div class="text-xs text-gray-400 mt-1">Eventos en el sistema</div>
            </div>
            <div class="bg-white p-6 rounded shadow border-l-4 border-green-500">
                <div class="text-gray-500 text-xs font-bold uppercase">Eventos Activos</div>
                <div class="text-4xl font-bold text-gray-800 mt-2">{{ kpiStats.totalActive }}</div>
                <div class="text-xs text-gray-400 mt-1">Vigentes a la fecha</div>
            </div>
            <div class="bg-white p-6 rounded shadow border-l-4 border-uni-gold">
                <div class="text-gray-500 text-xs font-bold uppercase">Registros Acumulados</div>
                <div class="text-4xl font-bold text-gray-800 mt-2">{{ kpiStats.totalRegistrations }}</div>
                <div class="text-xs text-gray-400 mt-1">Total de asistentes</div>
            </div>
        </div>

        <!-- GRÁFICAS COMPARATIVAS -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <!-- 5. Gratis vs Pago -->
            <div class="bg-white p-6 rounded shadow border border-gray-100">
                <h3 class="font-bold text-gray-700 mb-6">Comparativo: Gratuitos vs Pago</h3>
                
                <div class="flex items-center gap-4 mb-2">
                    <span class="w-20 text-sm font-bold text-right text-gray-600">Gratuitos</span>
                    <div class="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                        <div class="bg-green-500 h-full flex items-center justify-end pr-2 text-xs text-white font-bold transition-all duration-500" 
                             :style="{ width: getPercent(paymentStats.free, paymentStats.total) + '%' }">
                             {{ paymentStats.free }}
                        </div>
                    </div>
                    <span class="w-12 text-sm font-bold text-gray-500">{{ getPercent(paymentStats.free, paymentStats.total) }}%</span>
                </div>

                <div class="flex items-center gap-4">
                    <span class="w-20 text-sm font-bold text-right text-gray-600">De Pago</span>
                    <div class="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                        <div class="bg-blue-600 h-full flex items-center justify-end pr-2 text-xs text-white font-bold transition-all duration-500" 
                             :style="{ width: getPercent(paymentStats.paid, paymentStats.total) + '%' }">
                             {{ paymentStats.paid }}
                        </div>
                    </div>
                    <span class="w-12 text-sm font-bold text-gray-500">{{ getPercent(paymentStats.paid, paymentStats.total) }}%</span>
                </div>
            </div>

            <!-- 7. Modalidades -->
            <div class="bg-white p-6 rounded shadow border border-gray-100">
                <h3 class="font-bold text-gray-700 mb-6">Distribución por Modalidad</h3>
                <div class="space-y-4">
                    <div v-for="(count, mod) in modalityStats" :key="mod">
                        <div class="flex justify-between text-xs mb-1">
                            <span class="font-bold text-gray-600">{{ mod }}</span>
                            <span class="text-gray-500">{{ count }} eventos</span>
                        </div>
                        <div class="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                            <div class="bg-uni-gold h-full rounded-full transition-all duration-500"
                                 :style="{ width: getPercent(count, filteredEvents.length) + '%' }">
                            </div>
                        </div>
                    </div>
                    <div v-if="filteredEvents.length === 0" class="text-center text-gray-400 text-sm py-4">
                        No hay datos con los filtros actuales.
                    </div>
                </div>
            </div>

        </div>

        <!-- 6. Tipos de Evento -->
        <div class="bg-white p-6 rounded shadow border border-gray-100">
            <h3 class="font-bold text-gray-700 mb-4">Distribución por Tipo de Evento</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div v-for="(count, type) in typeStats" :key="type" class="text-center p-4 bg-gray-50 rounded border border-gray-200">
                    <div class="text-2xl font-bold text-uni-blue">{{ count }}</div>
                    <div class="text-xs uppercase font-bold text-gray-500 mt-1">{{ type }}</div>
                    <div class="w-full bg-gray-200 h-1.5 mt-3 rounded-full overflow-hidden">
                        <div class="bg-uni-blue h-full" :style="{ width: getPercent(count, filteredEvents.length) + '%' }"></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <!-- 4. TOP 10 EVENTOS (Filtrado) -->
            <div class="lg:col-span-2 bg-white p-6 rounded shadow border border-gray-100">
                <h3 class="font-bold text-gray-700 mb-4 flex items-center gap-2">
                    🏆 Top 10 Eventos (Mayor Asistencia)
                    <span class="text-xs font-normal text-gray-400 bg-gray-100 px-2 rounded-full">Según filtros</span>
                </h3>
                
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead>
                            <tr class="text-xs text-gray-400 uppercase border-b bg-gray-50">
                                <th class="p-3">#</th>
                                <th class="p-3">Evento</th>
                                <th class="p-3">Dependencia</th>
                                <th class="p-3 text-right">Asistencia</th>
                            </tr>
                        </thead>
                        <tbody class="text-sm">
                            <tr v-for="(event, i) in top10Events" :key="event.id" class="border-b last:border-0 hover:bg-gray-50">
                                <td class="p-3 font-bold text-gray-400">{{ i+1 }}</td>
                                <td class="p-3 font-semibold text-gray-800">{{ event.title }}</td>
                                <td class="p-3 text-gray-500 text-xs">{{ event.faculty }}</td>
                                <td class="p-3 text-right font-bold text-uni-blue">{{ event.registrations || 0 }}</td>
                            </tr>
                            <tr v-if="top10Events.length === 0">
                                <td colspan="4" class="p-6 text-center text-gray-400">No hay datos disponibles.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- SECCIÓN FIJA (Sin Filtros) -->
            <!-- Ranking de Dependencias -->
            <div class="lg:col-span-1 bg-gray-800 text-white p-6 rounded shadow relative overflow-hidden">
                <div class="absolute top-0 right-0 p-4 opacity-10 text-6xl">📊</div>
                <h3 class="font-bold text-uni-gold mb-1">Ranking Global</h3>
                <p class="text-xs text-gray-400 mb-6 uppercase tracking-wider">Dependencias con mayor participación (Histórico)</p>

                <div class="space-y-4">
                    <div v-for="(dep, i) in dependencyRanking" :key="dep.name" class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold" 
                                 :class="i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-orange-400' : 'text-gray-500'">
                                {{ i + 1 }}
                            </div>
                            <span class="text-sm font-bold">{{ dep.name }}</span>
                        </div>
                        <span class="text-sm font-mono text-gray-300">{{ dep.count }}</span>
                    </div>
                </div>
            </div>

        </div>

    </div>
</template>