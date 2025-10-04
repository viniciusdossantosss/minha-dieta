import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../shared/dashboard-layout/dashboard-layout.component';

// Importe sua modal (standalone component)
import { MealSelectionModalComponent } from '../../shared/meal-selection-modal/meal-selection-modal.component';

// --- INTERFACES: Refinadas e centralizadas ---
// Mantidas aqui conforme sua solicitação.

interface UserProfile {
  name: string;
  type: 'nutritionist' | 'patient';
  avatar?: string;
  email?: string;
}

// Interface MealOption para o dashboard e para a modal (agora o mesmo tipo)
export interface PatientMealOption { // EXPORTADO para ser usado pela modal
  id: number; // Alterado para number para corresponder aos mocks
  name: string;
  description: string;
  ingredients: string[];
  calories?: number;
  imageUrl?: string; // Adicionado da modal
}

// Interface MealData da modal - para passar dados para a modal
export interface ModalMealData { // EXPORTADO para ser usado pela modal
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string; // Ex: 'Café da Manhã'
  icon: string;
  timeSlot: string; // Ex: 'Manhã', 'Almoço', 'Noite' ou o nome da refeição
}

// Interface para um slot de refeição, seja no "Hoje" ou no "Planejador Semanal"
interface PatientMealSlot {
  id: string; // Ex: 'cafe-manha-hoje', 'almoco-segunda'
  name: string; // Ex: 'Café da Manhã', 'Almoço'
  icon: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'; // Tipo para a modal
  status: 'completed' | 'pending';
  selectedOption?: PatientMealOption; // A opção de refeição que foi selecionada
  availableOptions: PatientMealOption[]; // Opções específicas para este slot (se precisar)
}

interface DayMeals {
  id: string; // 'day-0', 'day-1', etc.
  name: string; // 'Dom', 'Seg'
  date: string; // '01'
  fullDate: Date; // A data completa para navegação
  meals: PatientMealSlot[];
}

interface WeeklyProgress {
  completed: number;
  pending: number;
  total: number;
  percentage: number;
}
// --- FIM DAS INTERFACES ---


@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    DashboardLayoutComponent,
    MealSelectionModalComponent // <--- IMPORTANTE: Adicione sua modal aqui!
  ],
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.css']
})
export class PatientDashboardComponent implements OnInit {
  userProfile: UserProfile = {
    name: 'Maria Silva',
    type: 'patient',
    avatar: '/assets/default-avatar.png',
    email: 'maria@teste.com'
  };

  currentWeekStart = new Date(); // Início da semana sendo exibida
  
  todayMeals: PatientMealSlot[] = [];
  weekDays: DayMeals[] = [];
  weeklyProgress: WeeklyProgress = {
    completed: 0,
    pending: 0,
    total: 0,
    percentage: 0
  };

  // --- PROPRIEDADES PARA O CONTROLE DA MODAL ---
  isMealModalOpen: boolean = false;
  currentMealData: ModalMealData | null = null;
  availableMealOptionsForModal: PatientMealOption[] = []; // Passado para a modal, se quiser sobrescrever as mocks dela
  
  // Variáveis para saber qual slot está sendo editado ao confirmar na modal
  private editingMealSlotId: string | null = null;
  private editingDayId: string | null = null; // 'today' para refeições de hoje, ou 'day-X' para o planner
  // --- FIM DAS PROPRIEDADES DA MODAL ---

