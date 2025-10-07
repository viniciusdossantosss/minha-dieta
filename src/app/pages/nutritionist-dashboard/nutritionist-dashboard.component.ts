import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../shared/dashboard-layout/dashboard-layout.component';
import { Patient } from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { DietPlansApiService } from '../../services/diet-plans-api.service'; // Importar DietPlansApiService
import { DietPlan } from '../../models/diet.model'; // Importar DietPlan

interface Stats {
  totalPatients: number;
  totalMenus: number;
  weeklyActivity: number;
}

@Component({
  selector: 'app-nutritionist-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent],
  templateUrl: './nutritionist-dashboard.component.html',
  styleUrls: ['./nutritionist-dashboard.component.css']
})
export class NutritionistDashboardComponent implements OnInit {
  userProfile: User | null = null;

  stats: Stats = {
    totalPatients: 0,
    totalMenus: 28, // Valor estático por enquanto
    weeklyActivity: 85 // Valor estático por enquanto
  };

  recentPatients: Patient[] = [];
  dietPlans: DietPlan[] = []; // Adicionar propriedade para planos de dieta

  constructor(
    private router: Router,
    private patientService: PatientService,
    private authService: AuthService,
    private dietPlansApiService: DietPlansApiService // Injetar DietPlansApiService
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      if (user && user.userType === 'nutritionist') {
        this.userProfile = user;
        this.loadDashboardData(user.id);
      } else {
        // Opcional: redirecionar se não for nutricionista
        this.router.navigate(['/login']);
      }
    });
  }

  loadDashboardData(nutritionistId: number): void {
    this.patientService.getPatients(nutritionistId).subscribe(patients => {
      this.recentPatients = [...patients]
        .sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime())
        .slice(0, 4);
      
      this.stats.totalPatients = patients.length;
    });

    this.dietPlansApiService.getDietPlansByNutritionist().subscribe((dietPlans: DietPlan[]) => {
      this.dietPlans = dietPlans;
      this.stats.totalMenus = dietPlans.length; // Atualiza o total de menus
      // Lógica para weeklyActivity pode ser adicionada aqui se houver dados relevantes nos planos de dieta
    });
  }

  addNewPatient(): void {
    this.router.navigate(['/nutritionist/patients/add']);
  }

  createMenu(): void {
    this.router.navigate(['/nutritionist/meal-options/add']);
  }

  viewPatient(patientId: number): void {
    this.router.navigate(['/nutritionist/patients', patientId]);
  }

  editMenu(patientId: number): void {
    alert(`Editar cardápio do paciente ${patientId}`);
  }

  getStatusText(status: 'active' | 'inactive'): string {
    return status === 'active' ? 'Ativo' : 'Inativo';
  }
}