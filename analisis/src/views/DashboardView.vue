<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '../stores/AuthStore';
import { useEventStore } from '../stores/eventStore';
import type { UniversityEvent } from '../data/initialEvents';

const authStore = useAuthStore();
const eventStore = useEventStore();

// --- Estados del Modal y Formulario ---
const isModalOpen = ref(false);
const isEditing = ref(false);

// Objeto reactivo para el formulario
const formData = reactive<Omit<UniversityEvent, 'id'>>({
  title: '',
  category: 'Académico',
  faculty: 'FIME',
  date: '',
  displayDate: '',
  location: '',
  modality: 'Presencial',
  price: '',
  image: '',
  description: ''
});

// ID temporal para edición
const currentEditId = ref<string | null>(null);

onMounted(() => {
  eventStore.loadEvents();
});

// --- Acciones ---
const handleLogout = () => {
  authStore.logout();
};

const openCreateModal = () => {
  isEditing.value = false;
  currentEditId.value = null;
  // Reset form
  Object.assign(formData, {
    title: '', category: 'Académico', faculty: 'FIME', date: '', 
    displayDate: '', location: '', modality: 'Presencial', 
    price: '', image: 'https://placehold.co/600x400/004a8f/FFF?text=Evento', description: ''
  });
  isModalOpen.value = true;
};

const openEditModal = (event: UniversityEvent) => {
  isEditing.value = true;
  currentEditId.value = event.id;
  // Copiar datos al form
  Object.assign(formData, {
    title: event.title,
    category: event.category,
    faculty: event.faculty,
    date: event.date,
    displayDate: event.displayDate,
    location: event.location,
    modality: event.modality,
    price: event.price,
    image: event.image,
    description: event.description
  });
  isModalOpen.value = true;
};

const saveEvent = () => {
  // Validación básica
  if (!formData.title || !formData.date) return alert('Título y fecha requeridos');

  // Generar displayDate automático si está vacío (ej: "2025-11-20" -> "20 Nov")
  if (!formData.displayDate) {
    const d = new Date(formData.date);
    formData.displayDate = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  }

  if (isEditing.value && currentEditId.value) {
    // Editar
    eventStore.updateEvent({ id: currentEditId.value, ...formData });
  } else {
    // Crear
    eventStore.addEvent(formData);
  }
  isModalOpen.value = false;
};