  // Dados simulados de opções de refeições (usados para popular os slots)
  private allMealOptions: { [key: string]: PatientMealOption[] } = {
    breakfast: [
      {
        id: 1,
        name: 'Aveia com Frutas',
        description: 'Aveia, banana, morango e mel. Rico em fibras e energia.',
        ingredients: ['Aveia', 'Banana', 'Morango', 'Leite', 'Mel'],
        calories: 320
      },
      {
        id: 2,
        name: 'Pão Integral com Abacate',
        description: 'Duas fatias de pão integral com pasta de abacate e ovo cozido.',
        ingredients: ['Pão Integral', 'Abacate', 'Ovo', 'Sal', 'Pimenta'],
        calories: 280
      },
      {
        id: 3,
        name: 'Smoothie Verde',
        description: 'Refrescante smoothie com espinafre, banana, maçã e água de coco.',
        ingredients: ['Espinafre', 'Banana', 'Maçã', 'Água de Coco'],
        calories: 180
      }
    ],
    lunch: [
      {
        id: 4,
        name: 'Salada de Frango Grelhado',
        description: 'Frango grelhado com mix de folhas verdes, tomate cereja, pepino e molho leve.',
        ingredients: ['Peito de Frango', 'Alface', 'Rúcula', 'Tomate', 'Pepino', 'Azeite'],
        calories: 350
      },
      {
        id: 5,
        name: 'Salmão Assado com Quinoa e Legumes',
        description: 'Filé de salmão assado com quinoa colorida e legumes no vapor.',
        ingredients: ['Salmão', 'Quinoa', 'Brócolis', 'Cenoura', 'Azeite'],
        calories: 420
      },
      {
        id: 6,
        name: 'Wrap de Carne Magra',
        description: 'Tortilha integral com carne desfiada, alface, cenoura ralada e molho de iogurte.',
        ingredients: ['Tortilha Integral', 'Carne Desfiada', 'Alface', 'Cenoura', 'Iogurte Natural'],
        calories: 380
      }
    ],
    dinner: [
      {
        id: 7,
        name: 'Sopa Cremosa de Abóbora',
        description: 'Sopa leve e nutritiva de abóbora com gengibre e temperos frescos.',
        ingredients: ['Abóbora', 'Cenoura', 'Gengibre', 'Caldo de Legumes'],
        calories: 180
      },
      {
        id: 8,
        name: 'Omelete de Vegetais',
        description: 'Omelete com ovos frescos, espinafre, tomate e queijo cottage.',
        ingredients: ['Ovo', 'Espinafre', 'Tomate', 'Queijo Cottage'],
        calories: 220
      },
      {
        id: 9,
        name: 'Mini Sanduíches de Peito de Peru',
        description: 'Pães sírios pequenos com peito de peru, queijo branco e alface.',
        ingredients: ['Pão Sírio', 'Peito de Peru', 'Queijo Branco', 'Alface'],
        calories: 250
      }
    ],
    snack: [
      {
        id: 10,
        name: 'Mix de Castanhas',
        description: 'Porção de castanhas variadas: amêndoas, castanha de caju e nozes.',
        ingredients: ['Amêndoas', 'Castanha de Caju', 'Nozes'],
        calories: 150
      },
      {
        id: 11,
        name: 'Fruta Fresca',
        description: 'Uma porção de fruta fresca da estação, rica em vitaminas.',
        ingredients: ['Maçã' /* ou outra fruta */],
        calories: 80
      },
      {
        id: 12,
        name: 'Iogurte Natural',
        description: 'Iogurte natural sem açúcar com um toque de mel.',
        ingredients: ['Iogurte Natural', 'Mel'],
        calories: 120
      }
    ]
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.initializeWeek();
    this.loadTodayMeals(); // Carrega as refeições do dia atual com base na semana inicializada
    this.calculateProgress();
  }

