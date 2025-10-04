export interface FoodItem {
  description: string; // Ex: "Pão integral"
  quantity: string;    // Ex: "2 fatias"
}

export type MealType = 'Café da Manhã' | 'Lanche da Manhã' | 'Almoço' | 'Lanche da Tarde' | 'Jantar' | 'Ceia';

export interface MealOption {
  id?: number; // Opcional: usado para modelos de refeição
  name: string;     // Ex: "Opção 1 - Ovos e Pão"
  type: MealType;  // Ex: "Café da Manhã"
  items: FoodItem[];
}
