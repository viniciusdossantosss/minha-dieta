import { MealOption, MealType } from './meal.model';
import { Patient } from './patient.model';

export interface DailyMealChoice {
  id?: number;
  patientId: number;
  patient?: Patient;
  date: Date;
  mealType: MealType;
  mealOptionId: number;
  mealOption?: MealOption;
  createdAt?: Date;
  updatedAt?: Date;
}
