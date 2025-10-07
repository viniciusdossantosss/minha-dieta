import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DashboardLayoutComponent } from '../../shared/dashboard-layout/dashboard-layout.component';
import { Patient } from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

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

  userProfile: User | null = null; // Corrigido

  constructor(
    private patientService: PatientService,
    private router: Router,
    private authService: AuthService // Injetado
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      if (user && user.userType === 'nutritionist') {
        this.userProfile = user;
        this.loadPatients(user.id);
      } else {
        // Redirecionar se não for nutricionista
        this.router.navigate(['/login']);
      }
    });
  }

  loadPatients(nutritionistId: number): void {
    this.patientService.getPatients(nutritionistId).subscribe(patients => {
      this.allPatients = patients;
      this.filterPatients();
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
    if (confirm(`Tem certeza que deseja excluir o paciente?`) && this.userProfile) {
      this.patientService.deletePatient(patientId, this.userProfile.id).subscribe(() => {
        this.loadPatients(this.userProfile!.id); // Recarrega a lista
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
