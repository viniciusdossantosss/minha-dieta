import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Services
import { PatientService } from '../../services/patient.service';
import { AuthService } from '../../services/auth.service';

// Models
import { Patient } from '../../models/patient.model';
import { User } from '../../models/user.model';

// Layout
import { DashboardLayoutComponent } from '../../shared/dashboard-layout/dashboard-layout.component';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    DashboardLayoutComponent,
  ],
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.css']
})
export class PatientListComponent implements OnInit {
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  userProfile: User | null = null;
  searchTerm: string = '';

  constructor(
    private patientService: PatientService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe((user) => {
      if (user && user.userType === 'nutritionist') {
        this.userProfile = user;
        this.loadPatients(user.id);
      } else {
        console.error('Usuário não é um nutricionista ou não está logado.');
        this.router.navigate(['/login']);
      }
    });
  }

  loadPatients(nutritionistId: number): void {
    this.patientService.getPatients(nutritionistId).subscribe((patients: Patient[]) => {
      this.patients = patients;
      this.filteredPatients = [...patients];
    });
  }

  applyFilter(): void {
    const searchTerm = this.searchTerm.toLowerCase().trim();
    if (searchTerm) {
      this.filteredPatients = this.patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm) ||
        (patient.email && patient.email.toLowerCase().includes(searchTerm)) ||
        (patient.phone && patient.phone.toLowerCase().includes(searchTerm))
      );
    } else {
      this.filteredPatients = [...this.patients];
    }
  }

  addNewPatient(): void {
    this.router.navigate(['/nutritionist/patients/add']);
  }

  viewPatientDetails(patientId: number): void {
    this.router.navigate(['/nutritionist/patients', patientId]);
  }

  editPatientProfile(patientId: number): void {
    this.router.navigate(['/nutritionist/patients', patientId, 'edit']);
  }

  createDietPlan(patientId: number): void {
    this.router.navigate(['/nutritionist/diet-plans/create', { patientId: patientId }]);
  }

  deletePatient(patientId: number): void {
    if (confirm('Tem certeza que deseja deletar este paciente?')) {
      if (this.userProfile) {
        this.patientService.deletePatient(patientId, this.userProfile.id).subscribe(() => {
          if (this.userProfile) {
            this.loadPatients(this.userProfile.id);
          }
        });
      }
    }
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Ativo' : 'Inativo';
  }

  formatDate(date: string | Date | null | undefined): string {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('pt-BR');
  }
}
