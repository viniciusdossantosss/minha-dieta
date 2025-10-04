import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../shared/dashboard-layout/dashboard-layout.component';
import { Patient } from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';

interface UserProfile {
  id: number; // ID do nutricionista
  name: string;
  type: 'nutritionist' | 'patient';
  avatar?: string;
  email?: string;
}

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
  // Simula um perfil de nutricionista logado
  userProfile: UserProfile = {
    id: 1, 
    name: 'Juliana Sobral',
    type: 'nutritionist',
    avatar: '/assets/default-avatar.png',
    email: 'juliana@minhadieta.com'
  };

  stats: Stats = {
    totalPatients: 0, // Será atualizado dinamicamente
    totalMenus: 28,
    weeklyActivity: 85
  };

  recentPatients: Patient[] = [];

  constructor(private router: Router, private patientService: PatientService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Carrega apenas os pacientes do nutricionista logado
    this.patientService.getPatients(this.userProfile.id).subscribe(patients => {
      // Pega os 4 pacientes mais recentes baseados na data de atualização
      this.recentPatients = [...patients]
        .sort((a, b) => b.lastUpdate.getTime() - a.lastUpdate.getTime())
        .slice(0, 4);
      
      this.stats.totalPatients = patients.length;
    });
  }

  addNewPatient(): void {
    this.router.navigate(['/nutritionist/patients/add']);
  }

  createMenu(): void {
    this.router.navigate(['/nutritionist/meal-options/add']);
  }

  viewPatient(patientId: number): void {
    // Navegar para detalhes do paciente
    this.router.navigate(['/nutritionist/patients', patientId]);
  }

  editMenu(patientId: number): void {
    // Navegar para editar cardápio do paciente
    // this.router.navigate(['/nutritionist/patients', patientId, 'menu']);
    alert(`Editar cardápio do paciente ${patientId}`);
  }

  getStatusText(status: 'active' | 'inactive'): string {
    return status === 'active' ? 'Ativo' : 'Inativo';
  }
}
