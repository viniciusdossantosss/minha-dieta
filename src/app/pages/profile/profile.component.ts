import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DashboardLayoutComponent } from '../../shared/dashboard-layout/dashboard-layout.component';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { PatientService } from '../../services/patient.service';
import { UserService } from '../../services/user.service';
import { Patient } from '../../models/patient.model'; // Importar Patient model

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DashboardLayoutComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  userProfile: User | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  selectedFile: File | null = null; // Para o arquivo de upload

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private patientService: PatientService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userProfile = user;
        this.initializeForm(user);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  initializeForm(user: User): void {
    this.profileForm = this.fb.group({
      name: [user.name || '', Validators.required],
      email: [user.email || '', [Validators.required, Validators.email]],
      phone: [user.phone || ''],
      photoUrl: [user.photoUrl || '', Validators.pattern(/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i)],
      // Campos específicos para nutricionista
      crn: [user.crn || ''],
      // Campos específicos para paciente (ex: age, weight, height, goal)
      age: [user.age || ''],
      weight: [user.weight || ''],
      height: [user.height || ''],
      goal: [user.goal || ''],
    });
  }

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      this.selectedFile = fileList[0];
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid && this.userProfile) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const rawFormData = this.profileForm.value; // Dados brutos do formulário
      const formDataToSend = new FormData();

      // Adicionar o arquivo de foto, se selecionado
      if (this.selectedFile) {
        formDataToSend.append('photo', this.selectedFile, this.selectedFile.name);
      }

      if (this.userProfile.userType === 'nutritionist') {
        // Filtrar campos relevantes para User
        const userFields: (keyof User)[] = ['name', 'email', 'phone', 'photoUrl', 'crn'];
        userFields.forEach(key => {
          const value = rawFormData[key];
          if (value !== null && value !== undefined) {
            // Se photoUrl está sendo enviado via arquivo, não adicionar o valor do input de texto
            if (key === 'photoUrl' && this.selectedFile) return;
            formDataToSend.append(key, value);
          }
        });

        this.userService.updateProfile(this.userProfile.id, formDataToSend).subscribe({
          next: (updatedUser) => {
            this.authService.updateCurrentUser(updatedUser); // Atualiza o usuário no AuthService
            this.successMessage = 'Perfil atualizado com sucesso!';
            this.isLoading = false;
            this.selectedFile = null; // Limpar o arquivo selecionado
          },
          error: (err) => {
            this.errorMessage = err.error?.message || 'Erro ao atualizar perfil.';
            this.isLoading = false;
          }
        });
      } else if (this.userProfile.userType === 'patient') {
        // Filtrar campos relevantes para Patient
        const patientFields: (keyof Patient)[] = ['name', 'email', 'phone', 'photoUrl', 'age', 'weight', 'height', 'goal'];
        patientFields.forEach(key => {
          const value = rawFormData[key];
          if (value !== null && value !== undefined) {
            // Se photoUrl está sendo enviado via arquivo, não adicionar o valor do input de texto
            if (key === 'photoUrl' && this.selectedFile) return;
            formDataToSend.append(key, value);
          }
        });

        this.patientService.updatePatient(formDataToSend, this.userProfile.id).subscribe({
          next: (updatedPatient) => {
            if (updatedPatient) { // Verificar se updatedPatient não é undefined
              // Mapear updatedPatient para User antes de atualizar no AuthService
              const userFromPatient: User = {
                id: updatedPatient.id,
                email: updatedPatient.email || '',
                name: updatedPatient.name,
                userType: 'patient',
                photoUrl: updatedPatient.photoUrl,
                phone: updatedPatient.phone,
                age: updatedPatient.age,
                goal: updatedPatient.goal,
              };
              this.authService.updateCurrentUser(userFromPatient);
              this.successMessage = 'Perfil atualizado com sucesso!';
            } else {
              this.errorMessage = 'Erro ao atualizar perfil: dados não retornados.';
            }
            this.isLoading = false;
            this.selectedFile = null; // Limpar o arquivo selecionado
          },
          error: (err) => {
            this.errorMessage = err.error?.message || 'Erro ao atualizar perfil.';
            this.isLoading = false;
          }
        });
      }
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
