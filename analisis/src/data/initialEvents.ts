export interface UniversityEvent {
    id: string;
    title: string;
    category: string; 
    faculty: string;  
    date: string;      
    displayDate: string; 
    location: string;
    modality: 'Presencial' | 'Virtual' | 'Híbrido';
    price: string;    
    image: string;    
    description: string;
}

export const initialEvents: UniversityEvent[] = [
    {
        id: '1',
        title: 'Taller de Certificación en Power BI Nivel Básico',
        category: 'Académico',
        faculty: 'FACPYA',
        date: '2025-11-20',
        displayDate: '20 Noviembre',
        location: 'FACPYA',
        modality: 'Híbrido',
        price: '$100 MXN',
        image: 'https://placehold.co/600x400/e2e8f0/1e293b?text=Power+BI',
        description: 'Aprende las bases de datos con Microsoft Power BI.'
    },
    {
        id: '2',
        title: 'Concierto de Gala de la Orquesta Sinfónica',
        category: 'Cultural',
        faculty: 'Artes Musicales',
        date: '2025-11-25',
        displayDate: '25 Noviembre',
        location: 'Teatro Universitario',
        modality: 'Presencial',
        price: '$350 MXN',
        image: 'https://placehold.co/600x400/e2e8f0/1e293b?text=Orquesta',
        description: 'Noche de gala con invitados especiales.'
    },
    {
        id: '3',
        title: 'Final de Voleibol Femenil: Tigres vs Lobas',
        category: 'Deportivo',
        faculty: 'Dirección de Deportes',
        date: '2025-11-30',
        displayDate: '30 Noviembre',
        location: 'Gimnasio Principal',
        modality: 'Presencial',
        price: '$50 MXN',
        image: 'https://placehold.co/600x400/e2e8f0/1e293b?text=Voleibol',
        description: 'Gran final del torneo intra-universitario.'
    },
    {
        id: '4',
        title: 'Torneo Inter-Facultades de Ajedrez',
        category: 'Cultural',
        faculty: 'Rectoría',
        date: '2024-05-10', 
        displayDate: '10 Mayo',
        location: 'Biblioteca',
        modality: 'Presencial',
        price: 'Gratis',
        image: 'https://placehold.co/600x400/e2e8f0/1e293b?text=Ajedrez',
        description: 'Torneo rápido de ajedrez.'
    }
];