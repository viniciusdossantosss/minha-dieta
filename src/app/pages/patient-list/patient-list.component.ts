import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table'; // Para exibir a lista de pacientes
import { MatPaginatorModule } from '@angular/material/paginator'; // Para paginação
import { MatSortModule } from '@angular/material/sort'; // Para ordenação
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog'; // Para modais de confirmação, se necessário

// Services
import { PatientService } from '../../services/patient.service';
import { AuthService } from '../../services/auth.service';

// Models
import { Patient } from '../../models/patient.model';
import { User } from '../../models/user.model';
import { MatTableDataSource } from '@angular/material/table';
import { ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.css'],
})
export class PatientListComponent implements OnInit {
  userProfile: User | null = null;
  dataSource = new MatTableDataSource<Patient>();
  displayedColumns: string[] = ['name', 'email', 'phone', 'birthDate', 'isActive', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private patientService: PatientService,
    private authService: AuthService,
    private router: Router,
    public dialog: MatDialog
  ) {}

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
    this.patientService.getPatients(nutritionistId).subscribe((patients) => {
      this.dataSource.data = patients;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
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
    // TODO: Implementar modal de confirmação antes de deletar
    if (confirm('Tem certeza que deseja deletar este paciente?')) {
      if (this.userProfile) {
        this.patientService.deletePatient(patientId, this.userProfile.id).subscribe(() => {
          if (this.userProfile) { // Adicionar esta verificação
            this.loadPatients(this.userProfile.id);
          }
        });
      }
    }
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Ativo' : 'Inativo';
  }
}
