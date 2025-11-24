// src/stores/authStore.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import SHA256 from 'crypto-js/sha256';
// Nota: Quitamos 'type User' del import para usar la definición local actualizada
import { usersDB } from '../data/users'; 

// 1. ACTUALIZA LA INTERFAZ USER (Agrega los campos opcionales nuevos)
export interface User {
    email: string;
    storedHash: string;
    name: string;
    role: 'admin' | 'student';
    registeredEventIds?: string[];
    // Nuevos campos para Responsables:
    paternalName?: string;
    maternalName?: string;
    assignedDependency?: string; 
}

export const useAuthStore = defineStore('auth', () => {
    const isAuthenticated = ref(false);
    const currentUser = ref<User | null>(null);
    const users = ref<User[]>([]); // Array local de usuarios
    const router = useRouter();

    // --- CARGA DE DATOS (Vital) ---
    const loadUsers = () => {
        const storedUsers = localStorage.getItem('uni_users_db');
        
        if (storedUsers) {
            try {
                users.value = JSON.parse(storedUsers);
            } catch (e) {
                console.error("Error leyendo DB local, reiniciando...", e);
                users.value = [...usersDB]; // Cast as User[] si es necesario
                saveUsers();
            }
        } else {
            // Si está vacío, cargamos el admin por defecto
            users.value = [...usersDB];
            saveUsers();
        }
    };

    const saveUsers = () => {
        localStorage.setItem('uni_users_db', JSON.stringify(users.value));
    };

    // --- INICIALIZACIÓN AL RECARGAR F5 ---
    const initAuth = () => {
        loadUsers(); // SIEMPRE cargar usuarios primero

        const session = localStorage.getItem('uni_session');
        const userStr = localStorage.getItem('uni_user');
        
        if (session === 'valid' && userStr) {
            try {
                const tempUser = JSON.parse(userStr);
                // Buscamos la versión más fresca del usuario en el array
                const freshUser = users.value.find(u => u.email === tempUser.email);
                
                if (freshUser) {
                    isAuthenticated.value = true;
                    currentUser.value = freshUser;
                } else {
                    logout(); // Si el usuario guardado no existe en la DB, salir
                }
            } catch (e) {
                logout();
            }
        }
    };

    // --- LOGIN ---
    const login = (email: string, password: string): boolean => {
        loadUsers(); // Asegurar que tenemos la lista actualizada

        const userFound = users.value.find(u => u.email === email);
        
        if (!userFound) {
            console.log("Usuario no encontrado en la lista");
            return false;
        }

        // Generar hash: Pass + Email
        const attemptHash = SHA256(password + email).toString();

        if (attemptHash === userFound.storedHash) {
            isAuthenticated.value = true;
            currentUser.value = userFound;
            
            localStorage.setItem('uni_session', 'valid');
            localStorage.setItem('uni_user', JSON.stringify(userFound));
            return true;
        }
        
        console.log("Hash incorrecto");
        return false;
    };

    // --- REGISTRO ALUMNO (Estándar) ---
    const registerUser = (email: string, password: string) => {
        loadUsers(); // Asegurar carga

        // Validar duplicados
        if (users.value.some(u => u.email === email)) {
            console.log("Correo ya registrado");
            return false;
        }

        try {
            const newUser: User = {
                email,
                storedHash: SHA256(password + email).toString(),
                name: 'Nuevo Alumno', 
                role: 'student',
                registeredEventIds: []
            };

            users.value.push(newUser);
            saveUsers(); // Guardar en localStorage
            
            console.log("Usuario registrado y guardado:", newUser);
            return true;
        } catch (error) {
            console.error("Error al guardar usuario:", error);
            return false;
        }
    };

    // 2. NUEVA FUNCIÓN PARA REGISTRAR RESPONSABLES (ADMINS)
    const registerResponsible = (userData: any) => {
        loadUsers(); // Asegurar carga

        if (users.value.some(u => u.email === userData.email)) {
            alert("El correo ya está registrado.");
            return false;
        }

        const newUser: User = {
            email: userData.email,
            // Generamos el hash con la contraseña asignada
            storedHash: SHA256(userData.password + userData.email).toString(),
            name: userData.name, // Nombre completo (Nombre + Apellidos)
            paternalName: userData.paternalName,
            maternalName: userData.maternalName,
            assignedDependency: userData.dependency, // Mapeo correcto del form al store
            role: 'admin', // Los responsables son admins
            registeredEventIds: []
        };

        users.value.push(newUser);
        saveUsers();
        return true;
    };

    // --- REGISTRAR EVENTO (LINKING) ---
    const registerUserEvent = (eventId: string) => {
        if (!currentUser.value) return;
        loadUsers(); 

        // Buscar usuario en el array principal
        const index = users.value.findIndex(u => u.email === currentUser.value?.email);
        
        if (index !== -1) {
            const user = users.value[index];
            if (!user) return;
            
            // Inicializar array si hace falta
            if (!user.registeredEventIds) user.registeredEventIds = [];

            // Evitar duplicados
            if (!user.registeredEventIds.includes(eventId)) {
                user.registeredEventIds.push(eventId);
                
                // Guardar cambios
                users.value[index] = user;
                currentUser.value = user; // Actualizar estado actual
                
                saveUsers(); // Persistir DB
                localStorage.setItem('uni_user', JSON.stringify(user)); // Persistir sesión
            }
        }
    };

    const logout = () => {
        isAuthenticated.value = false;
        currentUser.value = null;
        localStorage.removeItem('uni_session');
        localStorage.removeItem('uni_user');
        router.push('/login');
    };

    return { 
        isAuthenticated, 
        currentUser, 
        users,
        login, 
        logout, 
        initAuth, 
        registerUser,
        registerResponsible, // <--- Exportamos la nueva función
        emailExists: (email: string) => {
            loadUsers();
            return users.value.some(u => u.email === email);
        },
        registerUserEvent 
    };
});