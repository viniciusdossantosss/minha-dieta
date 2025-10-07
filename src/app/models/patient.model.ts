export interface Patient {
  id: number;
  name: string;
  age?: number; // Tornar opcional
  type?: 'patient'; // Adicionado para compatibilidade
  photoUrl?: string;
  status: 'active' | 'inactive';
  lastUpdate: Date;
  email?: string;
  phone?: string;
  goal?: string;
  nutritionistId: number;
  birthDate?: Date; // Adicionado
  isActive: boolean; // Adicionado
  // Adicionar campos que existem na entidade Patient do backend
  weight?: number;
  height?: number;
  gender?: string;
  medicalHistory?: string;
  allergies?: string;
  dietaryRestrictions?: string;
}