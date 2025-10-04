import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../shared/dashboard-layout/dashboard-layout.component';

interface UserProfile {
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

interface Patient {
  id: number;
  name: string;
  age: number;
  avatar?: string;
  status: 'active' | 'inactive';
  lastUpdate: Date;
}

@Component({
  selector: 'app-nutritionist-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent],
  templateUrl: './nutritionist-dashboard.component.html',
  styleUrls: ['./nutritionist-dashboard.component.css']
})
export class NutritionistDashboardComponent implements OnInit {
  userProfile: UserProfile = {
    name: 'Juliana Sobral',
    type: 'nutritionist',
    avatar: '/assets/default-avatar.png',
    email: 'juliana@minhadieta.com'
  };

  stats: Stats = {
    totalPatients: 12,
    totalMenus: 28,
    weeklyActivity: 85
  };

  recentPatients: Patient[] = [
    {
      id: 1,
      name: 'Maria Silva',
      age: 32,
      status: 'active',
      lastUpdate: new Date()
    },
    {
      id: 2,
      name: 'João Santos',
      age: 28,
      status: 'active',
      lastUpdate: new Date()
    },
    {
      id: 3,
      name: 'Ana Costa',
      age: 45,
      status: 'inactive',
      lastUpdate: new Date()
    },
    {
      id: 4,
      name: 'Pedro Lima',
      age: 35,
      status: 'active',
      lastUpdate: new Date()
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Aqui você pode carregar dados reais do backend
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Simular carregamento de dados
    // Em um app real, você faria chamadas HTTP aqui
    console.log('Loading dashboard data...');
  }

  addNewPatient(): void {
    console.log('Add new patient clicked');
    // Navegar para página de adicionar paciente
    // this.router.navigate(['/nutritionist/patients/add']);
    alert('Funcionalidade "Adicionar Paciente" será implementada em breve!');
  }

  createMenu(): void {
    console.log('Create menu clicked');
    // Navegar para página de criar cardápio
    // this.router.navigate(['/nutritionist/meal-options/create']);
    alert('Funcionalidade "Criar Cardápio" será implementada em breve!');
  }

  viewReports(): void {
    console.log('View reports clicked');
    // Navegar para página de relatórios
    // this.router.navigate(['/nutritionist/reports']);
    alert('Funcionalidade "Relatórios" será implementada em breve!');
  }

  viewPatient(patientId: number): void {
    console.log('View patient:', patientId);
    // Navegar para detalhes do paciente
    // this.router.navigate(['/nutritionist/patients', patientId]);
    alert(`Ver detalhes do paciente ${patientId}`);
  }

  editMenu(patientId: number): void {
    console.log('Edit menu for patient:', patientId);
    // Navegar para editar cardápio do paciente
    // this.router.navigate(['/nutritionist/patients', patientId, 'menu']);
    alert(`Editar cardápio do paciente ${patientId}`);
  }

  getStatusText(status: 'active' | 'inactive'): string {
    return status === 'active' ? 'Ativo' : 'Inativo';
  }
}
