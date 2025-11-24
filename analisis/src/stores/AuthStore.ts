// src/stores/authStore.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import SHA256 from 'crypto-js/sha256';
import { usersDB, type User } from '../data/users';

export const useAuthStore = defineStore('auth', () => {
    const isAuthenticated = ref(false);
    const currentUser = ref<User | null>(null);
    const users = ref<User[]>([]); // Estado reactivo de usuarios
    const router = useRouter();

    // Cargar usuarios (Combina JSON estático + LocalStorage)
    const loadUsers = () => {
        const storedUsers = localStorage.getItem('uni_users_db');
        if (storedUsers) {
            users.value = JSON.parse(storedUsers);
        } else {
            // Carga inicial desde el archivo estático
            users.value = [...usersDB];
            saveUsers();
        }
    };

    const saveUsers = () => {
        localStorage.setItem('uni_users_db', JSON.stringify(users.value));
    };

    // Validar sesión existente
    const initAuth = () => {
        loadUsers(); // Aseguramos tener la DB cargada
        const session = localStorage.getItem('uni_session');
        const user = localStorage.getItem('uni_user');
        if (session === 'valid' && user) {
            isAuthenticated.value = true;
            currentUser.value = JSON.parse(user);
        }
    };

    // LOGIN: Ahora busca en el estado 'users' dinámico
    const login = (email: string, password: string): boolean => {
        const userFound = users.value.find(u => u.email === email);
        if (!userFound) return false;

        const attemptHash = SHA256(password + email).toString(); // Salt = email

        if (attemptHash === userFound.storedHash) {
            isAuthenticated.value = true;
            currentUser.value = userFound;
            localStorage.setItem('uni_session', 'valid');
            localStorage.setItem('uni_user', JSON.stringify(userFound));
            return true;
        }
        return false;
    };

    // REGISTRO: Nuevo método
    const registerUser = (email: string, password: string) => {
        // 1. Verificar duplicados
        if (users.value.some(u => u.email === email)) return false;

        // 2. Crear usuario con Hash
        const newUser: User = {
            email,
            storedHash: SHA256(password + email).toString(),
            name: 'Nuevo Alumno', // Nombre por defecto
            role: 'student'       // Por defecto alumnos
        };

        // 3. Guardar
        users.value.push(newUser);
        saveUsers();
        return true;
    };

    const logout = () => {
        isAuthenticated.value = false;
        currentUser.value = null;
        localStorage.removeItem('uni_session');
        localStorage.removeItem('uni_user');
        router.push('/login');
    };

    // Helper para verificar si existe el correo antes de enviar código
    const emailExists = (email: string) => users.value.some(u => u.email === email);

    return { isAuthenticated, currentUser, login, logout, initAuth, registerUser, emailExists };
});