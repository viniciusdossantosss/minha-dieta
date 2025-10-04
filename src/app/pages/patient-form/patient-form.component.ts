import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DashboardLayoutComponent } from '../../shared/dashboard-layout/dashboard-layout.component';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/patient.model';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DashboardLayoutComponent],
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.css']
})
export class PatientFormComponent implements OnInit {
  patientForm: FormGroup;
  isEditMode = false;
  pageTitle = 'Adicionar Novo Paciente';
  private patientId: number | null = null;

  // Mock UserProfile para o layout do dashboard
  userProfile = {
    id: 1, // ID do nutricionista simulado
    name: 'Juliana Sobral',
    type: 'nutritionist' as const,
    avatar: '/assets/default-avatar.png',
    email: 'juliana@minhadieta.com'
  };

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.patientForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      age: ['', [Validators.required, Validators.min(1)]],
      phone: [''],
      goal: ['', Validators.required],
      status: ['active', Validators.required],
      nutritionistId: [this.userProfile.id] // Adiciona o nutritionistId ao formulário
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
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
    if (this.patientForm.valid) {
      const formData = this.patientForm.value;

      if (this.isEditMode && this.patientId) {
        // Garante que nutritionistId esteja presente na atualização
        this.patientService.updatePatient({ ...formData, id: this.patientId, nutritionistId: this.userProfile.id }).subscribe(() => {
          this.router.navigate(['/nutritionist/patients']);
        });
      } else {
        // Garante que nutritionistId esteja presente na adição
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
