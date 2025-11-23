import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { checkCredentials } from '../utils/security';

export const useAuthStore = defineStore('auth', () => {
    const isAuthenticated = ref(false);
    const currentUser = ref<{ username: string, name: string } | null>(null);
    const router = useRouter();

    const initAuth = () => {
        const session = localStorage.getItem('uni_session');
        const user = localStorage.getItem('uni_user');
        
        if (session === 'valid' && user) {
            isAuthenticated.value = true;
            currentUser.value = JSON.parse(user);
        }
    };

    const login = (username: string, password: string) => {
        const userRecord = checkCredentials(username, password);
        
        if (userRecord) {
            isAuthenticated.value = true;
            currentUser.value = { username: userRecord.username, name: userRecord.name };
            
            localStorage.setItem('uni_session', 'valid');
            localStorage.setItem('uni_user', JSON.stringify(currentUser.value));
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