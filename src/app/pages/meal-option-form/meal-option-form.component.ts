import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DashboardLayoutComponent } from '../../shared/dashboard-layout/dashboard-layout.component';
import { MealService } from '../../services/meal.service';
import { MealType, FoodItem } from '../../models/meal.model';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-meal-option-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DashboardLayoutComponent],
  templateUrl: './meal-option-form.component.html',
  styleUrls: ['./meal-option-form.component.css']
})
export class MealOptionFormComponent implements OnInit {
  mealForm!: FormGroup;
  isEditMode = false;
  pageTitle = 'Criar Nova Opção de Refeição';
  mealTypes: MealType[] = [MealType.BREAKFAST, MealType.MORNING_SNACK, MealType.LUNCH, MealType.AFTERNOON_SNACK, MealType.DINNER, MealType.EVENING_SNACK];
  private mealId: number | null = null;
  private patientId: number | null = null; // Adicionar patientId

  userProfile: User | null = null;

  constructor(
    private fb: FormBuilder,
    private mealService: MealService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    // A inicialização do formulário será feita em ngOnInit após obter o patientId
  }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      this.userProfile = user;
    });

    this.route.paramMap.subscribe(params => {
      const patientIdParam = params.get('patientId'); // Obter patientId da rota
      if (patientIdParam) {
        this.patientId = +patientIdParam;
        this.initializeForm(this.patientId);
      } else {
        // Redirecionar ou mostrar erro se patientId não estiver na rota
        this.router.navigate(['/nutritionist/patients']);
        return;
      }

      const id = params.get('id');
      if (id && this.patientId) {
        this.isEditMode = true;
        this.mealId = +id;
        this.pageTitle = 'Editar Opção de Refeição';
        this.mealService.getMealOptionById(this.mealId, this.patientId).subscribe((meal: any) => {
          if (meal) {
            this.mealForm.patchValue({ name: meal.name, type: meal.type });
            this.setItems(meal.items);
          }
        });
      }
    });

    if (!this.isEditMode) {
      this.addItem();
    }
  }

  initializeForm(patientId: number): void {
    this.mealForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      type: ['', Validators.required],
      patientId: [patientId], // Adicionar patientId ao formulário
      items: this.fb.array([], Validators.required)
    });
  }

  get items(): FormArray {
    return this.mealForm.get('items') as FormArray;
  }

  setItems(items: FoodItem[]): void {
    this.items.clear();
    items.forEach(item => {
      this.items.push(this.fb.group(item));
    });
  }

  newItem(): FormGroup {
    return this.fb.group({
      quantity: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  addItem(): void {
    this.items.push(this.newItem());
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  onSubmit(): void {
    if (this.mealForm.valid && this.patientId) {
      const formData = this.mealForm.value;
      if (this.isEditMode && this.mealId) {
        this.mealService.updateMealOption({ ...formData, id: this.mealId, patientId: this.patientId }).subscribe(() => {
          this.router.navigate(['/nutritionist/patients', this.patientId, 'meal-options']);
        });
      } else {
        this.mealService.addMealOption({ ...formData, patientId: this.patientId }).subscribe(() => {
          this.router.navigate(['/nutritionist/patients', this.patientId, 'meal-options']);
        });
      }
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.mealForm.get(field);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  goBack(): void {
    if (this.patientId) {
      this.router.navigate(['/nutritionist/patients', this.patientId, 'meal-options']);
    } else {
      this.router.navigate(['/nutritionist/patients']);
    }
  }
}
