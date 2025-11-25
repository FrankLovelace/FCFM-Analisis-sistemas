<script setup lang="ts">
import { computed } from 'vue';
import { useEventStore } from '../../stores/eventStore';
import type { AdminEvent } from '../../stores/eventStore';

const eventStore = useEventStore();

// Definimos los eventos para comunicarnos con el Dashboard (abrir el modal)
const emit = defineEmits<{
  (e: 'create'): void;
  (e: 'edit', event: AdminEvent): void;
}>();

// FILTRO: "Mis Borradores"
// Mostramos eventos que NO están publicados (Pendientes y Rechazados)
// Esto simula el área de trabajo personal antes de salir a la luz.
const myDrafts = computed(() => {
  return eventStore.events.filter(e => e.status === 'pending' || e.status === 'rejected');
});

const handleDelete = (id: string) => {
  if (confirm('¿Eliminar este borrador permanentemente?')) {
    eventStore.deleteEvent(id);
  }
};
</script>

<template>
  <div class="bg-white rounded shadow overflow-hidden">
    
    <!-- Header simple -->
    <div class="p-6 border-b border-gray-100 flex justify-between items-center">
      <div>
        <h2 class="text-xl font-bold text-gray-800">Mis Borradores</h2>
        <p class="text-sm text-gray-500">Eventos en revisión o que requieren correcciones.</p>
      </div>
      <button 
        @click="$emit('create')"
        class="bg-uni-blue hover:bg-blue-800 text-white text-sm font-bold py-2 px-4 rounded transition"
      >
        + Crear Borrador
      </button>
    </div>

    <!-- LA TABLA CLÁSICA (Diseño original recuperado) -->
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-100 text-gray-600 text-xs uppercase font-bold">
            <th class="p-4 border-b">Evento</th>
            <th class="p-4 border-b">Facultad</th>
            <th class="p-4 border-b">Fecha</th>
            <th class="p-4 border-b text-center">Estado</th>
            <th class="p-4 border-b text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="text-sm">
          <tr v-for="event in myDrafts" :key="event.id" class="hover:bg-gray-50 border-b last:border-0 transition-colors">
            
            <!-- Evento -->
            <td class="p-4 font-semibold text-gray-800 w-1/3">
              {{ event.title }}
              <div class="text-xs text-gray-400 font-normal mt-1">{{ event.category }}</div>
            </td>

            <!-- Facultad -->
            <td class="p-4 text-gray-600">
              {{ event.faculty }}
            </td>

            <!-- Fecha -->
            <td class="p-4 text-gray-600 whitespace-nowrap">
              {{ event.date }}
              <div class="text-[10px] text-gray-400">{{ event.modality }}</div>
            </td>

            <!-- Estado (Badge simple) -->
            <td class="p-4 text-center">
              <span :class="{
                'bg-yellow-100 text-yellow-800 border-yellow-500': event.status === 'pending',
                'bg-red-100 text-red-800 border-red-500': event.status === 'rejected'
              }" class="px-3 py-1 rounded-full text-xs font-bold border border-opacity-20">
                {{ event.status === 'pending' ? 'En Revisión' : 'Rechazado' }}
              </span>
            </td>

            <!-- Acciones -->
            <td class="p-4 text-right space-x-3 whitespace-nowrap">
              <button 
                @click="$emit('edit', event)" 
                class="text-blue-600 hover:text-blue-900 font-bold text-xs uppercase tracking-wide"
              >
                Editar
              </button>
              <button 
                @click="handleDelete(event.id)" 
                class="text-red-500 hover:text-red-700 font-bold text-xs uppercase tracking-wide"
              >
                Borrar
              </button>
            </td>

          </tr>

          <!-- Estado Vacío -->
          <tr v-if="myDrafts.length === 0">
            <td colspan="5" class="p-10 text-center text-gray-400">
              No tienes borradores pendientes.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>