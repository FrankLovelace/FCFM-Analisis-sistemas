<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useEventStore } from '../stores/eventStore';
import { useAuthStore } from '../stores/AuthStore';
import LoadingScreen from '../components/loadingScreen.vue';

const router = useRouter();
const eventStore = useEventStore();
const authStore = useAuthStore();

// --- Estados de UI ---
const isLoading = ref(true);
const showUserMenu = ref(false);
const showNotifications = ref(false); // Nuevo estado para notificaciones

onMounted(() => {
  authStore.initAuth();
  eventStore.loadEvents();
  setTimeout(() => { isLoading.value = false; }, 1000);
});

// --- Lógica de Filtros ---
const filters = ref({
  search: '', category: '', faculty: '', modality: '', price: '', date: ''
});
const appliedFilters = ref({ ...filters.value });

const applyFilters = () => {
  isLoading.value = true;
  setTimeout(() => {
    appliedFilters.value = { ...filters.value };
    isLoading.value = false;
  }, 300);
};

const resetFilters = () => {
  filters.value = { search: '', category: '', faculty: '', modality: '', price: '', date: '' };
  applyFilters();
};

// --- Lógica de Fechas (Simulación para la DEMO) ---
const todayDate = '2025-10-01'; // Fecha base para filtrar Próximos vs Pasados

