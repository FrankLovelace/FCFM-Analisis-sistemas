<script setup lang="ts">
import { onMounted } from 'vue';
import { useEventStore } from '../../stores/eventStore';

const eventStore = useEventStore();

onMounted(() => {
    eventStore.loadEvents();
});

const handleApprove = (id: string) => {
    if(confirm('¿Confirmar publicación del evento?')) {
        eventStore.approveEvent(id);
    }
};

const handleReject = (id: string) => {
    const reason = prompt("Ingrese el motivo del rechazo (para notificar al responsable):");
    if(reason) {
        eventStore.rejectEvent(id);
        alert(`Evento rechazado. Notificación enviada: "${reason}"`);
    }
};
</script>

<template>
    <div class="bg-white p-6 rounded shadow">
        <h2 class="text-2xl font-bold text-uni-blue mb-4 border-b pb-2">Solicitudes de Aprobación (RF02)</h2>
        
        <div v-if="eventStore.pendingEvents.length === 0" class="text-center py-10 text-gray-500">
            <div class="text-4xl mb-2">✅</div>
            <p>No hay solicitudes pendientes.</p>
        </div>

        <div v-else class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-gray-100 text-gray-600 text-sm uppercase">
                        <th class="p-4 border-b">Evento</th>
                        <th class="p-4 border-b">Dependencia</th>
                        <th class="p-4 border-b">Fecha Solicitud</th>
                        <th class="p-4 border-b text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="event in eventStore.pendingEvents" :key="event.id" class="border-b hover:bg-gray-50">
                        <td class="p-4">
                            <div class="font-bold text-gray-800">{{ event.title }}</div>
                            <div class="text-xs text-gray-500">{{ event.category }} • {{ event.modality }}</div>
                        </td>
                        <td class="p-4 text-sm">{{ event.faculty }}</td>
                        <td class="p-4 text-sm text-gray-500">Hoy (Simulado)</td>
                        <td class="p-4 text-center space-x-2">
                            <button 
                                @click="handleApprove(event.id)"
                                class="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded text-xs font-bold transition"
                            >
                                Aprobar
                            </button>
                            <button 
                                @click="handleReject(event.id)"
                                class="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-xs font-bold transition"
                            >
                                Rechazar
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>