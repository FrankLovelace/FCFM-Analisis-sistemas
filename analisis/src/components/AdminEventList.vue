<script setup lang="ts">
import { computed } from 'vue';
import { useEventStore } from '../stores/eventStore';
import type { AdminEvent } from '../stores/eventStore';

// Instancia del Store
const eventStore = useEventStore();

// Definimos los eventos que este componente enviará al padre (DashboardView)
// 'create': Cuando se da clic en "Nuevo Evento"
// 'edit': Cuando se da clic en "Editar" (pasamos el objeto evento)
const emit = defineEmits<{
  (e: 'create'): void;
  (e: 'edit', event: AdminEvent): void;
}>();

// Filtramos la lista:
// Mostramos 'published' y 'pending'. Ocultamos 'rejected' para no ensuciar la vista principal.
// (Si quisieras ver los rechazados, podrías crear otra pestaña o quitar el filter)
const displayEvents = computed(() => {
  return eventStore.events.filter(e => e.status !== 'rejected');
});

// Acción de eliminar directa
const handleDelete = (id: string) => {
  if (confirm('¿Estás seguro de que deseas eliminar este evento permanentemente?')) {
    eventStore.deleteEvent(id);
  }
};
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    
    <!-- Header de la Tabla -->
    <div class="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
      <div>
        <h2 class="text-xl font-bold text-gray-800">Gestión de Eventos</h2>
        <p class="text-sm text-gray-500">Administra, edita o elimina los eventos actuales.</p>
      </div>
      
      <button 
        @click="$emit('create')"
        class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded shadow transition-colors flex items-center gap-2"
      >
        <span>+</span> Nuevo Evento
      </button>
    </div>

    <!-- Tabla -->
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead class="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
          <tr>
            <th class="p-4 border-b">Detalles del Evento</th>
            <th class="p-4 border-b">Fecha</th>
            <th class="p-4 border-b">Estado</th>
            <th class="p-4 border-b text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          
          <tr v-for="event in displayEvents" :key="event.id" class="hover:bg-blue-50/50 transition-colors">
            
            <!-- Columna Info -->
            <td class="p-4">
              <div class="font-bold text-gray-800 text-base">{{ event.title }}</div>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                  {{ event.faculty }}
                </span>
                <span class="text-xs text-gray-400">•</span>
                <span class="text-xs text-gray-500">{{ event.category }}</span>
              </div>
            </td>

            <!-- Columna Fecha -->
            <td class="p-4 text-sm text-gray-600">
              {{ event.displayDate }}
              <div class="text-xs text-gray-400 mt-0.5">{{ event.modality }}</div>
            </td>

            <!-- Columna Estado (Badge) -->
            <td class="p-4">
              <span 
                class="px-2.5 py-1 rounded-full text-xs font-bold border"
                :class="{
                  'bg-green-100 text-green-700 border-green-200': event.status === 'published',
                  'bg-yellow-100 text-yellow-700 border-yellow-200': event.status === 'pending'
                }"
              >
                {{ event.status === 'published' ? 'Publicado' : 'En Revisión' }}
              </span>
            </td>

            <!-- Columna Acciones -->
            <td class="p-4 text-right">
              <div class="flex justify-end gap-3">
                <button 
                  @click="$emit('edit', event)"
                  class="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                  Editar
                </button>
                
                <button 
                  @click="handleDelete(event.id)"
                  class="text-red-500 hover:text-red-700 font-medium text-sm flex items-center gap-1 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                  Eliminar
                </button>
              </div>
            </td>

          </tr>

          <!-- Estado Vacío -->
          <tr v-if="displayEvents.length === 0">
            <td colspan="4" class="p-12 text-center text-gray-500 bg-white">
              <div class="text-4xl mb-2">📭</div>
              <p class="font-semibold">No hay eventos activos.</p>
              <p class="text-sm">Haz clic en "Nuevo Evento" para comenzar.</p>
            </td>
          </tr>

        </tbody>
      </table>
    </div>
  </div>
</template>