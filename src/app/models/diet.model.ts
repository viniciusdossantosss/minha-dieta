import { MealOption, MealType } from './meal.model';
import { Patient } from './patient.model';
import { User } from './user.model';

// Representa a atribuição de uma refeição a um dia/tipo específico
export interface MealAssignment {
  patientId: number;
  date: string; // Formato YYYY-MM-DD
  mealType: MealType;
  mealOption: MealOption; // Objeto da refeição customizada
}

// Representa o plano alimentar completo de um paciente para uma semana (antiga DietPlan)
export interface WeeklyDietSchedule {
  patientId: number;
  // A chave é a data em formato YYYY-MM-DD
  schedule: { 
    [date: string]: {
      // A chave é o tipo de refeição
      [key in MealType]?: MealOption; // O valor é o objeto da refeição
    }
  };
}

// Nova interface DietPlan que espelha a entidade do backend
export interface DietPlan {
  id: number;
  date: Date;
  mealType: MealType;
  notes?: string;
  completed?: boolean;
  createdAt: Date;
  updatedAt: Date;
  patientId: number;
  patient?: Patient;
  nutritionistId: number;
  nutritionist?: User;
  mealOptions: MealOption[];
}

// DTO para criação e atualização de planos de dieta
export interface CreateUpdateDietPlanDto {
  patientId: number;
  date: string; // Formato YYYY-MM-DD
  mealType: MealType;
  mealOptions: { id: number }[]; // IDs das opções de refeição
  notes?: string;
  completed?: boolean;
  nutritionistId: number;
}
