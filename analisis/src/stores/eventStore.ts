// src/stores/eventStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { UniversityEvent } from '../data/initialEvents';
import { initialEvents } from '../data/initialEvents';

// Extendemos la interfaz para incluir el estado, métricas y los NUEVOS campos
export interface AdminEvent extends UniversityEvent {
    status: 'published' | 'pending' | 'rejected';
    registrations: number; // Para estadísticas
    attendance: number;    // Para estadísticas
    rating: number;        // 1-10
    // --- NUEVOS CAMPOS ---
    capacity: number;      
    commentsList: { user: string; text: string; rating: number }[];
}

export const useEventStore = defineStore('events', () => {
    // Convertimos los eventos iniciales al nuevo tipo
    const events = ref<AdminEvent[]>([]);

     const loadEvents = () => {
        const stored = localStorage.getItem('uni_events');
        
        // Función helper para generar comentarios falsos (Integrada del código A)
        const generateFakeComments = () => [
            { user: 'Juan Pérez', text: 'Excelente organización, muy puntual.', rating: 10 },
            { user: 'Maria L.', text: 'El audio falló un poco al final.', rating: 8 },
            { user: 'Pedro S.', text: 'Muy interesante el tema expuesto.', rating: 9 }
        ];

        if (stored) {
            const parsedEvents = JSON.parse(stored);
            
            // --- CORRECCIÓN DE DATOS VIEJOS + INTEGRACIÓN NUEVOS ---
            // Mapeamos los eventos cargados para asegurar que tengan todos los campos
            events.value = parsedEvents.map((e: any) => ({
                ...e,
                // Lógica existente (Código B)
                status: e.status || 'published', 
                registrations: e.registrations !== undefined ? e.registrations : Math.floor(Math.random() * 50),
                attendance: e.attendance !== undefined ? e.attendance : Math.floor(Math.random() * 40),
                rating: e.rating !== undefined ? e.rating : 9.5,
                
                // --- NUEVOS CAMPOS (Código A) ---
                capacity: e.capacity || 100,
                commentsList: e.commentsList || generateFakeComments()
            }));
            
            saveToLocal();

        } else {
            // Carga inicial (semilla)
            events.value = initialEvents.map((e, index) => ({
                ...e,
                // Lógica existente (Código B)
                status: index % 4 === 0 ? 'pending' : 'published',
                registrations: Math.floor(Math.random() * 80),
                attendance: Math.floor(Math.random() * 60),
                rating: 9.0, // Promedio base

                // --- NUEVOS CAMPOS (Código A) ---
                capacity: 100, // Cupo default
                commentsList: generateFakeComments()
            }));
            saveToLocal();
        }
    };

    const saveToLocal = () => {
        localStorage.setItem('uni_events', JSON.stringify(events.value));
    };

    const addEvent = (event: any) => {
        const newEvent: AdminEvent = { 
            ...event, 
            id: crypto.randomUUID(),
            status: 'pending', // Por defecto entra a revisión (RF02)
            registrations: 0,
            attendance: 0,
            rating: 0,
            // Inicializar nuevos campos para eventos nuevos creados manualmente
            capacity: event.capacity ? Number(event.capacity) : 100,
            commentsList: [] // Evento nuevo nace sin comentarios
        };
        events.value.push(newEvent);
        saveToLocal();
    };

    // Acciones de Aprobación (RF02)
    const approveEvent = (id: string) => {
        const event = events.value.find(e => e.id === id);
        if (event) {
            event.status = 'published';
            saveToLocal();
        }
    };

    const rejectEvent = (id: string) => {
        const event = events.value.find(e => e.id === id);
        if (event) {
            event.status = 'rejected';
            saveToLocal();
        }
    };

    // Getters para Reportes (RF12)
    const stats = computed(() => {
        const total = events.value.length;
        const active = events.value.filter(e => e.status === 'published').length;
        const totalRegistrations = events.value.reduce((acc, e) => acc + e.registrations, 0);
        
        // Top 3 eventos por asistencia
        const topEvents = [...events.value]
            .sort((a, b) => b.registrations - a.registrations)
            .slice(0, 3);

        // Distribución por Tipo (Académico, Cultural, etc)
        const typeDist: Record<string, number> = {};
        events.value.forEach(e => {
            typeDist[e.category] = (typeDist[e.category] || 0) + 1;
        });

        // Distribución por Modalidad
        const modalityDist: Record<string, number> = {};
        events.value.forEach(e => {
            modalityDist[e.modality] = (modalityDist[e.modality] || 0) + 1;
        });

        return { total, active, totalRegistrations, topEvents, typeDist, modalityDist };
    });

    const pendingEvents = computed(() => events.value.filter(e => e.status === 'pending'));

    const deleteEvent = (id: string) => {
        events.value = events.value.filter(e => e.id !== id);
        saveToLocal();
    };

    const updateEvent = (updatedEvent: any) => {
         const index = events.value.findIndex(e => e.id === updatedEvent.id);
         if (index !== -1) {
             events.value[index] = { ...events.value[index], ...updatedEvent };
             saveToLocal();
         }
    };

    return { events, loadEvents, addEvent, approveEvent, rejectEvent, deleteEvent, updateEvent, stats, pendingEvents };
});