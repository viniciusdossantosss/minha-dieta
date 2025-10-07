import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DashboardLayoutComponent } from '../../shared/dashboard-layout/dashboard-layout.component';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/patient.model';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DashboardLayoutComponent],
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.css']
})
export class PatientFormComponent implements OnInit {
  patientForm!: FormGroup; // Usar definite assignment assertion
  isEditMode = false;
  pageTitle = 'Adicionar Novo Paciente';
  private patientId: number | null = null;

  userProfile: User | null = null; // Corrigido

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService // Injetado
  ) {
    // A inicialização do formulário será feita em ngOnInit após obter o userProfile
  }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      if (user && user.userType === 'nutritionist') {
        this.userProfile = user;
        this.initializeForm(user.id); // Inicializa o formulário com o ID do nutricionista
        this.loadPatientData(); // Carrega dados do paciente se estiver em modo de edição
      } else {
        // Redirecionar se não for nutricionista
        this.router.navigate(['/login']);
      }
    });
  }

  initializeForm(nutritionistId: number): void {
    this.patientForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      age: ['', [Validators.required, Validators.min(1)]],
      phone: [''],
      goal: ['', Validators.required],
      status: ['active', Validators.required],
      nutritionistId: [nutritionistId] // Adiciona o nutritionistId ao formulário
    });
  }

  loadPatientData(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id && this.userProfile) {
        this.isEditMode = true;
        this.patientId = +id;
        this.pageTitle = 'Editar Paciente';
        // Passa o nutritionistId para getPatientById
        this.patientService.getPatientById(this.patientId, this.userProfile.id).subscribe(patient => {
          if (patient) {
            this.patientForm.patchValue(patient);
          }
        });
      }
    });
  }

  onSubmit(): void {
    if (this.patientForm.valid && this.userProfile) {
      const formData = this.patientForm.value;

      if (this.isEditMode && this.patientId) {
        this.patientService.updatePatient({ ...formData, id: this.patientId }, this.patientId, this.userProfile.id).subscribe(() => {
          this.router.navigate(['/nutritionist/patients']);
        });
      } else {
        this.patientService.addPatient({ ...formData, nutritionistId: this.userProfile.id }).subscribe(() => {
          this.router.navigate(['/nutritionist/patients']);
        });
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/nutritionist/patients']);
  }
}