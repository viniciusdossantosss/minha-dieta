import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DashboardLayoutComponent } from '../../shared/dashboard-layout/dashboard-layout.component';
import { MealService } from '../../services/meal.service';
import { MealType, MealOption, FoodItem } from '../../models/meal.model';

@Component({
  selector: 'app-meal-option-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DashboardLayoutComponent],
  templateUrl: './meal-option-form.component.html',
  styleUrls: ['./meal-option-form.component.css']
})
export class MealOptionFormComponent implements OnInit {
  mealForm: FormGroup;
  isEditMode = false;
  pageTitle = 'Criar Nova Opção de Refeição';
  mealTypes: MealType[] = ['Café da Manhã', 'Lanche da Manhã', 'Almoço', 'Lanche da Tarde', 'Jantar', 'Ceia'];
  private mealId: number | null = null;

  userProfile = {
    name: 'Juliana Sobral',
    type: 'nutritionist' as const,
    avatar: '/assets/default-avatar.png',
    email: 'juliana@minhadieta.com'
  };

  constructor(
    private fb: FormBuilder,
    private mealService: MealService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.mealForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      type: ['', Validators.required],
      items: this.fb.array([], Validators.required)
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.mealId = +id;
        this.pageTitle = 'Editar Opção de Refeição';
        this.mealService.getMealOptionById(this.mealId).subscribe(meal => {
          if (meal) {
            this.mealForm.patchValue({ name: meal.name, type: meal.type });
            this.setItems(meal.items);
          }
        });
      }
    });

    if (!this.isEditMode) {
      this.addItem(); // Começa com um item se for modo de criação
    }
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
    if (this.mealForm.valid) {
      const formData = this.mealForm.value;
      if (this.isEditMode && this.mealId) {
        this.mealService.updateMealOption({ ...formData, id: this.mealId }).subscribe(() => {
          this.router.navigate(['/nutritionist/meal-options']);
        });
      } else {
        this.mealService.addMealOption(formData).subscribe(() => {
          this.router.navigate(['/nutritionist/meal-options']);
        });
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/nutritionist/meal-options']);
  }
}
