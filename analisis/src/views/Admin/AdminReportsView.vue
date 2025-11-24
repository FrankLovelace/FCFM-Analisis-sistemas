<script setup lang="ts">
import { onMounted } from 'vue';
import { useEventStore } from '../../stores/eventStore';

const eventStore = useEventStore();

onMounted(() => {
    eventStore.loadEvents();
});

// Helper para calcular porcentaje de barras
const getPercent = (val: number, total: number) => {
    if(total === 0) return 0;
    return Math.round((val / total) * 100);
};
</script>

<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-bold text-uni-blue mb-4">Reportes y Estadísticas (RF12)</h2>

        <!-- KPIS GENERALES -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white p-6 rounded shadow border-l-4 border-uni-gold">
                <div class="text-gray-500 text-sm font-bold uppercase">Eventos Publicados</div>
                <div class="text-3xl font-bold text-gray-800 mt-2">{{ eventStore.stats.active }}</div>
                <div class="text-xs text-gray-400">de {{ eventStore.stats.total }} totales</div>
            </div>
            <div class="bg-white p-6 rounded shadow border-l-4 border-uni-blue">
                <div class="text-gray-500 text-sm font-bold uppercase">Registros Totales</div>
                <div class="text-3xl font-bold text-gray-800 mt-2">{{ eventStore.stats.totalRegistrations }}</div>
                <div class="text-xs text-gray-400">Estudiantes/Docentes</div>
            </div>
            <div class="bg-white p-6 rounded shadow border-l-4 border-green-500">
                <div class="text-gray-500 text-sm font-bold uppercase">Tasa de Ocupación</div>
                <div class="text-3xl font-bold text-gray-800 mt-2">85%</div>
                <div class="text-xs text-gray-400">Promedio general (Simulado)</div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <!-- DISTRIBUCIÓN POR TIPO (RF12 inciso f) -->
            <div class="bg-white p-6 rounded shadow">
                <h3 class="font-bold text-gray-700 mb-4">Distribución por Tipo de Evento</h3>
                <div class="space-y-4">
                    <div v-for="(count, category) in eventStore.stats.typeDist" :key="category">
                        <div class="flex justify-between text-sm mb-1">
                            <span class="text-gray-600">{{ category }}</span>
                            <span class="font-bold">{{ count }}</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2.5">
                            <div class="bg-uni-blue h-2.5 rounded-full" :style="{ width: getPercent(count, eventStore.stats.total) + '%' }"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- DISTRIBUCIÓN POR MODALIDAD (RF12 inciso g) -->
            <div class="bg-white p-6 rounded shadow">
                <h3 class="font-bold text-gray-700 mb-4">Distribución por Modalidad</h3>
                <div class="space-y-4">
                    <div v-for="(count, mod) in eventStore.stats.modalityDist" :key="mod">
                        <div class="flex justify-between text-sm mb-1">
                            <span class="text-gray-600">{{ mod }}</span>
                            <span class="font-bold">{{ count }}</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2.5">
                            <div class="bg-uni-gold h-2.5 rounded-full" :style="{ width: getPercent(count, eventStore.stats.total) + '%' }"></div>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <!-- TOP EVENTOS (RF12 inciso d) -->
        <div class="bg-white p-6 rounded shadow">
            <h3 class="font-bold text-gray-700 mb-4">Top Eventos con Mayor Asistencia</h3>
            <table class="w-full text-left">
                <thead>
                    <tr class="text-xs text-gray-400 uppercase border-b">
                        <th class="pb-2">Evento</th>
                        <th class="pb-2">Dependencia</th>
                        <th class="pb-2 text-right">Registros</th>
                        <th class="pb-2 text-right">Rating</th>
                    </tr>
                </thead>
                <tbody class="text-sm">
                    <tr v-for="(event, i) in eventStore.stats.topEvents" :key="event.id" class="border-b last:border-0">
                        <td class="py-3 font-medium">
                            <span class="inline-block w-6 text-gray-400 font-bold">#{{ i+1 }}</span>
                            {{ event.title }}
                        </td>
                        <td class="py-3 text-gray-500">{{ event.faculty }}</td>
                        <td class="py-3 text-right font-bold text-uni-blue">{{ event.registrations }}</td>
                       <td class="py-3 text-right text-uni-gold">
    ★ {{ (event.rating || 0).toFixed(1) }}
</td>
                    </tr>
                </tbody>
            </table>
        </div>

    </div>
</template>