import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../shared/dashboard-layout/dashboard-layout.component';
import { MealSelectionModalComponent } from '../../shared/meal-selection-modal/meal-selection-modal.component';
import { AuthService } from '../../services/auth.service';
import { DietService } from '../../services/diet.service';
import { MealService } from '../../services/meal.service';
import { Patient } from '../../models/patient.model';
import { MealOption, MealType } from '../../models/meal.model';
import { DietPlan, MealAssignment } from '../../models/diet.model';
import { forkJoin, Observable, of, BehaviorSubject } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

interface DayMealSlot {
  mealType: MealType;
  icon: string;
  assignedOption: MealOption | null;
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

  // Mock do perfil do paciente logado
  userProfile = {
    id: 1, // Assumindo paciente ID 1 (Maria Silva)
    name: 'Maria Silva',
    age: 32,
    type: 'patient' as const,
    status: 'active',
    lastUpdate: new Date(),
    email: 'maria.silva@example.com'
  };

  private weekDataSubject = new BehaviorSubject<DayColumn[]>([]);
  weekData$ = this.weekDataSubject.asObservable();

  todayMeals$: Observable<DayMealSlot[]>;
  currentWeekStart = new Date();
  private lastClickedSlot: { date: Date, mealType: MealType } | null = null;

  constructor(
    private dietService: DietService,
    private mealService: MealService
  ) {
    this.todayMeals$ = of([]);
  }

  ngOnInit(): void {
    this.loadWeekData();
  }

  loadWeekData(): void {
    const patientId = this.userProfile.id;

    forkJoin({
      dietPlan: this.dietService.getDietForPatient(patientId),
      // mealOptions não é mais necessário aqui, pois a dieta já contém os objetos MealOption
    }).pipe(
      map(data => this.buildWeekColumns(this.currentWeekStart, data.dietPlan))
    ).subscribe(weekColumns => {
      this.weekDataSubject.next(weekColumns);
      this.updateTodayMeals();
    });
  }

  buildWeekColumns(startDate: Date, dietPlan: DietPlan): DayColumn[] {
    // mealOptionsMap não é mais necessário
    const weekDays: DayColumn[] = [];
    const start = this.getStartOfWeek(startDate);

    const mealTypes: MealType[] = ['Café da Manhã', 'Lanche da Manhã', 'Almoço', 'Lanche da Tarde', 'Jantar', 'Ceia'];
    const icons: { [key in MealType]: string } = { 'Café da Manhã': '☕', 'Lanche da Manhã': '🍎', 'Almoço': '🍽️', 'Lanche da Tarde': '🥪', 'Jantar': '🍜', 'Ceia': '🥛' };

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dateString = this.formatDate(date);
      const dayAssignments = dietPlan.schedule[dateString] || {};

      weekDays.push({
        date: date,
        dayName: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
        dayNumber: date.getDate().toString(),
        slots: mealTypes.map(type => {
          const assignedOption = dayAssignments[type] || null; // Usa diretamente o objeto MealOption
          return { mealType: type, icon: icons[type], assignedOption };
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

  openMealSelector(date: Date, mealType: MealType): void {
    this.lastClickedSlot = { date, mealType };
    this.mealModal.open(mealType);
  }

  onMealSelected(selectedMeal: MealOption): void {
    if (!this.lastClickedSlot) return;

    const assignment: MealAssignment = {
      patientId: this.userProfile.id,
      date: this.formatDate(this.lastClickedSlot.date),
      mealType: this.lastClickedSlot.mealType,
      mealOption: selectedMeal // Usa o objeto MealOption completo
    };

    this.dietService.assignMeal(assignment).subscribe(() => {
      this.loadWeekData(); // Recarrega os dados para atualizar a UI
    });
  }

  // --- Funções de Data e Navegação ---
  getTodayDate = () => new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  getCurrentWeekDisplay = () => {
    const endOfWeek = new Date(this.currentWeekStart);
    endOfWeek.setDate(this.currentWeekStart.getDate() + 6);
    return `${this.currentWeekStart.getDate()}/${this.currentWeekStart.getMonth()+1} - ${endOfWeek.getDate()}/${endOfWeek.getMonth()+1}`;
  }
  previousWeek = () => { this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7); this.loadWeekData(); }
  nextWeek = () => { this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7); this.loadWeekData(); }
  private getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // ajusta para segunda-feira
    return new Date(d.setDate(diff));
  }
  private formatDate = (date: Date) => `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}