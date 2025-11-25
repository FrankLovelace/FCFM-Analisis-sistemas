<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/AuthStore';
import { useEventStore } from '../stores/eventStore';
import type { UniversityEvent } from '../data/initialEvents';

// Importación de componentes hijos
import AdminApprovalsView from './admin/AdminApprovalsView.vue';
import AdminReportsView from './admin/AdminReportsView.vue';
import AdminEventList from '../components/AdminEventList.vue';
import AdminRegistryView from './admin/AdminRegistryView.vue';
import AdminDraftsView from './admin/AdminDraftsView.vue';

const router = useRouter();
const authStore = useAuthStore();
const eventStore = useEventStore();

// --- Estado de Navegación (Pestañas) ---
const currentTab = ref<'events' | 'approvals' | 'reports' | 'registry' | 'drafts'>('events');

// --- Estados del Modal y Formulario ---
const isModalOpen = ref(false);
const isEditing = ref(false);
const currentEditId = ref<string | null>(null);

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

onMounted(() => {
  eventStore.loadEvents();
});

// --- Acciones Generales ---
const handleLogout = () => {
  authStore.logout();
  // El router push ya lo hace el store, pero por seguridad:
  router.push('/login');
};

// --- Lógica del Modal (Crear/Editar) ---
const openCreateModal = () => {
  isEditing.value = false;
  currentEditId.value = null;
  // Resetear formulario con valores por defecto
  Object.assign(formData, {
    title: '', 
    category: 'Académico', 
    faculty: 'FIME', 
    date: '', 
    displayDate: '', 
    location: '', 
    modality: 'Presencial', 
    price: '', 
    image: 'https://placehold.co/600x400/004a8f/FFF?text=Evento', 
    description: ''
  });
  isModalOpen.value = true;
};

