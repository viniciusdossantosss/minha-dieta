import { UserType } from '../services/auth.service';

export interface User {
  id: number;
  email: string;
  name: string;
  userType: UserType;
  crn?: string; // Apenas para nutricionistas
  phone?: string;
  photoUrl?: string;
  // Campos adicionais para pacientes, se o User model for genérico
  age?: number;
  weight?: number;
  height?: number;
  goal?: string;
  nutritionistId?: number; // Adicionado para pacientes
}