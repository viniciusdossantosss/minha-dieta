import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DietPlan, MealAssignment } from '../models/diet.model';
import { MealOption } from '../models/meal.model';

@Injectable({
  providedIn: 'root'
})
export class DietService {

  // Mock data com objetos MealOption aninhados
  private assignments: MealAssignment[] = [
    // Dieta de exemplo para a paciente Maria Silva (patientId: 1)
    {
      patientId: 1, 
      date: '2025-10-06', 
      mealType: 'Café da Manhã', 
      mealOption: { name: 'Ovos com Pão Integral', type: 'Café da Manhã', items: [{description: 'Ovos mexidos', quantity: '2 unidades'}, {description: 'Pão integral', quantity: '1 fatia'}] }
    },
    {
      patientId: 1, 
      date: '2025-10-06', 
      mealType: 'Almoço', 
      mealOption: { name: 'Frango Grelhado e Salada', type: 'Almoço', items: [{description: 'Filé de frango grelhado', quantity: '150g'}, {description: 'Salada de folhas verdes', quantity: 'à vontade'}] }
    },
     {
      patientId: 2, 
      date: '2025-10-06', 
      mealType: 'Café da Manhã', 
      mealOption: { name: 'Vitamina de Banana', type: 'Café da Manhã', items: [{description: 'Banana', quantity: '1 unidade'}, {description: 'Aveia em flocos', quantity: '2 colheres'}] }
    },
  ];

  constructor() { }

  // Monta e retorna o plano alimentar de um paciente com refeições completas
  getDietForPatient(patientId: number): Observable<DietPlan> {
    const patientAssignments = this.assignments.filter(a => a.patientId === patientId);
    
    const schedule = patientAssignments.reduce((acc, assignment) => {
      const date = assignment.date;
      if (!acc[date]) {
        acc[date] = {};
      }
      acc[date][assignment.mealType] = assignment.mealOption; // Armazena o objeto completo
      return acc;
    }, {} as DietPlan['schedule']);

    const dietPlan: DietPlan = { patientId, schedule };
    return of(dietPlan);
  }

  // Atribui uma refeição (com o objeto completo) a um paciente
  assignMeal(assignment: MealAssignment): Observable<MealAssignment> {
    const index = this.assignments.findIndex(a => 
      a.patientId === assignment.patientId && 
      a.date === assignment.date && 
      a.mealType === assignment.mealType
    );

    if (index > -1) {
      this.assignments[index] = assignment;
    } else {
      this.assignments.push(assignment);
    }

    return of(assignment);
  }
}
