import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../shared/dashboard-layout/dashboard-layout.component';
import { MealSelectionModalComponent } from '../../shared/meal-selection-modal/meal-selection-modal.component';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { DietPlan } from '../../models/diet.model';
import { DailyMealChoice } from '../../models/daily-meal-choice.model'; // Importar DailyMealChoice
import { MealOption, MealType } from '../../models/meal.model';
import { forkJoin, Observable, of, BehaviorSubject } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { DietPlansApiService } from '../../services/diet-plans-api.service';
import { DailyMealChoiceApiService } from '../../services/daily-meal-choice-api.service'; // Novo serviço

interface DayMealSlot {
  mealType: MealType;
  icon: string;
  assignedOption: MealOption | null;
  selectedChoice?: MealOption | null; // Para a escolha do paciente
}

interface DayColumn {
  date: Date;
  dayName: string;
  dayNumber: string;
  slots: DayMealSlot[];
}

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent, MealSelectionModalComponent],
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.css']
})
export class PatientDashboardComponent implements OnInit {
  @ViewChild(MealSelectionModalComponent) mealModal!: MealSelectionModalComponent;

  userProfile: User | null = null;

  private weekDataSubject = new BehaviorSubject<DayColumn[]>([]);
  weekData$ = this.weekDataSubject.asObservable();

  todayMeals$: Observable<DayMealSlot[]>;
  public currentDate: Date = new Date();
  currentWeekStart = new Date();
  private lastClickedSlot: { date: Date, mealType: MealType } | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private dietPlansApiService: DietPlansApiService,
    private dailyMealChoiceApiService: DailyMealChoiceApiService // Novo serviço
  ) {
    this.todayMeals$ = of([]);
  }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      if (user && user.userType === 'patient') {
        this.userProfile = user;
        this.currentDate = new Date(); // Inicializar currentDate
        this.currentWeekStart = this.getStartOfWeek(this.currentDate);
        this.loadWeekData(user.id, this.currentWeekStart);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  loadWeekData(patientId: number, startOfWeek: Date): void {
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    forkJoin({
      dietPlans: this.dietPlansApiService.getDietPlanForWeek(this.formatDate(startOfWeek), patientId),
      dailyChoices: this.dailyMealChoiceApiService.getDailyMealChoicesByPatientAndWeek(patientId, this.formatDate(startOfWeek))
    }).pipe(
      map(data => this.buildWeekColumns(startOfWeek, data.dietPlans, data.dailyChoices))
    ).subscribe(weekColumns => {
      this.weekDataSubject.next(weekColumns);
      this.updateTodayMeals();
    });
  }

  buildWeekColumns(startDate: Date, dietPlans: DietPlan[], dailyChoices: DailyMealChoice[]): DayColumn[] {
    const weekDays: DayColumn[] = [];
    const start = this.getStartOfWeek(startDate);

    const mealTypes: MealType[] = [
      MealType.BREAKFAST,
      MealType.MORNING_SNACK,
      MealType.LUNCH,
      MealType.AFTERNOON_SNACK,
      MealType.DINNER,
      MealType.EVENING_SNACK,
    ];
    const icons: { [key in MealType]: string } = {
      [MealType.BREAKFAST]: '☕',
      [MealType.MORNING_SNACK]: '🍎',
      [MealType.LUNCH]: '🍽️',
      [MealType.AFTERNOON_SNACK]: '🥪',
      [MealType.DINNER]: '🍜',
      [MealType.EVENING_SNACK]: '🥛',
    };

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dateString = this.formatDate(date);

      const dayDietPlans = dietPlans.filter(plan => this.formatDate(new Date(plan.date)) === dateString);
      const dayDailyChoices = dailyChoices.filter(choice => this.formatDate(new Date(choice.date)) === dateString);

      weekDays.push({
        date: date,
        dayName: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
        dayNumber: date.getDate().toString(),
        slots: mealTypes.map(type => {
          const assignedOptions = dayDietPlans.filter(plan => plan.mealType === type).flatMap(plan => plan.mealOptions);
          const selectedChoice = dayDailyChoices.find(choice => choice.mealType === type)?.mealOption || null;
          
          return { mealType: type, icon: icons[type], assignedOption: assignedOptions[0] || null, selectedChoice };
        })
      });
    }
    return weekDays;
  }

  updateTodayMeals(): void {
    const todayString = this.formatDate(new Date());
    this.todayMeals$ = this.weekData$.pipe(
      map(weekData => {
        const todayColumn = weekData.find(day => this.formatDate(day.date) === todayString);
        return todayColumn ? todayColumn.slots : [];
      })
    );
  }

  openMealSelector(date: Date, mealType: MealType, assignedOptions: MealOption[]): void {
    this.lastClickedSlot = { date, mealType };
    if (this.userProfile) {
      this.mealModal.open(mealType, this.userProfile.id, assignedOptions);
    }
  }

  onMealSelected(selectedMeal: MealOption): void {
    if (!this.lastClickedSlot || !this.userProfile) return;

    const createDailyMealChoiceDto = {
      date: this.formatDate(this.lastClickedSlot.date),
      mealType: this.lastClickedSlot.mealType,
      mealOptionId: selectedMeal.id!,
    };

    this.dailyMealChoiceApiService.createOrUpdateDailyMealChoice(createDailyMealChoiceDto).subscribe(() => {
      if (this.userProfile) {
        this.loadWeekData(this.userProfile.id, this.currentWeekStart); // Recarrega os dados para atualizar a UI
      }
    });
  }

  // --- Funções de Data e Navegação ---
  getTodayDate = (): string => new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  getCurrentWeekDisplay = (): string => {
    const startOfWeek = this.currentWeekStart;
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return `${startOfWeek.getDate()}/${startOfWeek.getMonth() + 1} - ${endOfWeek.getDate()}/${endOfWeek.getMonth() + 1}`;
  };

  previousWeek = (): void => {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
    if (this.userProfile) this.loadWeekData(this.userProfile.id, this.currentWeekStart);
  };

  nextWeek = (): void => {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
    if (this.userProfile) this.loadWeekData(this.userProfile.id, this.currentWeekStart);
  };

  private getStartOfWeek = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // ajusta para segunda-feira
    return new Date(d.setDate(diff));
  };

  private formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
}