// Esta función es llamada cuando el componente hijo (AdminEventList) emite el evento 'edit'
const openEditModal = (event: UniversityEvent) => {
  isEditing.value = true;
  currentEditId.value = event.id;
  // Llenar formulario con datos del evento
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

  // Generar displayDate automático si el usuario lo dejó vacío
  if (!formData.displayDate) {
    const d = new Date(formData.date);
    // Ajuste de zona horaria simple para evitar desfases de día
    const userTimezoneOffset = d.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(d.getTime() + userTimezoneOffset);
    formData.displayDate = adjustedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  }

  if (isEditing.value && currentEditId.value) {
    // Actualizar
    eventStore.updateEvent({ id: currentEditId.value, ...formData });
  } else {
    // Crear nuevo
    eventStore.addEvent(formData);
  }
  isModalOpen.value = false;
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 font-sans flex flex-col md:flex-row">
    
    <!-- SIDEBAR -->
    <aside class="w-full md:w-64 bg-uni-blue text-white flex-shrink-0 flex flex-col md:h-screen md:sticky md:top-0">
      <div class="p-6 font-bold text-xl tracking-wide border-b border-blue-800 flex items-center gap-2">
         <span class="text-uni-gold">⚙️</span> SIASE Admin
      </div>
      
      <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
        <button 
            @click="currentTab = 'events'"
            class="w-full text-left px-4 py-3 rounded transition-colors flex items-center gap-3"
            :class="currentTab === 'events' ? 'bg-blue-800 text-white' : 'hover:bg-blue-700 text-blue-100'"
        >
            📅 Gestión Eventos
        </button>
        <button 
            @click="currentTab = 'approvals'"
            class="w-full text-left px-4 py-3 rounded transition-colors flex items-center gap-3 relative"
            :class="currentTab === 'approvals' ? 'bg-blue-800 text-white' : 'hover:bg-blue-700 text-blue-100'"
        >
            ✅ Aprobaciones
            <span v-if="eventStore.pendingEvents.length > 0" class="absolute right-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {{ eventStore.pendingEvents.length }}
            </span>
        </button>
        <button 
            @click="currentTab = 'reports'"
            class="w-full text-left px-4 py-3 rounded transition-colors flex items-center gap-3"
            :class="currentTab === 'reports' ? 'bg-blue-800 text-white' : 'hover:bg-blue-700 text-blue-100'"
        >
            📊 Reportes
        </button>
        <button 
    @click="currentTab = 'drafts'"
    class="w-full text-left px-4 py-3 rounded transition-colors flex items-center gap-3"
    :class="currentTab === 'drafts' ? 'bg-blue-800 text-white' : 'hover:bg-blue-700 text-blue-100'"
>
    📝 Mis Borradores
</button>
        <button 
    @click="currentTab = 'registry'"
    class="w-full text-left px-4 py-3 rounded transition-colors flex items-center gap-3"
    :class="currentTab === 'registry' ? 'bg-blue-800 text-white' : 'hover:bg-blue-700 text-blue-100'"
>
    📝 Registros
</button>
      </nav>

      <div class="p-4 border-t border-blue-800 mt-auto bg-uni-blue">
        <div class="text-xs text-blue-300 mb-2">Usuario: {{ authStore.currentUser?.name || 'Administrador' }}</div>
        <button @click="handleLogout" class="w-full bg-red-600 hover:bg-red-700 py-2 rounded text-sm font-bold transition-colors">
            Cerrar Sesión
        </button>
      </div>
    </aside>

    <!-- ÁREA PRINCIPAL DE CONTENIDO -->
    <main class="flex-1 p-8 overflow-y-auto h-screen bg-gray-50">
      
      <!-- VISTA 1: GESTIÓN DE EVENTOS -->
      <!-- Este componente maneja la tabla y el botón de crear -->
      <AdminEventList 
          v-if="currentTab === 'events'"
          @create="openCreateModal"
          @edit="openEditModal"
      />

      <!-- VISTA 2: APROBACIONES -->
      <AdminApprovalsView v-if="currentTab === 'approvals'" />

      <!-- VISTA 3: REPORTES -->
      <AdminReportsView v-if="currentTab === 'reports'" />
      <!-- VISTA 4: REGISTROS -->
      <!-- VISTA 5: BORRADORES -->
      <AdminRegistryView v-if="currentTab === 'registry'" />
<AdminDraftsView 
    v-if="currentTab === 'drafts'" 
    @create="openCreateModal"
    @edit="openEditModal"
/>
    </main>

    <!-- MODAL (Formulario flotante) -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all">
        
        <div class="bg-gray-50 px-6 py-4 border-b flex justify-between items-center sticky top-0 z-10">
          <h3 class="font-bold text-lg text-gray-800">{{ isEditing ? 'Editar Evento' : 'Nuevo Evento' }}</h3>
          <button @click="isModalOpen = false" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        <div class="p-6 space-y-4">
          <!-- Título -->
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Título del Evento</label>
            <input v-model="formData.title" type="text" class="w-full border rounded p-2 focus:ring-2 focus:ring-uni-blue outline-none transition">
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Facultad -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Facultad / Dependencia</label>
              <select v-model="formData.faculty" class="w-full border rounded p-2 bg-white focus:ring-2 focus:ring-uni-blue outline-none">
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
              <select v-model="formData.category" class="w-full border rounded p-2 bg-white focus:ring-2 focus:ring-uni-blue outline-none">
                <option>Académico</option>
                <option>Cultural</option>
                <option>Deportivo</option>
                <option>Científico</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
             <!-- Fechas -->
             <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Fecha (Ordenamiento)</label>
              <input v-model="formData.date" type="date" class="w-full border rounded p-2 focus:ring-2 focus:ring-uni-blue outline-none">
            </div>
             <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Fecha Texto (ej. 20 Nov)</label>
              <input v-model="formData.displayDate" type="text" placeholder="Auto si se deja vacío" class="w-full border rounded p-2 focus:ring-2 focus:ring-uni-blue outline-none">
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Detalles Extra -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Modalidad</label>
              <select v-model="formData.modality" class="w-full border rounded p-2 bg-white focus:ring-2 focus:ring-uni-blue outline-none">
                <option>Presencial</option>
                <option>Virtual</option>
                <option>Híbrido</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Precio</label>
              <input v-model="formData.price" type="text" placeholder="$0 MXN" class="w-full border rounded p-2 focus:ring-2 focus:ring-uni-blue outline-none">
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Ubicación</label>
              <input v-model="formData.location" type="text" class="w-full border rounded p-2 focus:ring-2 focus:ring-uni-blue outline-none">
            </div>
          </div>

          <!-- Imagen -->
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">URL de Imagen</label>
            <input v-model="formData.image" type="text" class="w-full border rounded p-2 text-sm text-gray-600 focus:ring-2 focus:ring-uni-blue outline-none">
            <p class="text-xs text-gray-400 mt-1">Usa https://placehold.co/600x400 para pruebas</p>
          </div>

          <!-- Descripción -->
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Descripción Corta</label>
            <textarea v-model="formData.description" rows="3" class="w-full border rounded p-2 focus:ring-2 focus:ring-uni-blue outline-none"></textarea>
          </div>

        </div>

        <!-- Footer del Modal -->
        <div class="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3 sticky bottom-0 z-10">
          <button @click="isModalOpen = false" class="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded font-bold transition-colors">Cancelar</button>
          <button @click="saveEvent" class="px-6 py-2 bg-uni-blue hover:bg-blue-800 text-white rounded font-bold shadow transition-colors">
            Guardar
          </button>
        </div>

      </div>
    </div>

  </div>
</template>