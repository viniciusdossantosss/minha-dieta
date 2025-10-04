import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DietPlan } from '../../models/diet.model';
import { MealOption, MealType } from '../../models/meal.model';

export interface SlotClickEvent {
  date: Date;
  mealType: MealType;
  assignedMeal?: MealOption; // Agora passa o objeto completo
}

@Component({
  selector: 'app-calendar-week',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-week.component.html',
  styleUrls: ['./calendar-week.component.css']
})
export class CalendarWeekComponent implements OnChanges {
  @Input() startDate: Date = new Date();
  @Input() dietPlan: DietPlan | null = null;
  @Input() mealOptions: MealOption[] = [];
  @Output() slotClick = new EventEmitter<SlotClickEvent>();

  weekDays: Date[] = [];
  mealTypes: MealType[] = ['Café da Manhã', 'Lanche da Manhã', 'Almoço', 'Lanche da Tarde', 'Jantar', 'Ceia'];
  private mealOptionsMap: Map<number, MealOption> = new Map();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['startDate']) {
      this.generateWeekDays();
    }
    if (changes['mealOptions']) {
      // Filtra apenas as opções de refeição que possuem um ID definido para o mapa
      this.mealOptionsMap = new Map(this.mealOptions.filter(o => o.id !== undefined).map(o => [o.id as number, o]));
    }
  }

  generateWeekDays(): void {
    this.weekDays = [];
    const current = new Date(this.startDate);
    // Ajusta para o início da semana (domingo)
    current.setDate(current.getDate() - current.getDay());
    for (let i = 0; i < 7; i++) {
      this.weekDays.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
  }

  getAssignedMeal(date: Date, mealType: MealType): MealOption | undefined {
    if (!this.dietPlan) return undefined;
    
    const dateString = this.formatDate(date);
    // O schedule agora armazena diretamente o objeto MealOption
    const assignedMealOption = this.dietPlan.schedule[dateString]?.[mealType];
    
    return assignedMealOption || undefined;
  }

  onSlotClick(date: Date, mealType: MealType): void {
    const assignedMeal = this.getAssignedMeal(date, mealType);
    this.slotClick.emit({
      date,
      mealType,
      assignedMeal: assignedMeal // Passa o objeto completo
    });
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}