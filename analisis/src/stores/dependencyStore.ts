import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Dependency {
    id: string;
    name: string;
    acronym: string; // Siglas
    email: string;
    description: string;
    purpose: string; // Propósito o tipo de eventos
    type: 'Facultad' | 'Preparatoria' | 'Dependencia administrativa' | 'Centro o Instituto';
}

export const useDependencyStore = defineStore('dependencies', () => {
    const dependencies = ref<Dependency[]>([]);

    const loadDependencies = () => {
        const stored = localStorage.getItem('uni_dependencies');
        if (stored) {
            dependencies.value = JSON.parse(stored);
        } else {
            // Datos semilla iniciales
            dependencies.value = [
                { id: '1', name: 'Facultad de Ingeniería Mecánica y Eléctrica', acronym: 'FIME', email: 'contacto@fime.uanl.mx', description: 'Ingeniería', purpose: 'Académico', type: 'Facultad' },
                { id: '2', name: 'Facultad de Contaduría Pública y Administración', acronym: 'FACPYA', email: 'contacto@facpya.uanl.mx', description: 'Negocios', purpose: 'Académico', type: 'Facultad' },
                { id: '3', name: 'Dirección de Deportes', acronym: 'DIDE', email: 'deportes@uanl.mx', description: 'Deportes UANL', purpose: 'Deportivo', type: 'Dependencia administrativa' }
            ];
            saveToLocal();
        }
    };

    const saveToLocal = () => {
        localStorage.setItem('uni_dependencies', JSON.stringify(dependencies.value));
    };

    const addDependency = (dep: Omit<Dependency, 'id'>) => {
        const newDep = { ...dep, id: crypto.randomUUID() };
        dependencies.value.push(newDep);
        saveToLocal();
    };

    return { dependencies, loadDependencies, addDependency };
});