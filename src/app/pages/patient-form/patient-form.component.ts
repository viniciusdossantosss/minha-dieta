import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

// Services
import { PatientService } from '../../services/patient.service';
import { AuthService } from '../../services/auth.service';

// Models
import { Patient } from '../../models/patient.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.css'],
})
export class PatientFormComponent implements OnInit, OnDestroy {
  patientForm!: FormGroup;
  isEditMode: boolean = false;
  patientId: number | null = null;
  nutritionistId: number | null = null;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.subscriptions.add(this.authService.getCurrentUser().subscribe(user => {
      if (user && user.userType === 'nutritionist') {
        this.nutritionistId = user.id;
        this.subscriptions.add(this.route.paramMap.subscribe(params => {
          const id = params.get('id');
          if (id) {
            this.patientId = +id;
            this.isEditMode = true;
            if (this.nutritionistId) {
              this.loadPatientData(this.patientId, this.nutritionistId);
            }
          }
        }));
      } else {
        console.error('Usuário não é um nutricionista ou não está logado.');
        this.router.navigate(['/login']);
      }
    }));
  }

  initForm(): void {
    this.patientForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      birthDate: [null],
      weight: [null],
      height: [null],
      gender: [''],
      medicalHistory: [''],
      allergies: [''],
      dietaryRestrictions: [''],
      isActive: [true, Validators.required],
    });
  }

  loadPatientData(id: number, nutritionistId: number): void {
    this.subscriptions.add(this.patientService.getPatientById(id, nutritionistId).subscribe(patient => {
      this.patientForm.patchValue({
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        birthDate: patient.birthDate ? new Date(patient.birthDate) : null, // Converte string para Date
        weight: patient.weight,
        height: patient.height,
        gender: patient.gender,
        medicalHistory: patient.medicalHistory,
        allergies: patient.allergies,
        dietaryRestrictions: patient.dietaryRestrictions,
        isActive: patient.isActive,
      });
    }));
  }

  onSubmit(): void {
    if (this.patientForm.valid && this.nutritionistId !== null) {
      const patientData = { ...this.patientForm.value, nutritionistId: this.nutritionistId };

      // Formata a data de nascimento para o backend (ISO string)
      if (patientData.birthDate) {
        patientData.birthDate = new Date(patientData.birthDate).toISOString().split('T')[0]; // Backend espera string 'YYYY-MM-DD'
      }

      if (this.isEditMode && this.patientId) {
        // Para updatePatient, ainda usamos FormData para suportar upload de foto
        const formData = new FormData();
        for (const key in patientData) {
          if (patientData.hasOwnProperty(key) && patientData[key] !== null) {
            formData.append(key, patientData[key]);
          }
        }
        // nutritionistId já está no patientData, que foi adicionado ao formData

        this.subscriptions.add(this.patientService.updatePatient(formData, this.patientId, this.nutritionistId).subscribe(() => {
          alert('Paciente atualizado com sucesso!');
          this.router.navigate(['/nutritionist/patients']);
        }, error => {
          console.error('Erro ao atualizar paciente:', error);
          alert('Erro ao atualizar paciente.');
        }));
      } else {
        // Para addPatient, passamos um objeto simples
        this.subscriptions.add(this.patientService.addPatient(patientData).subscribe(() => {
          alert('Paciente adicionado com sucesso!');
          this.router.navigate(['/nutritionist/patients']);
        }, error => {
          console.error('Erro ao adicionar paciente:', error);
          alert('Erro ao adicionar paciente.');
        }));
      }
    } else {
      alert('Por favor, preencha todos os campos obrigatórios.');
    }
  }

  onCancel(): void {
    this.router.navigate(['/nutritionist/patients']);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
