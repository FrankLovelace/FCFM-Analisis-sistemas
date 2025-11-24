// src/data/users.ts
export interface User {
    email: string;
    storedHash: string;
    name: string;
    role: 'admin' | 'student';
}

export const usersDB: User[] = [
    {
        email: 'admin@uanl.edu.mx',
        storedHash: '94d13f36035029a1b89cc594191d4e0220d6d585e8d5fc9e54d671239922245b',
        name: 'Administrador UANL',
        role: 'admin'
    },
    {
        email: 'alumno@uanl.edu.mx',
        storedHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 
        name: 'Juan Pérez (Alumno)',
        role: 'student'
    }
];