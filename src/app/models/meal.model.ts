export interface FoodItem {
  description: string; // Ex: "Pão integral"
  quantity: string;    // Ex: "2 fatias"
}

export type MealItem = FoodItem; // Exportar FoodItem como MealItem

export enum MealType {
  BREAKFAST = 'Café da Manhã',
  MORNING_SNACK = 'Lanche da Manhã',
  LUNCH = 'Almoço',
  AFTERNOON_SNACK = 'Lanche da Tarde',
  DINNER = 'Jantar',
  EVENING_SNACK = 'Ceia'
}

export interface MealOption {
  id?: number;
  name: string;
  type: MealType;
  description?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  patientId: number; // Adicionar patientId
  items: MealItem[];
}
