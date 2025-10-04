import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DashboardLayoutComponent } from '../../shared/dashboard-layout/dashboard-layout.component';
import { MealOption, MealType } from '../../models/meal.model';
import { MealService } from '../../services/meal.service';

@Component({
  selector: 'app-meal-options',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent],
  templateUrl: './meal-options.component.html',
  styleUrls: ['./meal-options.component.css']
})
export class MealOptionsComponent implements OnInit {
  mealOptions: MealOption[] = [];
  groupedMeals: { [key in MealType]?: MealOption[] } = {};
  mealTypes: MealType[] = ['Café da Manhã', 'Lanche da Manhã', 'Almoço', 'Lanche da Tarde', 'Jantar', 'Ceia'];

  userProfile = {
    name: 'Juliana Sobral',
    type: 'nutritionist' as const, // Corrigido para o tipo literal
    avatar: '/assets/default-avatar.png',
    email: 'juliana@minhadieta.com'
  };

  constructor(private mealService: MealService, private router: Router) { }

  ngOnInit(): void {
    this.loadMeals();
  }

  loadMeals(): void {
    this.mealService.getMealOptions().subscribe(options => {
      this.mealOptions = options;
      this.groupMealsByType();
    });
  }

  groupMealsByType(): void {
    this.groupedMeals = this.mealOptions.reduce((acc, meal) => {
      (acc[meal.type] = acc[meal.type] || []).push(meal);
      return acc;
    }, {} as { [key in MealType]?: MealOption[] });
  }

  createNewOption(): void {
    this.router.navigate(['/nutritionist/meal-options/add']);
  }

  editMeal(id: number): void {
    this.router.navigate(['/nutritionist/meal-options', id, 'edit']);
  }

  deleteMeal(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta opção de refeição?')) {
      this.mealService.deleteMealOption(id).subscribe(success => {
        if (success) {
          this.loadMeals();
        }
      });
    }
  }
}