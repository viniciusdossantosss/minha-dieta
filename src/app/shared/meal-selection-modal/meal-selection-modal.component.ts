import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 

// Importe as interfaces necessárias do seu PatientDashboardComponent.
// ATENÇÃO: Verifique este caminho. Ele assume que a pasta 'pages' e 'shared'
// estão no mesmo nível sob 'app'. Ajuste se sua estrutura for diferente.
import { PatientMealOption, ModalMealData } from '../../pages/patient-dashboard/patient-dashboard.component'; 

@Component({
  selector: 'app-meal-selection-modal',
  standalone: true, // <-- Mantenha esta linha
  imports: [CommonModule], // <-- Mantenha esta linha
  templateUrl: './meal-selection-modal.component.html',
  styleUrls: ['./meal-selection-modal.component.css']
})
export class MealSelectionModalComponent implements OnInit {

  @Input() isOpen: boolean = false;
  @Input() mealData: ModalMealData | null = null; // Usa ModalMealData
  @Input() availableOptions: PatientMealOption[] = []; // Usa PatientMealOption

  // O EventEmitter agora emitirá PatientMealOption, que é a interface esperada pelo dashboard
  @Output() mealSelected = new EventEmitter<{ mealType: string, option: PatientMealOption }>();
  @Output() close = new EventEmitter<void>();

  selectedOption: PatientMealOption | null = null; // Usa PatientMealOption

  constructor() { }

  ngOnInit(): void {
    // Só carrega mock options se não houver opções passadas pelo Input
    // E se mealData estiver presente para saber o tipo de refeição
    if (this.availableOptions.length === 0 && this.mealData) {
      this.loadMockOptions();
    }
  }

  loadMockOptions() {
    // As IDs e o formato devem corresponder à interface PatientMealOption (id: number, ingredients: string[])
    if (this.mealData?.mealType === 'breakfast') {
      this.availableOptions = [
        { id: 101, name: 'Omelete com Espinafre', description: 'Omelete feito com ovos frescos, espinafre e queijo cottage.', calories: 250, ingredients: ['Ovo', 'Espinafre', 'Queijo Cottage'] },
        { id: 102, name: 'Smoothie de Frutas', description: 'Smoothie refrescante com frutas vermelhas, banana e iogurte natural.', calories: 200, ingredients: ['Frutas Vermelhas', 'Banana', 'Iogurte Natural'] },
        { id: 103, name: 'Torrada Integral com Abacate', description: 'Torrada de pão integral com pasta de abacate e temperos.', calories: 180, ingredients: ['Pão Integral', 'Abacate', 'Limão', 'Sal', 'Pimenta'] }
      ];
    } else if (this.mealData?.mealType === 'lunch') {
      this.availableOptions = [
        { id: 201, name: 'Salmão Grelhado c/ Quinoa', description: 'Salmão grelhado suculento acompanhado de quinoa e vegetais variados.', calories: 450, ingredients: ['Salmão', 'Quinoa', 'Brócolis', 'Cenoura'] },
        { id: 202, name: 'Frango Assado c/ Batata Doce', description: 'Peito de frango assado com ervas finas e batata doce assada.', calories: 400, ingredients: ['Frango', 'Batata Doce', 'Alecrim', 'Tomilho'] },
        { id: 203, name: 'Lasanha de Berinjela', description: 'Versão mais leve da lasanha, com camadas de berinjela, molho de tomate e queijo.', calories: 380, ingredients: ['Berinjela', 'Tomate', 'Queijo Light', 'Manjericão'] }
      ];
    } else if (this.mealData?.mealType === 'dinner') {
      this.availableOptions = [
        { id: 301, name: 'Sopa de Legumes', description: 'Sopa nutritiva com diversos legumes frescos e temperos naturais.', calories: 300, ingredients: ['Cenoura', 'Abobrinha', 'Batata', 'Couve', 'Caldo de Legumes'] },
        { id: 302, name: 'Wrap de Frango Light', description: 'Wrap integral recheado com frango desfiado, alface e molho de iogurte.', calories: 350, ingredients: ['Tortilha Integral', 'Frango Desfiado', 'Alface', 'Iogurte Natural'] },
        { id: 303, name: 'Salada Colorida com Grãos', description: 'Mix de folhas, grão de bico, lentilha, tomate e pepino com molho de limão.', calories: 320, ingredients: ['Alface', 'Grão de Bico', 'Lentilha', 'Tomate', 'Pepino', 'Limão'] }
      ];
    } else if (this.mealData?.mealType === 'snack') {
      this.availableOptions = [
        { id: 401, name: 'Mix de Castanhas', description: 'Porção de castanhas variadas (amêndoas, castanha de caju, nozes).', calories: 150, ingredients: ['Amêndoas', 'Castanha de Caju', 'Nozes'] },
        { id: 402, name: 'Fruta Fresca', description: 'Uma porção de fruta fresca da estação.', calories: 80, ingredients: ['Maçã'] },
        { id: 403, name: 'Iogurte Natural', description: 'Iogurte natural sem açúcar.', calories: 120, ingredients: ['Iogurte Natural'] }
      ];
    }
  }

  selectOption(option: PatientMealOption): void {
    this.selectedOption = option;
    console.log('Opção selecionada na modal:', this.selectedOption);
  }

  confirmSelection(): void {
    if (this.selectedOption && this.mealData) {
      this.mealSelected.emit({ mealType: this.mealData.mealType, option: this.selectedOption });
      console.log('Refeição confirmada na modal:', this.selectedOption);
      this.closeModal();
    } else {
      console.warn('Nenhuma opção selecionada ou mealData ausente na modal.');
    }
  }

  closeModal(): void {
    this.isOpen = false;
    this.selectedOption = null;
    this.close.emit();
  }
}