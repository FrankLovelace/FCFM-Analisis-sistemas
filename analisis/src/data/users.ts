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
        // Hash de "admin123" + "admin@uanl.edu.mx"
        storedHash: '4e18b812e1a878b963925a5431d9c853bf2534331952e259f65369cdbb74a8e6',
        name: 'Administrador UANL',
        role: 'admin'
    },
    {
        email: 'alumno@uanl.edu.mx',
        // Hash de "alumno123" + "alumno@uanl.edu.mx"
        storedHash: '97e4e938fbac626d21f6a9f4383529e5701467da27208197915ea738890afae8', 
        name: 'Juan Pérez',
        role: 'student'
    }
];