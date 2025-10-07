import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription, forkJoin, of, Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

// Shared Components and Services
import { DashboardLayoutComponent } from '../../shared/dashboard-layout/dashboard-layout.component';
import { MealSelectionModalComponent } from '../../shared/meal-selection-modal/meal-selection-modal.component';
import { DietPlansApiService } from '../../services/diet-plans-api.service';
import { DailyMealChoiceService } from '../../services/daily-meal-choice-api.service';
import { AuthService } from '../../services/auth.service';

// Models
import { DietPlan } from '../../models/diet.model';
import { DailyMealChoice } from '../../models/daily-meal-choice.model';
import { MealOption, MealType } from '../../models/meal.model';
import { User } from '../../models/user.model';

interface MealSlot {
  date: Date;
  mealType: MealType;
  dietPlan?: DietPlan; // Plano encontrado para este slot (se existir)
  selectedMeal?: MealOption; // A opção de refeição selecionada pelo paciente
  dailyChoiceId?: number; // ID da escolha diária, se já salva
}

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DashboardLayoutComponent,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.css'],
})
export class PatientDashboardComponent implements OnInit, OnDestroy {
  userProfile: User | null = null;
  patientId: number | null = null;
  weeklyMealSlots: { [key: string]: MealSlot[] } = {}; // { 'YYYY-MM-DD': MealSlot[] }
  currentWeek: Date[] = [];
  mealTypes = Object.values(MealType);
  private subscriptions: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private dietPlanService: DietPlansApiService,
    private dailyMealChoiceService: DailyMealChoiceService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.generateCurrentWeek();
    this.subscriptions.add(this.authService.getCurrentUser().pipe(
      switchMap(user => {
        if (user && user.userType === 'patient') {
          this.userProfile = user;
          this.patientId = user.id; // Assumindo que o ID do usuário é o ID do paciente
          return this.loadPatientData(user.id);
        } else {
          console.error('Usuário não é um paciente ou não está logado.');
          this.router.navigate(['/login']);
          return of(null); // Retorna Observable nulo para evitar erros
        }
      })
    ).subscribe());
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  generateCurrentWeek(): void {
    this.currentWeek = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Começa na segunda-feira

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      this.currentWeek.push(date);
    }
  }

  loadPatientData(patientId: number): Observable<void> {
    return forkJoin([
      this.dietPlanService.getDietPlansByPatient(patientId),
      this.dailyMealChoiceService.getDailyMealChoicesByPatient(patientId)
    ]).pipe(
      map(([dietPlans, dailyChoices]: [DietPlan[], DailyMealChoice[]]) => {
        this.weeklyMealSlots = {};
        this.currentWeek.forEach(date => {
          const dateKey = date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
          this.weeklyMealSlots[dateKey] = [];

          const planForDate = dietPlans.find((dp: DietPlan) => new Date(dp.date).toISOString().split('T')[0] === dateKey);

          this.mealTypes.forEach(mealType => {
            const mealSlot: MealSlot = { date, mealType };

            if (planForDate && planForDate.mealType === mealType) {
              mealSlot.dietPlan = planForDate;
            }

            const dailyChoice = (dailyChoices || []).find((dc: DailyMealChoice) => 
              new Date(dc.date).toISOString().split('T')[0] === dateKey &&
              dc.mealType === mealType
            );

            if (dailyChoice) {
              mealSlot.selectedMeal = dailyChoice.mealOption;
              mealSlot.dailyChoiceId = dailyChoice.id;
            }
            this.weeklyMealSlots[dateKey].push(mealSlot);
          });
        });
        return void 0;
      })
    );
  }

  openMealSelector(mealSlot: MealSlot): void {
    if (!this.patientId) {
      this.snackBar.open('Erro: ID do paciente não encontrado.', 'Fechar', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(MealSelectionModalComponent, {
      width: '800px',
      data: { 
        mealType: mealSlot.mealType, 
        patientId: this.patientId, 
        dietPlan: mealSlot.dietPlan 
      },
    });

    this.subscriptions.add(dialogRef.afterClosed().subscribe(result => {
      if (result && result.selectedMealOption) {
        const selectedMealOption: MealOption = result.selectedMealOption;
        const dateKey = mealSlot.date.toISOString().split('T')[0];

        const dailyChoice: Partial<DailyMealChoice> = {
          patientId: this.patientId!,
          date: new Date(dateKey),
          mealType: mealSlot.mealType,
          mealOptionId: selectedMealOption.id,
        };

        if (mealSlot.dailyChoiceId) {
          // Atualizar escolha existente
          this.subscriptions.add(this.dailyMealChoiceService.updateDailyMealChoice(mealSlot.dailyChoiceId, dailyChoice).subscribe(
            () => {
              this.snackBar.open('Escolha de refeição atualizada!', 'Fechar', { duration: 3000 });
              if (this.patientId) this.loadPatientData(this.patientId).subscribe(); // Recarregar dados
            },
            (error: any) => {
              console.error('Erro ao atualizar escolha de refeição:', error);
              this.snackBar.open('Erro ao atualizar escolha de refeição.', 'Fechar', { duration: 3000 });
            }
          ));
        } else {
          // Criar nova escolha
          this.subscriptions.add(this.dailyMealChoiceService.addDailyMealChoice(dailyChoice).subscribe(
            () => {
              this.snackBar.open('Escolha de refeição salva!', 'Fechar', { duration: 3000 });
              if (this.patientId) this.loadPatientData(this.patientId).subscribe(); // Recarregar dados
            },
            (error: any) => {
              console.error('Erro ao salvar escolha de refeição:', error);
              this.snackBar.open('Erro ao salvar escolha de refeição.', 'Fechar', { duration: 3000 });
            }
          ));
        }
      }
    }));
  }

  getFormattedDate(date: Date): string {
    return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
  }

  // Helper para obter o array de MealSlots para um dia específico
  getMealSlotsForDate(date: Date): MealSlot[] {
    const dateKey = date.toISOString().split('T')[0];
    return this.weeklyMealSlots[dateKey] || [];
  }

  getMealSlot(date: Date, mealType: MealType): MealSlot | undefined {
    const slots = this.getMealSlotsForDate(date);
    return slots.find(slot => slot.mealType === mealType);
  }

  // Helper para verificar se a data é hoje
  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }
}
