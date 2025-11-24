// src/stores/eventStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { UniversityEvent } from '../data/initialEvents';
import { initialEvents } from '../data/initialEvents';

// Extendemos la interfaz para incluir el estado y métricas simuladas
export interface AdminEvent extends UniversityEvent {
    status: 'published' | 'pending' | 'rejected';
    registrations: number; // Para estadísticas
    attendance: number;    // Para estadísticas
    rating: number;        // 1-10
}

export const useEventStore = defineStore('events', () => {
    // Convertimos los eventos iniciales al nuevo tipo
    const events = ref<AdminEvent[]>([]);

     const loadEvents = () => {
        const stored = localStorage.getItem('uni_events');
        if (stored) {
            const parsedEvents = JSON.parse(stored);
            
            // --- CORRECCIÓN DE DATOS VIEJOS ---
            // Mapeamos los eventos cargados para asegurar que tengan los campos nuevos
            events.value = parsedEvents.map((e: any) => ({
                ...e,
                // Si ya tiene status lo deja, si no, pone 'published'
                status: e.status || 'published', 
                // Si ya tiene registrations lo deja, si no, genera uno random o 0
                registrations: e.registrations !== undefined ? e.registrations : Math.floor(Math.random() * 50),
                attendance: e.attendance !== undefined ? e.attendance : Math.floor(Math.random() * 40),
                // Si no tiene rating, le ponemos 5.0
                rating: e.rating !== undefined ? e.rating : 5.0
            }));
            
            // Guardamos la versión corregida
            saveToLocal();

        } else {
            // Carga inicial (semilla)
            events.value = initialEvents.map((e, index) => ({
                ...e,
                status: index % 4 === 0 ? 'pending' : 'published',
                registrations: Math.floor(Math.random() * 200),
                attendance: Math.floor(Math.random() * 180),
                rating: (Math.random() * 5) + 5
            }));
            saveToLocal();
        }
    };

    const saveToLocal = () => {
        localStorage.setItem('uni_events', JSON.stringify(events.value));
    };

    const addEvent = (event: any) => {
        const newEvent = { 
            ...event, 
            id: crypto.randomUUID(),
            status: 'pending', // Por defecto entra a revisión (RF02)
            registrations: 0,
            attendance: 0,
            rating: 0
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

    // ... (deleteEvent y updateEvent se quedan igual o se ajustan si es necesario)
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