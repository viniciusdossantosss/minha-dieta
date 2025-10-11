import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { DietPlansApiService } from '../../services/diet-plans-api.service';
import { PatientApiService } from '../../services/patient-api.service';
import { MealOptionsApiService } from '../../services/meal-options-api.service';
import { AuthService } from '../../services/auth.service';
import { DietPlan } from '../../models/diet.model';
import { MealOption, MealType } from '../../models/meal.model';
import { Patient } from '../../models/patient.model';
import { User } from '../../models/user.model';
import { DashboardLayoutComponent } from '../../shared/dashboard-layout/dashboard-layout.component';

@Component({
  selector: 'app-diet-plan-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    DashboardLayoutComponent,
  ],
  templateUrl: './diet-plan-form.component.html',
  styleUrls: ['./diet-plan-form.component.css']
})
export class DietPlanFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dietPlansApi = inject(DietPlansApiService);
  private patientApi = inject(PatientApiService);
  private mealOptionsApi = inject(MealOptionsApiService);
  private authService = inject(AuthService);

  isEditMode = false;
  patients: Patient[] = [];
  mealOptions: MealOption[] = [];
  mealTypes = Object.values(MealType);
  userProfile: User | null = null;

  dietPlanForm: FormGroup = this.fb.group({
    patientId: new FormControl<number | null>(null, { nonNullable: false, validators: [Validators.required] }),
    date: new FormControl<Date | null>(null, { nonNullable: false, validators: [Validators.required] }),
    mealPlanEntries: this.fb.array([])
  });

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      this.userProfile = user;
    });

    this.patientApi.getPatients().subscribe((p: Patient[]) => this.patients = p);
    this.mealOptionsApi.getMealOptions().subscribe(opts => this.mealOptions = opts);

    const idParam = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!idParam;
  }

  get mealPlanEntries(): FormArray<FormGroup> {
    return this.dietPlanForm.get('mealPlanEntries') as FormArray<FormGroup>;
  }

  addMealPlanEntry(): void {
    const entry = this.fb.group({
      mealType: new FormControl<MealType | null>(null, { nonNullable: false, validators: [Validators.required] }),
      mealOptionId: new FormControl<number | null>(null, { nonNullable: false, validators: [Validators.required] }),
      notes: new FormControl<string | null>(null)
    });
    this.mealPlanEntries.push(entry);
  }

  removeMealPlanEntry(index: number): void {
    this.mealPlanEntries.removeAt(index);
  }

  onSubmit(): void {
    if (this.dietPlanForm.invalid) return;

    const formValue = this.dietPlanForm.value as {
      patientId: number;
      date: Date;
      mealPlanEntries: { mealType: MealType; mealOptionId: number; notes?: string }[];
    };

    // Create one DietPlan per entry (backend model expects one mealType per DietPlan)
    const requests: Observable<DietPlan>[] = formValue.mealPlanEntries.map(e => {
      return this.dietPlansApi.createDietPlan({
        patientId: formValue.patientId,
        date: formValue.date,
        mealType: e.mealType,
        mealOptions: [{ id: e.mealOptionId }],
        notes: e.notes,
        completed: false,
      });
    });

    // Fire sequentially for simplicity
    if (requests.length > 0) {
      requests[requests.length - 1].subscribe(() => {
        this.router.navigate(['/nutritionist/patients']); // Or wherever you want to redirect
      });
    }
  }

  isFieldInvalid(field: string, form: any = this.dietPlanForm): boolean {
    const control = form.get(field);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  onCancel(): void {
    this.router.navigate(['/nutritionist/diet-plans']);
  }
}
