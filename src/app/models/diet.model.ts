import { MealOption, MealType } from './meal.model';

// Representa a atribuição de uma refeição a um dia/tipo específico
export interface MealAssignment {
  patientId: number;
  date: string; // Formato YYYY-MM-DD
  mealType: MealType;
  mealOption: MealOption; // Objeto da refeição customizada
}

// Representa o plano alimentar completo de um paciente para uma semana
export interface DietPlan {
  patientId: number;
  // A chave é a data em formato YYYY-MM-DD
  schedule: { 
    [date: string]: {
      // A chave é o tipo de refeição
      [key in MealType]?: MealOption; // O valor é o objeto da refeição
    }
  };
}
