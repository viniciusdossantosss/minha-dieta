import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

// Services
import { DietPlansApiService } from '../../services/diet-plans-api.service';
import { PatientService } from '../../services/patient.service';
import { MealOptionsApiService } from '../../services/meal-options-api.service'; // Usar MealOptionsApiService
import { AuthService } from '../../services/auth.service';

// Models
import { DietPlan } from '../../models/diet.model'; // Importar DietPlan do modelo correto
import { Patient } from '../../models/patient.model';
import { MealOption, MealType } from '../../models/meal.model';

interface MealPlanEntry {
  mealType: MealType;
  mealOptionId: number;
  notes?: string;
}

@Component({
  selector: 'app-diet-plan-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
  ],
  templateUrl: './diet-plan-form.component.html',
  styleUrls: ['./diet-plan-form.component.css'],
})
export class DietPlanFormComponent implements OnInit, OnDestroy {
  dietPlanForm!: FormGroup;
  isEditMode: boolean = false;
  dietPlanId: number | null = null;
  nutritionistId: number | null = null;
  patients: Patient[] = [];
  mealOptions: MealOption[] = [];
  mealTypes = Object.values(MealType);
  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private dietPlansApiService: DietPlansApiService, // Corrigido para DietPlansApiService
    private patientService: PatientService,
    private mealOptionsApiService: MealOptionsApiService, // Corrigido para MealOptionsApiService
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.subscriptions.add(this.authService.getCurrentUser().pipe(
      switchMap(user => {
        if (user && user.userType === 'nutritionist') {
          this.nutritionistId = user.id;
          return forkJoin([
            this.patientService.getPatients(user.id),
            this.mealOptionsApiService.getMealOptions(user.id)
          ]);
        } else {
          console.error('Usuário não é um nutricionista ou não está logado.');
          this.router.navigate(['/login']);
          return of([[], []]); // Retorna Observables vazios para evitar erros
        }
      })
    ).subscribe(([patients, mealOptions]) => {
      this.patients = patients;
      this.mealOptions = mealOptions;

      this.subscriptions.add(this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.dietPlanId = +id;
          this.isEditMode = true;
          this.loadDietPlanData(this.dietPlanId);
        }
      }));
    }));
  }

  initForm(): void {
    this.dietPlanForm = this.fb.group({
      patientId: [null, Validators.required],
      date: [null, Validators.required],
      mealPlanEntries: this.fb.array([], Validators.required)
    });
  }

  get mealPlanEntries(): FormArray {
    return this.dietPlanForm.get('mealPlanEntries') as FormArray;
  }

  addMealPlanEntry(entry?: MealPlanEntry): void {
    this.mealPlanEntries.push(this.fb.group({
      mealType: [entry?.mealType || '', Validators.required],
      mealOptionId: [entry?.mealOptionId || null, Validators.required],
      notes: [entry?.notes || '']
    }));
  }

  removeMealPlanEntry(index: number): void {
    this.mealPlanEntries.removeAt(index);
  }

  loadDietPlanData(id: number): void {
    this.subscriptions.add(this.dietPlansApiService.getDietPlan(id).subscribe((dietPlan: DietPlan) => {
      this.dietPlanForm.patchValue({
        patientId: dietPlan.patientId,
        date: dietPlan.date ? new Date(dietPlan.date) : null,
      });
      this.mealPlanEntries.clear();
      // Assumindo que dietPlan.mealOptions é o que precisamos para mealPlanEntries
      dietPlan.mealOptions.forEach((mealOption: MealOption) => this.addMealPlanEntry({
        mealType: mealOption.type,
        mealOptionId: mealOption.id!,
        notes: '' // Notas não estão diretamente no MealOption, então deixamos vazio ou ajustamos
      }));
    }));
  }

  onSubmit(): void {
    if (this.dietPlanForm.valid && this.nutritionistId !== null) {
      const formValue = this.dietPlanForm.value;
      const dietPlanData: CreateUpdateDietPlanDto = {
        patientId: formValue.patientId,
        date: formValue.date.toISOString().split('T')[0], // Formata para 'YYYY-MM-DD'
        mealOptions: formValue.mealPlanEntries.map((entry: MealPlanEntry) => ({ id: entry.mealOptionId as number })),
        mealType: formValue.mealPlanEntries[0]?.mealType, // Assumindo que o primeiro entry define o mealType principal
        notes: formValue.mealPlanEntries.map((entry: MealPlanEntry) => entry.notes).filter(Boolean).join('; '),
        nutritionistId: this.nutritionistId!,
      };

      if (this.isEditMode && this.dietPlanId) {
        this.subscriptions.add(this.dietPlansApiService.updateDietPlan(this.dietPlanId, dietPlanData).subscribe(() => {
          alert('Plano de dieta atualizado com sucesso!');
          this.router.navigate(['/nutritionist/patients']);
        }, (error: any) => {
          console.error('Erro ao atualizar plano de dieta:', error);
          alert('Erro ao atualizar plano de dieta.');
        }));
      } else {
        this.subscriptions.add(this.dietPlansApiService.createDietPlan(dietPlanData).subscribe(() => {
          alert('Plano de dieta criado com sucesso!');
          this.router.navigate(['/nutritionist/patients']);
        }, (error: any) => {
          console.error('Erro ao criar plano de dieta:', error);
          alert('Erro ao criar plano de dieta.');
        }));
      }
    } else {
      alert('Por favor, preencha todos os campos obrigatórios e adicione pelo menos uma entrada de refeição.');
    }
  }

  onCancel(): void {
    this.router.navigate(['/nutritionist/patients']); // Ou para onde for mais apropriado
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
