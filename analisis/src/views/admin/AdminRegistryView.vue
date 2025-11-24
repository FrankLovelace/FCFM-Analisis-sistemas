<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useDependencyStore } from '../../stores/dependencyStore';
import { useAuthStore } from '../../stores/AuthStore';

const dependencyStore = useDependencyStore();
const authStore = useAuthStore();

const activeTab = ref<'dependency' | 'responsible'>('dependency');

onMounted(() => {
    dependencyStore.loadDependencies();
    authStore.initAuth();
});

// --- FORMULARIO DEPENDENCIAS ---
const depForm = reactive({
    name: '', acronym: '', email: '', description: '', purpose: '', 
    type: 'Facultad' as const
});

const submitDependency = () => {
    if(!depForm.name || !depForm.acronym || !depForm.email) return alert("Campos obligatorios faltantes");
    
    dependencyStore.addDependency({ ...depForm });
    alert("Dependencia registrada exitosamente");
    // Reset
    Object.assign(depForm, { name: '', acronym: '', email: '', description: '', purpose: '', type: 'Facultad' });
};

// --- FORMULARIO RESPONSABLES ---
const respForm = reactive({
    name: '', paternal: '', maternal: '', email: '', password: '', dependency: ''
});

const submitResponsible = () => {
    if(!respForm.name || !respForm.email || !respForm.password || !respForm.dependency) return alert("Llene todos los campos");
    
    const fullName = `${respForm.name} ${respForm.paternal} ${respForm.maternal}`;
    
    const success = (authStore as any).registerResponsible({
        email: respForm.email,
        password: respForm.password,
        name: fullName,
        paternalName: respForm.paternal,
        maternalName: respForm.maternal,
        dependency: respForm.dependency
    });

    if(success) {
        alert(`Responsable ${fullName} registrado.`);
        // Reset
        Object.assign(respForm, { name: '', paternal: '', maternal: '', email: '', password: '', dependency: '' });
    }
};
</script>

<template>
    <div class="bg-white p-6 rounded shadow h-full">
        <h2 class="text-2xl font-bold text-uni-blue mb-6 border-b pb-2">Registro de Entidades</h2>

        <!-- Tabs Internos -->
        <div class="flex gap-4 mb-6 border-b border-gray-200">
            <button 
                @click="activeTab = 'dependency'"
                class="pb-2 px-4 font-bold transition-colors border-b-4"
                :class="activeTab === 'dependency' ? 'border-uni-blue text-uni-blue' : 'border-transparent text-gray-500 hover:text-gray-700'"
            >
                🏢 Nueva Dependencia
            </button>
            <button 
                @click="activeTab = 'responsible'"
                class="pb-2 px-4 font-bold transition-colors border-b-4"
                :class="activeTab === 'responsible' ? 'border-uni-blue text-uni-blue' : 'border-transparent text-gray-500 hover:text-gray-700'"
            >
                👤 Nuevo Responsable
            </button>
        </div>

        <!-- FORMULARIO 1: DEPENDENCIAS -->
        <div v-if="activeTab === 'dependency'" class="max-w-2xl animate-fade-in">
            <p class="text-sm text-gray-500 mb-4">Registre una nueva entidad universitaria para organizar eventos.</p>
            
            <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-1">Nombre Dependencia</label>
                        <input v-model="depForm.name" type="text" class="w-full border rounded p-2 focus:ring-2 focus:ring-uni-blue outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-1">Siglas Oficiales</label>
                        <input v-model="depForm.acronym" type="text" class="w-full border rounded p-2 focus:ring-2 focus:ring-uni-blue outline-none">
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-1">Correo Institucional</label>
                        <input v-model="depForm.email" type="email" class="w-full border rounded p-2 focus:ring-2 focus:ring-uni-blue outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-1">Tipo de Dependencia</label>
                        <select v-model="depForm.type" class="w-full border rounded p-2 bg-white">
                            <option>Facultad</option>
                            <option>Preparatoria</option>
                            <option>Dependencia administrativa</option>
                            <option>Centro o Instituto</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">Propósito / Tipo de Eventos</label>
                    <input v-model="depForm.purpose" type="text" placeholder="Ej. Académicos y Culturales" class="w-full border rounded p-2 focus:ring-2 focus:ring-uni-blue outline-none">
                </div>

                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">Descripción Breve</label>
                    <textarea v-model="depForm.description" rows="3" class="w-full border rounded p-2 focus:ring-2 focus:ring-uni-blue outline-none"></textarea>
                </div>

                <div class="flex justify-end pt-4">
                    <button @click="submitDependency" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded shadow">
                        Registrar Dependencia
                    </button>
                </div>
            </div>
        </div>

        <!-- FORMULARIO 2: RESPONSABLES -->
        <div v-else class="max-w-2xl animate-fade-in">
            <p class="text-sm text-gray-500 mb-4">Asigne un nuevo administrador (Responsable) a una dependencia existente.</p>

            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">Nombre(s)</label>
                    <input v-model="respForm.name" type="text" class="w-full border rounded p-2 focus:ring-2 focus:ring-uni-blue outline-none">
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-1">Apellido Paterno</label>
                        <input v-model="respForm.paternal" type="text" class="w-full border rounded p-2 focus:ring-2 focus:ring-uni-blue outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-1">Apellido Materno</label>
                        <input v-model="respForm.maternal" type="text" class="w-full border rounded p-2 focus:ring-2 focus:ring-uni-blue outline-none">
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-1">Correo Institucional (@uanl.edu.mx)</label>
                        <input v-model="respForm.email" type="email" class="w-full border rounded p-2 focus:ring-2 focus:ring-uni-blue outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-1">Contraseña Asignada</label>
                        <input v-model="respForm.password" type="text" class="w-full border rounded p-2 focus:ring-2 focus:ring-uni-blue outline-none">
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">Dependencia Asignada</label>
                    <select v-model="respForm.dependency" class="w-full border rounded p-2 bg-white">
                        <option value="" disabled selected>Seleccione una dependencia</option>
                        <!-- SE LLENA DINÁMICAMENTE DEL STORE DE DEPENDENCIAS -->
                        <option v-for="dep in dependencyStore.dependencies" :key="dep.id" :value="dep.acronym">
                            {{ dep.name }} ({{ dep.acronym }})
                        </option>
                    </select>
                </div>

                <div class="flex justify-end pt-4">
                    <button @click="submitResponsible" class="bg-uni-blue hover:bg-blue-800 text-white font-bold py-2 px-6 rounded shadow">
                        Registrar Responsable
                    </button>
                </div>
            </div>
        </div>

    </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>