  initializeWeek(): void {
    const today = new Date();
    // Ajusta para o início da semana (Domingo = 0, Segunda = 1, etc.)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - (today.getDay() + 6) % 7); // Início na segunda-feira

    this.currentWeekStart = startOfWeek;

    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    this.weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      this.weekDays.push({
        id: `day-${i}`, // day-0 para segunda, day-1 para terça, etc.
        name: dayNames[(i + 1) % 7], // Ajusta para 'Seg' ser o primeiro (i=0)
        date: date.getDate().toString().padStart(2, '0'),
        fullDate: date,
        meals: this.createDayMeals(`day-${i}`)
      });
    }
  }

  createDayMeals(dayId: string): PatientMealSlot[] {
    const getRandomOption = (mealType: string): PatientMealOption | undefined => {
      const options = this.allMealOptions[mealType] as PatientMealOption[];
      return options && options.length > 0 && Math.random() > 0.7 ? options[Math.floor(Math.random() * options.length)] : undefined;
    };

    return [
      {
        id: `${dayId}-breakfast`,
        name: 'Café da Manhã',
        icon: '☕',
        mealType: 'breakfast',
        status: 'pending',
        selectedOption: getRandomOption('breakfast'),
        availableOptions: this.allMealOptions['breakfast']
      },
      {
        id: `${dayId}-lunch`,
        name: 'Almoço',
        icon: '🍽️',
        mealType: 'lunch',
        status: 'pending',
        selectedOption: getRandomOption('lunch'),
        availableOptions: this.allMealOptions['lunch']
      },
      {
        id: `${dayId}-dinner`,
        name: 'Jantar',
        icon: '🍜',
        mealType: 'dinner',
        status: 'pending',
        selectedOption: getRandomOption('dinner'),
        availableOptions: this.allMealOptions['dinner']
      },
      {
        id: `${dayId}-snack`,
        name: 'Lanche',
        icon: '🍎',
        mealType: 'snack',
        status: 'pending',
        selectedOption: getRandomOption('snack'),
        availableOptions: this.allMealOptions['snack']
      }
    ];
  }

  loadTodayMeals(): void {
    const today = new Date();
    // Encontra o dia correspondente na weekDays pela fullDate
    const todayDay = this.weekDays.find(day => 
      day.fullDate.getDate() === today.getDate() &&
      day.fullDate.getMonth() === today.getMonth() &&
      day.fullDate.getFullYear() === today.getFullYear()
    );
    this.todayMeals = todayDay?.meals || [];
    this.updateMealStatuses(); // Atualiza status e progresso inicial
  }

  calculateProgress(): void {
    let completed = 0;
    let total = 0;

    // Contar refeições do planejador semanal
    this.weekDays.forEach(day => {
      day.meals.forEach(meal => {
        total++;
        if (meal.selectedOption) {
          completed++;
        }
      });
    });
    
    this.weeklyProgress = {
      completed,
      pending: total - completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }

  // Novo método para atualizar os status das refeições e recalcular o progresso
  updateMealStatuses(): void {
    // Percorre todas as refeições e define o status baseado na seleção
    this.weekDays.forEach(day => {
      day.meals.forEach(meal => {
        meal.status = meal.selectedOption ? 'completed' : 'pending';
      });
    });
    // Garante que o todayMeals reflita os status atualizados (pois são referências)
    this.loadTodayMeals(); 
    this.calculateProgress(); // Recalcula o progresso após a atualização dos status
  }

  getTodayDate(): string {
    const today = new Date();
    return today.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  }

  getCurrentWeekDisplay(): string {
    const endOfWeek = new Date(this.currentWeekStart);
    endOfWeek.setDate(this.currentWeekStart.getDate() + 6);
    
    return `${this.currentWeekStart.getDate().toString().padStart(2, '0')}/${(this.currentWeekStart.getMonth() + 1).toString().padStart(2, '0')} - ${endOfWeek.getDate().toString().padStart(2, '0')}/${(endOfWeek.getMonth() + 1).toString().padStart(2, '0')}`;
  }

  getStatusText(status: 'completed' | 'pending'): string {
    return status === 'completed' ? 'Escolhido' : 'Pendente';
  }

  // --- MÉTODOS PARA ABRIR A MODAL ---
  selectMealOption(mealSlotId: string, dayId: string): void {
    this.editingMealSlotId = mealSlotId;
    this.editingDayId = dayId; // Pode ser 'day-X' ou 'today'

    let targetMealSlot: PatientMealSlot | undefined;

    // Encontra o slot de refeição correto para passar os dados
    if (dayId === 'today') {
        targetMealSlot = this.todayMeals.find(meal => meal.id === mealSlotId);
    } else {
        const targetDay = this.weekDays.find(day => day.id === dayId);
        targetMealSlot = targetDay?.meals.find(meal => meal.id === mealSlotId);
    }

    if (targetMealSlot) {
        // Prepara os dados para a modal
        this.currentMealData = {
            mealType: targetMealSlot.mealType,
            name: targetMealSlot.name,
            icon: targetMealSlot.icon,
            timeSlot: targetMealSlot.name // Exemplo: "Café da Manhã"
        };
        // Passa as opções específicas para a modal. Se este array estiver vazio,
        // a modal usará as suas próprias opções mockadas.
        this.availableMealOptionsForModal = this.allMealOptions[targetMealSlot.mealType] || [];
        this.isMealModalOpen = true; // Abre a modal
    } else {
        console.warn(`[Dashboard] Slot de refeição com ID ${mealSlotId} no dia ${dayId} não encontrado.`);
    }
  }

  // --- MÉTODO CHAMADO QUANDO UMA REFEIÇÃO É SELECIONADA NA MODAL ---
  onMealSelected(event: { mealType: string; option: PatientMealOption }): void {
    const { option } = event; // Pega a opção selecionada

    if (this.editingMealSlotId && this.editingDayId) {
      // Sempre atualiza na lista 'weekDays' (que é a fonte principal de dados)
      const targetDay = this.weekDays.find(day => day.id === this.editingDayId);
      if (targetDay) {
        const mealToUpdate = targetDay.meals.find(m => m.id === this.editingMealSlotId);
        if (mealToUpdate) {
          mealToUpdate.selectedOption = option;
          mealToUpdate.status = 'completed'; // Marca como completada
          console.log(`[Dashboard] Refeição '${mealToUpdate.name}' atualizada para '${option.name}'.`);
        }
      }
      
      this.updateMealStatuses(); // Recalcula o progresso e atualiza os status visuais
      // Aqui você faria a chamada a um serviço para salvar a seleção no backend
      // this.mealService.saveMealSelection(this.editingMealSlotId, option.id, this.editingDayId);
    } else {
      console.warn('[Dashboard] Nenhuma refeição ou dia estava em edição ao tentar confirmar a seleção.');
    }
    this.closeMealModal(); // Fecha a modal
  }

  // --- MÉTODO PARA FECHAR A MODAL ---
  closeMealModal(): void {
    this.isMealModalOpen = false;
    this.currentMealData = null;
    this.availableMealOptionsForModal = []; // Limpa as opções para a próxima abertura
    this.editingMealSlotId = null; // Reseta o ID do slot em edição
    this.editingDayId = null; // Reseta o ID do dia em edição
    console.log('[Dashboard] Modal de seleção de refeição fechada.');
  }
  // --- FIM DOS MÉTODOS DA MODAL ---

  previousWeek(): void {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
    this.initializeWeek();
    this.loadTodayMeals(); // Recarrega as refeições de hoje para a nova semana
    this.calculateProgress();
  }

  nextWeek(): void {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
    this.initializeWeek();
    this.loadTodayMeals(); // Recarrega as refeições de hoje para a nova semana
    this.calculateProgress();
  }

  viewNutritionistContact(): void {
    console.log('Navegar para Contato Nutricionista');
    // `
  }

  viewMealHistory(): void {
    console.log('Navegar para Histórico de Refeições');
    // `
  }

  viewProgress(): void {
    console.log('Navegar para Progresso do Paciente');
    // `
  }
}