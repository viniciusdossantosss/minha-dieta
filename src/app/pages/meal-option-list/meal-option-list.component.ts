import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';

// Services
import { MealService } from '../../services/meal.service';
import { AuthService } from '../../services/auth.service';

// Models
import { MealOption } from '../../models/meal.model';
import { User } from '../../models/user.model';

// Layout
import { DashboardLayoutComponent } from '../../shared/dashboard-layout/dashboard-layout.component';

@Component({
  selector: 'app-meal-option-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    DashboardLayoutComponent,
  ],
  templateUrl: './meal-option-list.component.html',
  styleUrls: ['./meal-option-list.component.css'],
})
export class MealOptionListComponent implements OnInit, OnDestroy {
  mealOptions: MealOption[] = [];
  displayedColumns: string[] = ['name', 'mealType', 'items', 'actions'];
  nutritionistId: number | null = null;
  userProfile: User | null = null;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private mealService: MealService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(this.authService.getCurrentUser().subscribe(user => {
      if (user && user.userType === 'nutritionist') {
        this.userProfile = user;
        this.nutritionistId = user.id;
        this.loadMealOptions(user.id);
      } else {
        console.error('Usuário não é um nutricionista ou não está logado.');
        this.router.navigate(['/login']);
      }
    }));
  }

  loadMealOptions(nutritionistId: number): void {
    this.subscriptions.add(this.mealService.getMealOptionsByNutritionist(nutritionistId).subscribe(
      (options: MealOption[]) => {
        this.mealOptions = options;
      },
      (error: any) => {
        console.error('Erro ao carregar opções de refeição:', error);
        this.snackBar.open('Erro ao carregar opções de refeição.', 'Fechar', { duration: 3000 });
      }
    ));
  }

  addMealOption(): void {
    this.router.navigate(['/nutritionist/meal-options/add']);
  }

  editMealOption(id: number): void {
    this.router.navigate(['/nutritionist/meal-options', id, 'edit']);
  }

  deleteMealOption(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta opção de refeição?')) {
      this.subscriptions.add(this.mealService.deleteMealOption(id).subscribe(
        () => {
          this.snackBar.open('Opção de refeição excluída com sucesso!', 'Fechar', { duration: 3000 });
          if (this.nutritionistId) {
            this.loadMealOptions(this.nutritionistId);
          }
        },
        (error: any) => {
          console.error('Erro ao excluir opção de refeição:', error);
          this.snackBar.open('Erro ao excluir opção de refeição.', 'Fechar', { duration: 3000 });
        }
      ));
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
