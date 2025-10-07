import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MealOption, MealType } from '../../models/meal.model';

@Component({
  selector: 'app-meal-selection-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meal-selection-modal.component.html',
  styleUrls: ['./meal-selection-modal.component.css']
})
export class MealSelectionModalComponent {
  isOpen = false;
  mealType: MealType | null = null;
  availableOptions: MealOption[] = [];
  selectedOption: MealOption | null = null;

  @Output() mealSelected = new EventEmitter<MealOption>();
  @Output() close = new EventEmitter<void>();

  constructor() {}

  open(mealType: MealType, patientId: number, assignedOptions: MealOption[]): void {
    this.mealType = mealType;
    this.isOpen = true;
    this.selectedOption = null;
    this.availableOptions = assignedOptions;
  }

  closeModal(): void {
    this.isOpen = false;
    this.close.emit();
  }

  selectOption(option: MealOption): void {
    this.selectedOption = option;
  }

  confirmSelection(): void {
    if (this.selectedOption) {
      this.mealSelected.emit(this.selectedOption);
      this.closeModal();
    }
  }
}
