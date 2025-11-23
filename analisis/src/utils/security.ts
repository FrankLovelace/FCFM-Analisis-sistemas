
import SHA256 from 'crypto-js/sha256';

interface UserRecord {
    username: string;
    storedHash: string; 
    name: string; 
}
const USERS_DB: UserRecord[] = [
    {
        username: 'admin',

        storedHash: '9a90835032a39a04a50d276b9766289b43d34f2d39bd084b604562c5b706df77',
        name: 'Administrador Principal'
    },

];

export const checkCredentials = (username: string, password: string): UserRecord | null => {
    // 1. Buscamos si el usuario existe
    const user = USERS_DB.find(u => u.username === username);
    
    if (!user) return null;

   const attemptHash = SHA256(password + username).toString();

    if (attemptHash === user.storedHash) {
        return user;
    }

    return null;
};