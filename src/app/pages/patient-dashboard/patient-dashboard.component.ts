import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../shared/dashboard-layout/dashboard-layout.component';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { Router } from '@angular/router';
import { switchMap, forkJoin, BehaviorSubject } from 'rxjs';
import { Observable, of } from 'rxjs';
import { Patient } from '../../models/patient.model';
import { WeeklyDietSchedule, DietPlan } from '../../models/diet.model';
import { MealOption, MealType } from '../../models/meal.model';
import { CalendarWeekComponent, SlotClickEvent } from '../../components/calendar-week/calendar-week.component';
import { MealSelectionModalComponent } from '../../shared/meal-selection-modal/meal-selection-modal.component';
import { DietPlansApiService } from '../../services/diet-plans-api.service';
import { DailyMealChoiceApiService } from '../../services/daily-meal-choice-api.service';
import { MealOptionsApiService } from '../../services/meal-options-api.service';
import { PatientApiService } from '../../services/patient-api.service';

interface PatientDashboardData {
  patient: Patient;
  weeklyDietSchedule: WeeklyDietSchedule;
  mealOptions: MealOption[];
}

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DashboardLayoutComponent,
    CalendarWeekComponent,
    MealSelectionModalComponent,
  ],
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.css']
})
export class PatientDashboardComponent implements OnInit {
  userProfile: User | null = null;
  private dataSubject = new BehaviorSubject<PatientDashboardData | null>(null);
  data$ = this.dataSubject.asObservable();
  
  startDate = new Date();
  private lastClickedSlot: SlotClickEvent | null = null;

  @ViewChild(MealSelectionModalComponent) mealModal!: MealSelectionModalComponent;

  constructor(
    private authService: AuthService,
    private router: Router,
    private dietPlansApiService: DietPlansApiService,
    private dailyMealChoiceApiService: DailyMealChoiceApiService,
    private mealOptionsApiService: MealOptionsApiService,
    private patientApiService: PatientApiService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      if (user && user.userType === 'patient') {
        this.userProfile = user;
        if (user.userType === 'patient' && user.nutritionistId) {
          this.loadData(user.id, user.nutritionistId);
        } else {
          // Lidar com o caso em que nutritionistId está faltando para um paciente
          console.error('Nutritionist ID is missing for patient user.');
          this.router.navigate(['/login']);
        }
      }
       else {
        this.router.navigate(['/login']);
      }
    });
  }

  loadData(patientId: number, nutritionistId: number): void {
    forkJoin({
      patient: this.patientApiService.getPatientById(patientId, nutritionistId), // Buscar o paciente completo
      dietPlan: this.dietPlansApiService.getDietPlansByPatient(patientId),
      mealOptions: this.mealOptionsApiService.getMealOptions(patientId)
    }).pipe(
      switchMap(data => {
        if (!data.patient) return of(null);

        const weeklyDietSchedule: WeeklyDietSchedule = {
          patientId: patientId,
          schedule: {}
        };

        data.dietPlan.forEach(plan => {
          const dateString = this.formatDate(new Date(plan.date));
          if (!weeklyDietSchedule.schedule[dateString]) {
            weeklyDietSchedule.schedule[dateString] = {};
          }
          if (plan.mealOptions && plan.mealOptions.length > 0) {
            weeklyDietSchedule.schedule[dateString][plan.mealType] = plan.mealOptions[0];
          }
        });

        const patientDashboardData: PatientDashboardData = {
          patient: data.patient,
          weeklyDietSchedule: weeklyDietSchedule,
          mealOptions: data.mealOptions
        };
        return of(patientDashboardData);
      })
    ).subscribe(data => {
      this.dataSubject.next(data);
      this.cdr.detectChanges();
    });
  }

  onSlotClicked(event: SlotClickEvent): void {
    this.lastClickedSlot = event;
    if (this.userProfile) {
      this.mealModal.open(event.mealType, this.userProfile.id, this.dataSubject.value?.mealOptions || []);
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
      if (this.userProfile && this.userProfile.nutritionistId) {
        this.loadData(this.userProfile.id, this.userProfile.nutritionistId);
      }
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
