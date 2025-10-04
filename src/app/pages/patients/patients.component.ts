import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DashboardLayoutComponent } from '../../shared/dashboard-layout/dashboard-layout.component';
import { Patient } from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent, FormsModule],
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
})
export class PatientsComponent implements OnInit {
  allPatients: Patient[] = [];
  filteredPatients: Patient[] = [];
  searchTerm = '';

  // Mock UserProfile para o layout do dashboard
  userProfile = {
    id: 1, // ID do nutricionista simulado
    name: 'Juliana Sobral',
    type: 'nutritionist' as const,
    avatar: '/assets/default-avatar.png',
    email: 'juliana@minhadieta.com'
  };

  constructor(private patientService: PatientService, private router: Router) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.patientService.getPatients(this.userProfile.id).subscribe(patients => {
      this.allPatients = patients;
      this.filterPatients(); // Aplica o filtro atual à nova lista
    });
  }

  filterPatients(): void {
    if (!this.searchTerm) {
      this.filteredPatients = this.allPatients;
      return;
    }
    this.filteredPatients = this.allPatients.filter(patient =>
      patient.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  viewPatient(patientId: number): void {
    this.router.navigate(['/nutritionist/patients', patientId]);
  }

  editPatient(patientId: number): void {
    this.router.navigate(['/nutritionist/patients', patientId, 'edit']);
  }

  deletePatient(patientId: number): void {
    if (confirm(`Tem certeza que deseja excluir o paciente?`)) {
      this.patientService.deletePatient(patientId, this.userProfile.id).subscribe(success => {
        if (success) {
          // Recarrega a lista de pacientes para refletir a exclusão
          this.loadPatients();
        }
      });
    }
  }

  addNewPatient(): void {
    this.router.navigate(['/nutritionist/patients/add']);
  }

  getStatusText(status: 'active' | 'inactive'): string {
    return status === 'active' ? 'Ativo' : 'Inativo';
  }
}