const deleteEvent = (id: string) => {
  if (confirm('¿Estás seguro de eliminar este evento?')) {
    eventStore.deleteEvent(id);
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans">
    
    <!-- Navbar Admin -->
    <nav class="bg-uni-blue text-white shadow-md">
      <div class="container mx-auto px-4 h-16 flex justify-between items-center">
        <div class="font-bold text-lg flex items-center gap-2">
          <div class="w-6 h-6 bg-uni-gold rounded flex items-center justify-center text-uni-blue text-xs">A</div>
          Panel Administrativo
        </div>
        <div class="flex items-center gap-4">
  <!-- Muestra el nombre real del usuario logueado o 'Usuario' por defecto -->
  <span class="text-sm text-blue-200">
    {{ authStore.currentUser?.name || 'Usuario' }}
  </span>
  <button @click="handleLogout" class="...">
    Cerrar Sesión
  </button>
</div>
      </div>
    </nav>

    <!-- Contenido Principal -->
    <main class="container mx-auto px-4 py-8">
      
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Gestión de Eventos</h1>
        <button 
          @click="openCreateModal"
          class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow flex items-center gap-2"
        >
          <span>+</span> Nuevo Evento
        </button>
      </div>

      <!-- Tabla de Eventos -->
      <div class="bg-white rounded shadow overflow-hidden overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-100 text-gray-600 text-sm uppercase">
              <th class="p-4 border-b">Evento</th>
              <th class="p-4 border-b">Facultad</th>
              <th class="p-4 border-b">Fecha</th>
              <th class="p-4 border-b">Modalidad</th>
              <th class="p-4 border-b text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="event in eventStore.events" :key="event.id" class="hover:bg-gray-50 border-b last:border-0">
              <td class="p-4">
                <div class="font-bold text-gray-800">{{ event.title }}</div>
                <div class="text-xs text-gray-500">{{ event.category }} • {{ event.price }}</div>
              </td>
              <td class="p-4 text-sm text-gray-600">{{ event.faculty }}</td>
              <td class="p-4 text-sm text-gray-600">
                <div>{{ event.date }}</div>
                <div class="text-xs text-gray-400">Display: {{ event.displayDate }}</div>
              </td>
              <td class="p-4">
                <span :class="{
                  'bg-green-100 text-green-800': event.modality === 'Presencial',
                  'bg-purple-100 text-purple-800': event.modality === 'Virtual',
                  'bg-orange-100 text-orange-800': event.modality === 'Híbrido'
                }" class="text-xs px-2 py-1 rounded-full font-semibold">
                  {{ event.modality }}
                </span>
              </td>
              <td class="p-4 text-right space-x-2">
                <button @click="openEditModal(event)" class="text-blue-600 hover:text-blue-800 font-medium text-sm">Editar</button>
                <button @click="deleteEvent(event.id)" class="text-red-600 hover:text-red-800 font-medium text-sm">Eliminar</button>
              </td>
            </tr>
            <tr v-if="eventStore.events.length === 0">
              <td colspan="5" class="p-8 text-center text-gray-500">No hay eventos registrados.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- MODAL (Formulario) -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        <div class="bg-gray-50 px-6 py-4 border-b flex justify-between items-center sticky top-0">
          <h3 class="font-bold text-lg text-gray-800">{{ isEditing ? 'Editar Evento' : 'Nuevo Evento' }}</h3>
          <button @click="isModalOpen = false" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        <div class="p-6 space-y-4">
          <!-- Título -->
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Título del Evento</label>
            <input v-model="formData.title" type="text" class="w-full border rounded p-2 focus:ring-2 focus:ring-uni-blue outline-none">
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Facultad -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Facultad / Dependencia</label>
              <select v-model="formData.faculty" class="w-full border rounded p-2 bg-white">
                <option>FIME</option>
                <option>FACPYA</option>
                <option>Artes Musicales</option>
                <option>Dirección de Deportes</option>
                <option>Rectoría</option>
              </select>
            </div>
            <!-- Categoría -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Categoría</label>
              <select v-model="formData.category" class="w-full border rounded p-2 bg-white">
                <option>Académico</option>
                <option>Cultural</option>
                <option>Deportivo</option>
                <option>Científico</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
             <!-- Fecha -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Fecha (Ordenamiento)</label>
              <input v-model="formData.date" type="date" class="w-full border rounded p-2">
            </div>
             <!-- Fecha Texto -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Fecha Texto (ej. 20 Nov)</label>
              <input v-model="formData.displayDate" type="text" placeholder="Auto si se deja vacío" class="w-full border rounded p-2">
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Modalidad -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Modalidad</label>
              <select v-model="formData.modality" class="w-full border rounded p-2 bg-white">
                <option>Presencial</option>
                <option>Virtual</option>
                <option>Híbrido</option>
              </select>
            </div>
            <!-- Precio -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Precio</label>
              <input v-model="formData.price" type="text" placeholder="$0 MXN" class="w-full border rounded p-2">
            </div>
            <!-- Ubicación -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Ubicación</label>
              <input v-model="formData.location" type="text" class="w-full border rounded p-2">
            </div>
          </div>

          <!-- URL Imagen -->
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">URL de Imagen</label>
            <input v-model="formData.image" type="text" class="w-full border rounded p-2 text-sm text-gray-600">
            <p class="text-xs text-gray-400 mt-1">Usa https://placehold.co/600x400 para pruebas</p>
          </div>

          <!-- Descripción -->
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Descripción Corta</label>
            <textarea v-model="formData.description" rows="3" class="w-full border rounded p-2"></textarea>
          </div>

        </div>

        <div class="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3 sticky bottom-0">
          <button @click="isModalOpen = false" class="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded font-bold">Cancelar</button>
          <button @click="saveEvent" class="px-6 py-2 bg-uni-blue hover:bg-blue-800 text-white rounded font-bold shadow">
            Guardar
          </button>
        </div>

      </div>
    </div>

  </div>
</template>