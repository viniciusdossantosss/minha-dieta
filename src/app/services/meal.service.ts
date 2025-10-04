import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MealOption, MealType } from '../models/meal.model';

@Injectable({
  providedIn: 'root'
})
export class MealService {

  private mealOptions: MealOption[] = [
    {
      id: 1,
      name: 'Ovos e Fruta',
      type: 'Café da Manhã',
      items: [
        { description: 'Ovos mexidos', quantity: '2 unidades' },
        { description: 'Mamão papaia', quantity: '1/2 unidade' },
        { description: 'Aveia em flocos', quantity: '2 colheres de sopa' }
      ]
    },
    {
      id: 2,
      name: 'Iogurte com Granola',
      type: 'Café da Manhã',
      items: [
        { description: 'Iogurte natural desnatado', quantity: '1 pote (170g)' },
        { description: 'Granola sem açúcar', quantity: '3 colheres de sopa' },
        { description: 'Morangos picados', quantity: '5 unidades' }
      ]
    },
    {
      id: 3,
      name: 'Frango e Batata Doce',
      type: 'Almoço',
      items: [
        { description: 'Filé de frango grelhado', quantity: '150g' },
        { description: 'Batata doce cozida', quantity: '200g' },
        { description: 'Salada de folhas verdes', quantity: 'À vontade' },
        { description: 'Azeite de oliva extra virgem', quantity: '1 colher de sopa' }
      ]
    },
    {
      id: 4,
      name: 'Salmão e Arroz Integral',
      type: 'Almoço',
      items: [
        { description: 'Salmão assado', quantity: '150g' },
        { description: 'Arroz integral', quantity: '4 colheres de sopa' },
        { description: 'Brócolis no vapor', quantity: '1 xícara' }
      ]
    },
    {
      id: 5,
      name: 'Sopa de Legumes',
      type: 'Jantar',
      items: [
        { description: 'Mix de legumes (cenoura, abobrinha, chuchu)', quantity: '2 xícaras' },
        { description: 'Frango desfiado', quantity: '100g' },
        { description: 'Croutons integrais', quantity: '1 colher de sopa' }
      ]
    }
  ];

  constructor() { }

  getMealOptions(): Observable<MealOption[]> {
    return of(this.mealOptions);
  }

  getMealOptionById(id: number): Observable<MealOption | undefined> {
    const option = this.mealOptions.find(o => o.id === id);
    return of(option);
  }

  deleteMealOption(id: number): Observable<boolean> {
    const optionIndex = this.mealOptions.findIndex(o => o.id === id);
    if (optionIndex > -1) {
      this.mealOptions.splice(optionIndex, 1);
      return of(true);
    }
    return of(false);
  }

  addMealOption(mealData: Omit<MealOption, 'id'>): Observable<MealOption> {
    const existingIds = this.mealOptions.map(o => o.id).filter((id): id is number => id !== undefined);
    const newId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    const newMealOption: MealOption = {
      ...mealData,
      id: newId,
    };
    this.mealOptions.push(newMealOption);
    return of(newMealOption);
  }

  updateMealOption(updatedOption: MealOption): Observable<MealOption | undefined> {
    const optionIndex = this.mealOptions.findIndex(o => o.id === updatedOption.id);
    if (optionIndex > -1) {
      this.mealOptions[optionIndex] = updatedOption;
      return of(this.mealOptions[optionIndex]);
    }
    return of(undefined);
  }
}