import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { DashboardLayoutComponent } from '../../shared/dashboard-layout/dashboard-layout.component';
import { MealOption, MealType } from '../../models/meal.model';
import { MealService } from '../../services/meal.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

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
  mealTypes: MealType[] = [MealType.BREAKFAST, MealType.MORNING_SNACK, MealType.LUNCH, MealType.AFTERNOON_SNACK, MealType.DINNER, MealType.EVENING_SNACK];

  userProfile: User | null = null;
  patientId: number | null = null;

  constructor(
    private mealService: MealService, 
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      this.userProfile = user;
    });

    this.route.paramMap.subscribe(params => {
      const patientIdParam = params.get('patientId');
      if (patientIdParam) {
        this.patientId = +patientIdParam;
        this.loadMeals();
      } else {
        this.router.navigate(['/nutritionist/patients']);
      }
    });
  }

  loadMeals(): void {
    if (this.patientId) {
      this.mealService.getMealOptions(this.patientId).subscribe((options: MealOption[]) => {
        this.mealOptions = options;
        this.groupMealsByType();
      });
    }
  }

  groupMealsByType(): void {
    this.groupedMeals = this.mealOptions.reduce((acc, meal) => {
      (acc[meal.type] = acc[meal.type] || []).push(meal);
      return acc;
    }, {} as { [key in MealType]?: MealOption[] });
  }

  createNewOption(): void {
    if (this.patientId) {
      this.router.navigate(['/nutritionist/patients', this.patientId, 'meal-options', 'add']);
    }
  }

  editMeal(id: number): void {
    if (this.patientId) {
      this.router.navigate(['/nutritionist/patients', this.patientId, 'meal-options', id, 'edit']);
    }
  }

  deleteMeal(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta opção de refeição?') && this.patientId) {
      this.mealService.deleteMealOption(id).subscribe(() => {
        this.loadMeals();
      });
    }
  }
}