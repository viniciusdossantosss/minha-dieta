import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardLayoutComponent } from '../../shared/dashboard-layout/dashboard-layout.component';
import { Patient } from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';
import { DietPlan, MealAssignment } from '../../models/diet.model';
import { DietService } from '../../services/diet.service';
import { MealOption, MealType } from '../../models/meal.model';
import { MealService } from '../../services/meal.service';
import { CalendarWeekComponent, SlotClickEvent } from '../../components/calendar-week/calendar-week.component';
import { MealSelectionModalComponent } from '../../shared/meal-selection-modal/meal-selection-modal.component';
import { switchMap, forkJoin, BehaviorSubject } from 'rxjs';
import { Observable, of } from 'rxjs';

interface PatientDetailData {
  patient: Patient;
  dietPlan: DietPlan;
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

  // Simula um perfil de nutricionista logado
  userProfile = {
    id: 1,
    name: 'Juliana Sobral',
    type: 'nutritionist' as const,
    avatar: '/assets/default-avatar.png',
    email: 'juliana@minhadieta.com'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    private dietService: DietService,
    private mealService: MealService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (!id) {
          this.dataSubject.next(null);
          return of(null);
        }
        this.loadData(+id);
        return this.data$;
      })
    ).subscribe();
  }

  loadData(patientId: number): void {
    forkJoin({
      // Passa o ID do nutricionista para validação de acesso
      patient: this.patientService.getPatientById(patientId, this.userProfile.id),
      dietPlan: this.dietService.getDietForPatient(patientId),
      mealOptions: this.mealService.getMealOptions()
    }).pipe(
      switchMap(data => {
        if (!data.patient) return of(null);
        return of(data as PatientDetailData);
      })
    ).subscribe(data => this.dataSubject.next(data));
  }

  onSlotClicked(event: SlotClickEvent): void {
    this.lastClickedSlot = event;
    this.mealModal.open(event.mealType);
  }

  onMealSelected(selectedMeal: MealOption): void {
    if (!this.lastClickedSlot || !this.dataSubject.value?.patient) return;

    // Cria a atribuição com o objeto MealOption completo
    const assignment: MealAssignment = {
      patientId: this.dataSubject.value.patient.id,
      date: this.formatDate(this.lastClickedSlot.date),
      mealType: this.lastClickedSlot.mealType,
      mealOption: selectedMeal 
    };

    this.dietService.assignMeal(assignment).subscribe(() => {
      this.loadData(this.dataSubject.value!.patient.id);
    });
  }

  goBack(): void {
    this.router.navigate(['/nutritionist/dashboard']); // Rota corrigida para o dashboard
  }

  editPatient(patientId: number): void {
    this.router.navigate(['/nutritionist/patients', patientId, 'edit']);
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