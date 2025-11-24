// src/stores/authStore.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import SHA256 from 'crypto-js/sha256';
import { usersDB, type User } from '../data/users';

export const useAuthStore = defineStore('auth', () => {
    const isAuthenticated = ref(false);
    const currentUser = ref<User | null>(null);
    const router = useRouter();

    // Validar sesión existente al recargar página
    const initAuth = () => {
        const session = localStorage.getItem('uni_session');
        const user = localStorage.getItem('uni_user');
        if (session === 'valid' && user) {
            isAuthenticated.value = true;
            currentUser.value = JSON.parse(user);
        }
    };

    const login = (email: string, password: string): boolean => {
        // 1. Buscar usuario en el "JSON"
        const userFound = usersDB.find(u => u.email === email);
        
        if (!userFound) return false;

        // 2. Calcular Hash (Password + Email como Salt)
        const attemptHash = SHA256(password + email).toString();

        // 3. Comparar
        if (attemptHash === userFound.storedHash) {
            isAuthenticated.value = true;
            currentUser.value = userFound;
            localStorage.setItem('uni_session', 'valid');
            localStorage.setItem('uni_user', JSON.stringify(userFound));
            return true;
        }
        
        return false;
    };

    const logout = () => {
        isAuthenticated.value = false;
        currentUser.value = null;
        localStorage.removeItem('uni_session');
        localStorage.removeItem('uni_user');
        router.push('/login');
    };

    return { isAuthenticated, currentUser, login, logout, initAuth };
});