// 1. Eventos PRÓXIMOS (Filtrados)
const filteredUpcomingEvents = computed(() => {
  return eventStore.events.filter(event => {
    // Regla base: Solo eventos futuros respecto a la fecha simulada
    if (event.date < todayDate) return false;

    // Filtros
    const matchSearch = event.title.toLowerCase().includes(appliedFilters.value.search.toLowerCase());
    const matchCategory = appliedFilters.value.category ? event.category === appliedFilters.value.category : true;
    const matchFaculty = appliedFilters.value.faculty ? event.faculty === appliedFilters.value.faculty : true;
    const matchModality = appliedFilters.value.modality ? event.modality === appliedFilters.value.modality : true;
    const matchDate = appliedFilters.value.date ? event.date === appliedFilters.value.date : true;
    
    let matchPrice = true;
    if (appliedFilters.value.price === 'Gratis') matchPrice = event.price.toLowerCase().includes('gratis') || event.price === '0';
    if (appliedFilters.value.price === 'Pago') matchPrice = !event.price.toLowerCase().includes('gratis') && event.price !== '0';

    return matchSearch && matchCategory && matchFaculty && matchModality && matchPrice && matchDate;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
});

// 2. Eventos PASADOS (Histórico)
const pastEvents = computed(() => {
  return eventStore.events
    .filter(event => event.date < todayDate)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
});

// --- LÓGICA DE NOTIFICACIONES (Requerimiento 6) ---
const notifications = computed(() => {
    if (!authStore.currentUser?.registeredEventIds) return [];

    // Simulamos que "Hoy" es un día antes del evento de Power BI (que es el 20 nov)
    const simulationToday = new Date('2025-11-19'); 

    const userEvents = eventStore.events.filter(e => 
        authStore.currentUser?.registeredEventIds?.includes(e.id)
    );

    const msPerDay = 1000 * 60 * 60 * 24;
    const alerts: string[] = [];

    userEvents.forEach(event => {
        const eventDate = new Date(event.date);
        const diffTime = eventDate.getTime() - simulationToday.getTime();
        const diffDays = Math.ceil(diffTime / msPerDay);

        if (diffDays === 1) {
            alerts.push(`Falta un día para el inicio del evento "${event.title}".`);
        } else if (diffDays === 0) {
            alerts.push(`¡El evento "${event.title}" es hoy!`);
        } else if (diffDays > 1 && diffDays <= 3) {
            alerts.push(`El evento "${event.title}" es en ${diffDays} días.`);
        }
    });

    return alerts;
});

// Acciones
const goToLogin = () => router.push('/login');
const goToDetail = (id: string) => router.push(`/event/${id}`);

const handleLogout = () => {
    showUserMenu.value = false;
    authStore.logout();
};
</script>

<template>
  <LoadingScreen v-if="isLoading" />

  <div v-else class="min-h-screen bg-gray-50 font-sans text-slate-800">
    
    <header class="bg-white shadow-sm relative z-20">
      <div class="h-1 bg-uni-gold w-full"></div>
      
      <div class="container mx-auto px-4">
        <div class="h-20 flex items-center justify-between">
          
          <div class="flex items-center gap-3 cursor-pointer" @click="resetFilters">
            <div class="w-10 h-10 border-2 border-uni-blue rounded-full flex items-center justify-center p-0.5">
               <div class="w-full h-full bg-uni-blue rounded-full text-white flex items-center justify-center text-xs font-serif font-bold">U</div>
            </div>
            <div class="flex flex-col leading-none">
              <span class="font-bold text-uni-blue text-xl tracking-tighter">UANL</span>
              <span class="text-[10px] text-gray-500 uppercase tracking-widest">Universidad Autónoma</span>
            </div>
          </div>
          
          <nav class="hidden md:flex gap-8 h-full items-end pb-5 text-sm font-bold text-gray-500">
            <router-link 
                to="/" 
                active-class="text-uni-blue border-b-4 border-uni-blue"
                class="hover:text-uni-blue hover:border-b-4 hover:border-uni-blue pb-1 transition-all"
            >
                Eventos
            </router-link>

            <router-link 
                to="/my-events" 
                active-class="text-uni-blue border-b-4 border-uni-blue"
                class="hover:text-uni-blue hover:border-b-4 hover:border-uni-blue pb-1 transition-all"
            >
                Mis Eventos
            </router-link>
            
            <a href="https://www.uanl.mx/" target="_blank" class="hover:text-uni-blue pb-1 transition-all">Vida Estudiantil</a>
          </nav>

          <div class="flex items-center gap-4">
            
            <div v-if="authStore.isAuthenticated" class="relative">
                <button 
                    @click="showNotifications = !showNotifications; showUserMenu = false"
                    class="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-uni-blue transition relative focus:outline-none"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    
                    <span v-if="notifications.length > 0" class="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div v-if="showNotifications" class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50 animate-fade-in-down origin-top-right overflow-hidden">
                    <div class="bg-gray-50 px-4 py-2 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                        Notificaciones
                    </div>
                    
                    <div class="max-h-64 overflow-y-auto">
                        <ul v-if="notifications.length > 0" class="divide-y divide-gray-100">
                            <li v-for="(note, index) in notifications" :key="index" class="px-4 py-3 hover:bg-blue-50 transition-colors flex gap-3">
                                <div class="mt-1 text-uni-gold">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" /></svg>
                                </div>
                                <p class="text-sm text-gray-700">{{ note }}</p>
                            </li>
                        </ul>
                        <div v-else class="px-4 py-6 text-center text-gray-400 text-sm">
                            No tienes notificaciones nuevas.
                        </div>
                    </div>
                </div>
            </div>

            <div class="relative">
                <button 
                  v-if="!authStore.isAuthenticated"
                  @click="goToLogin"
                  class="bg-gradient-to-r from-uni-gold to-uni-gold-dark text-white text-sm font-bold py-2 px-6 rounded shadow hover:shadow-md transition-all transform hover:-translate-y-0.5"
                >
                  Iniciar Sesión
                </button>

                <div v-else class="relative">
                  <button 
                    @click="showUserMenu = !showUserMenu; showNotifications = false"
                    class="flex items-center gap-2 text-uni-blue font-bold text-sm border border-gray-200 bg-gray-50 hover:bg-white py-2 px-4 rounded-full shadow-sm transition-colors"
                  >
                    <div class="w-6 h-6 bg-uni-blue text-white rounded-full flex items-center justify-center text-xs">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" /></svg>
                    </div>
                    <span class="max-w-[100px] md:max-w-[150px] truncate">{{ authStore.currentUser?.email }}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 text-gray-400"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" /></svg>
                  </button>

                  <div v-if="showUserMenu" class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 animate-fade-in-down origin-top-right">
                    <div class="px-4 py-3 border-b border-gray-100 text-xs text-gray-500">
                      Rol actual: <br>
                      <span class="font-bold text-uni-blue uppercase text-xs">{{ authStore.currentUser?.role === 'admin' ? 'Administrativo' : 'Estudiante' }}</span>
                    </div>

                    <router-link v-if="authStore.currentUser?.role === 'admin'" to="/admin" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-uni-blue">
                        Panel Administrativo
                    </router-link>
                    
                    <button @click="handleLogout" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-semibold flex items-center gap-2">
                        Cerrar Sesión
                    </button>
                  </div>
                </div>
            </div>

          </div>
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 py-8">
      
      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
        <div class="flex gap-3 mb-5">
          <div class="relative flex-1 group">
            <span class="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-uni-blue">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <input v-model="filters.search" @keyup.enter="applyFilters" type="text" placeholder="Buscar por nombre del evento..." class="w-full pl-11 pr-4 py-3 border border-gray-200 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-uni-blue focus:ring-1 focus:ring-uni-blue transition-all">
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div class="flex flex-col gap-1"><label class="text-xs font-bold text-gray-500 uppercase">Categoría</label><select v-model="filters.category" class="w-full border border-gray-200 rounded p-2.5 text-sm text-gray-700 outline-none"><option value="">Todas</option><option>Académico</option><option>Cultural</option><option>Deportivo</option><option>Científico</option></select></div>
          <div class="flex flex-col gap-1"><label class="text-xs font-bold text-gray-500 uppercase">Dependencia</label><select v-model="filters.faculty" class="w-full border border-gray-200 rounded p-2.5 text-sm text-gray-700 outline-none"><option value="">Todas</option><option>FIME</option><option>FACPYA</option><option>Artes Musicales</option><option>Dirección de Deportes</option></select></div>
          <div class="flex flex-col gap-1"><label class="text-xs font-bold text-gray-500 uppercase">Fecha</label><input type="date" v-model="filters.date" class="w-full border border-gray-200 rounded p-2.5 text-sm text-gray-700 outline-none"></div>
          <div class="flex flex-col gap-1"><label class="text-xs font-bold text-gray-500 uppercase">Precio</label><select v-model="filters.price" class="w-full border border-gray-200 rounded p-2.5 text-sm text-gray-700 outline-none"><option value="">Cualquiera</option><option>Gratis</option><option>Pago</option></select></div>
          <div class="flex gap-2">
             <div class="flex-1 flex flex-col gap-1"><label class="text-xs font-bold text-gray-500 uppercase">Modalidad</label><select v-model="filters.modality" class="w-full border border-gray-200 rounded p-2.5 text-sm text-gray-700 outline-none"><option value="">Todas</option><option>Presencial</option><option>Virtual</option><option>Híbrido</option></select></div>
             <button @click="applyFilters" class="bg-uni-blue hover:bg-blue-900 text-white font-bold py-2.5 px-4 rounded shadow-sm h-[42px] mt-auto"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div class="lg:col-span-8">
          <h2 class="text-2xl font-bold text-uni-blue mb-6 border-l-4 border-uni-gold pl-3">Próximos Eventos</h2>
          <div class="space-y-6">
            <div v-for="event in filteredUpcomingEvents" :key="event.id" class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col md:flex-row group">
              <div class="w-full md:w-56 h-48 md:h-auto bg-gray-200 relative overflow-hidden flex-shrink-0">
                <img :src="event.image" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Evento">
                <div class="absolute top-2 left-2 bg-uni-gold text-white text-xs font-bold px-2 py-1 rounded shadow">{{ event.modality }}</div>
              </div>
              <div class="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div class="flex justify-between items-start mb-2">
                    <span class="text-[10px] font-bold tracking-wider text-uni-secondary uppercase bg-pink-50 px-2 py-0.5 rounded">{{ event.category }}</span>
                    <span class="text-xs text-gray-500 flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" /></svg>{{ event.displayDate }}</span>
                  </div>
                  <h3 class="text-lg font-bold text-gray-800 leading-tight mb-2 group-hover:text-uni-blue transition-colors">{{ event.title }}</h3>
                  <p class="text-sm text-gray-600 line-clamp-2 mb-3">{{ event.description }}</p>
                  <p class="text-xs text-gray-500 font-semibold">📍 {{ event.location }} • {{ event.faculty }}</p>
                </div>
                <div class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span class="text-uni-blue font-bold text-lg">{{ event.price }}</span>
                  <button @click="goToDetail(event.id)" class="bg-gray-100 hover:bg-uni-blue hover:text-white text-gray-700 text-xs font-bold py-2 px-4 rounded transition-colors">Ver Detalles</button>
                </div>
              </div>
            </div>
            <div v-if="filteredUpcomingEvents.length === 0" class="text-center py-12 bg-white rounded border border-dashed border-gray-300">
              <div class="text-4xl mb-2">📅</div>
              <h3 class="text-gray-600 font-bold">No se encontraron eventos</h3>
              <p class="text-gray-400 text-sm">Intenta ajustar los filtros de búsqueda.</p>
              <button @click="resetFilters" class="mt-4 text-uni-blue font-bold text-sm hover:underline">Limpiar Filtros</button>
            </div>
          </div>
        </div>

        <div class="lg:col-span-4 space-y-8">
          <div>
            <h2 class="text-lg font-bold text-gray-800 mb-4 border-b pb-2 flex justify-between items-center">Eventos Finalizados <span class="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Histórico</span></h2>
            <div class="space-y-4">
              <div v-for="event in pastEvents" :key="event.id" class="bg-white p-3 rounded shadow-sm border border-gray-200 flex gap-3 opacity-75 hover:opacity-100 transition-opacity">
                <div class="w-16 h-16 bg-gray-300 rounded overflow-hidden flex-shrink-0 cursor-pointer" @click="goToDetail(event.id)">
                    <img :src="event.image" class="w-full h-full object-cover grayscale" alt="Pasado">
                </div>
                <div class="flex-1">
                  <h4 @click="goToDetail(event.id)" class="text-xs font-bold text-gray-700 leading-tight mb-1 line-clamp-2 cursor-pointer hover:text-uni-blue">{{ event.title }}</h4>
                  <div class="text-[10px] text-gray-500 mb-1">Finalizó: {{ event.displayDate }}</div>
                  <span class="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{{ event.category }}</span>
                </div>
              </div>
              <div v-if="pastEvents.length === 0" class="text-sm text-gray-400 italic">No hay eventos pasados recientes.</div>
            </div>
          </div>
        </div>
      </div>
    </main>
    
    <footer class="bg-gray-800 text-gray-400 py-6 text-center text-xs mt-12"><p>Universidad Autónoma de Nuevo León | Demo de Eventos Vue 3</p></footer>
  </div>
</template>