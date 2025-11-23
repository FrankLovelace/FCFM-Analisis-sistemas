// src/stores/eventStore.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { UniversityEvent } from '../data/initialEvents';
import { initialEvents } from '../data/initialEvents';

export const useEventStore = defineStore('events', () => {
    const events = ref<UniversityEvent[]>([]);

    // Cargar datos al iniciar
    const loadEvents = () => {
        const stored = localStorage.getItem('uni_events');
        if (stored) {
            events.value = JSON.parse(stored);
        } else {
            events.value = initialEvents;
            saveToLocal();
        }
    };

    const saveToLocal = () => {
        localStorage.setItem('uni_events', JSON.stringify(events.value));
    };

    // CRUD Actions
    const addEvent = (event: Omit<UniversityEvent, 'id'>) => {
        const newEvent = { ...event, id: crypto.randomUUID() };
        events.value.push(newEvent);
        saveToLocal();
    };

    const deleteEvent = (id: string) => {
        events.value = events.value.filter(e => e.id !== id);
        saveToLocal();
    };

    const updateEvent = (updatedEvent: UniversityEvent) => {
        const index = events.value.findIndex(e => e.id === updatedEvent.id);
        if (index !== -1) {
            events.value[index] = updatedEvent;
            saveToLocal();
        }
    };

    return { events, loadEvents, addEvent, deleteEvent, updateEvent };
});