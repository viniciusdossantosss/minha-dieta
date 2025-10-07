import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardLayoutComponent } from '../../shared/dashboard-layout/dashboard-layout.component';
import { Patient } from '../../models/patient.model';
import { DietPlan, WeeklyDietSchedule } from '../../models/diet.model';
import { MealOption, MealType } from '../../models/meal.model';
import { CalendarWeekComponent, SlotClickEvent } from '../../components/calendar-week/calendar-week.component';
import { MealSelectionModalComponent } from '../../shared/meal-selection-modal/meal-selection-modal.component';
import { switchMap, forkJoin, BehaviorSubject } from 'rxjs';
import { Observable, of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { DietPlansApiService } from '../../services/diet-plans-api.service'; // Novo
import { DailyMealChoiceApiService } from '../../services/daily-meal-choice-api.service'; // Novo
import { MealOptionsApiService } from '../../services/meal-options-api.service'; // Novo
import { PatientApiService } from '../../services/patient-api.service'; // Novo

interface PatientDetailData {
  patient: Patient;
  weeklyDietSchedule: WeeklyDietSchedule; // Alterado para WeeklyDietSchedule
  mealOptions: MealOption[];
}

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent, CalendarWeekComponent, MealSelectionModalComponent],
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.css']
})
export class PatientDetailComponent implements OnInit {
  private dataSubject = new BehaviorSubject<PatientDetailData | null>(null);
  data$ = this.dataSubject.asObservable();
  
  startDate = new Date();
  private lastClickedSlot: SlotClickEvent | null = null;

  @ViewChild(MealSelectionModalComponent) mealModal!: MealSelectionModalComponent;

  userProfile: User | null = null;
  currentPatientId: number | null = null; // Adicionar para armazenar o ID do paciente atual

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientApiService: PatientApiService, // Novo
    private dietPlansApiService: DietPlansApiService, // Novo
    private dailyMealChoiceApiService: DailyMealChoiceApiService, // Novo
    private mealOptionsApiService: MealOptionsApiService, // Novo
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      if (user && user.userType === 'nutritionist') {
        this.userProfile = user;
        this.route.paramMap.pipe(
          switchMap(params => {
            const id = params.get('id');
            if (!id) {
              this.dataSubject.next(null);
              return of(null);
            }
            this.currentPatientId = +id; // Armazenar o ID do paciente
            this.loadData(this.currentPatientId, user.id); // Passa o ID do nutricionista
            return this.data$;
          })
        ).subscribe();
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  loadData(patientId: number, nutritionistId: number): void {
    forkJoin({
      patient: this.patientApiService.getPatientById(patientId, nutritionistId),
      dietPlan: this.dietPlansApiService.getDietPlansByPatient(patientId), // Usar DietPlansApiService
      mealOptions: this.mealOptionsApiService.getMealOptions(patientId) // Usar MealOptionsApiService
    }).pipe(
      switchMap(data => {
        if (!data.patient) return of(null);

        const weeklyDietSchedule: WeeklyDietSchedule = {
          patientId: patientId,
          schedule: {}
        };

        data.dietPlan.forEach(plan => {
          const dateString = this.formatDate(new Date(plan.date)); // Certifique-se de que plan.date é um Date
          if (!weeklyDietSchedule.schedule[dateString]) {
            weeklyDietSchedule.schedule[dateString] = {};
          }
          // Assumindo que mealOptions[0] é a refeição principal para este slot
          if (plan.mealOptions && plan.mealOptions.length > 0) {
            weeklyDietSchedule.schedule[dateString][plan.mealType] = plan.mealOptions[0];
          }
        });

        const patientDetailData: PatientDetailData = {
          patient: data.patient,
          weeklyDietSchedule: weeklyDietSchedule,
          mealOptions: data.mealOptions
        };
        return of(patientDetailData);
      })
    ).subscribe(data => this.dataSubject.next(data));
  }

  onSlotClicked(event: SlotClickEvent): void {
    this.lastClickedSlot = event;
    if (this.userProfile && this.currentPatientId) {
      this.mealModal.open(event.mealType, this.currentPatientId, this.dataSubject.value?.mealOptions || []); // Passar currentPatientId e mealOptions
    }
  }

  onMealSelected(selectedMeal: MealOption): void {
    if (!this.lastClickedSlot || !this.dataSubject.value?.patient) return;

    const createDailyMealChoiceDto = {
      date: this.formatDate(this.lastClickedSlot.date),
      mealType: this.lastClickedSlot.mealType,
      mealOptionId: selectedMeal.id!,
    };

    this.dailyMealChoiceApiService.createOrUpdateDailyMealChoice(createDailyMealChoiceDto).subscribe(() => {
      if (this.userProfile && this.currentPatientId) {
        this.loadData(this.currentPatientId, this.userProfile.id);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/nutritionist/patients']); // Voltar para a lista de pacientes
  }

  editPatient(patientId: number): void {
    this.router.navigate(['/nutritionist/patients', patientId, 'edit']);
  }

  // Novo método para navegar para as opções de refeição do paciente
  goToMealOptions(patientId: number): void {
    this.router.navigate(['/nutritionist/patients', patientId, 'meal-options']);
  }
  
  getStatusText(status: 'active' | 'inactive'): string {
    return status === 'active' ? 'Ativo' : 'Inativo';
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}