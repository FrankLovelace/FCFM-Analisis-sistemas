// src/utils/security.ts
import SHA256 from 'crypto-js/sha256';

interface UserRecord {
    username: string;
    storedHash: string;
    name: string;
}
const USERS_DB: UserRecord[] = [
    {
        username: 'admin',
        storedHash: '057d6ab44a20179a4bb213682beff1ddb9e60f4413e03f0e0df4d84b7b057459', 
        name: 'Administrador Principal'
    }
];

export const checkCredentials = (username: string, password: string): UserRecord | null => {
    const user = USERS_DB.find(u => u.username === username);
    if (!user) return null;

    // Calculamos el hash del intento actual
    const attemptHash = SHA256(password + username).toString();
    
    if (attemptHash === user.storedHash) {
        return user;
    }

    return null;
};