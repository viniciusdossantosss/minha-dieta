import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Location, CommonModule } from '@angular/common';

@Component({
  selector: 'app-register-nutritionist',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register-nutritionist.component.html',
  styleUrls: ['./register-nutritionist.component.css']
})
export class RegisterNutritionistComponent implements OnInit {
  registerForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  registerError = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private location: Location
  ) {
    // Inicializar o formulário com validações
    this.registerForm = this.formBuilder.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      crn: ['', [Validators.required, this.crnValidator]],
      phone: ['', [Validators.required, this.phoneValidator]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {}

  // Validador customizado para CRN
  crnValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    // Formato: 12345/SP ou 12345-SP
    const crnPattern = /^\d{4,6}[\/\-][A-Z]{2}$/;
    return crnPattern.test(control.value) ? null : { pattern: true };
  }

  // Validador customizado para telefone
  phoneValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    // Remove caracteres não numéricos para validação
    const phoneNumbers = control.value.replace(/\D/g, '');
    // Aceita 10 ou 11 dígitos (com ou sem 9 no celular)
    return phoneNumbers.length >= 10 && phoneNumbers.length <= 11 ? null : { pattern: true };
  }

  // Validador para confirmação de senha
  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (!password || !confirmPassword) return null;
    
    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      // Remove o erro se as senhas coincidirem
      if (confirmPassword.errors?.['passwordMismatch']) {
        delete confirmPassword.errors['passwordMismatch'];
        if (Object.keys(confirmPassword.errors).length === 0) {
          confirmPassword.setErrors(null);
        }
      }
    }
    
    return null;
  }

  // Formatar telefone automaticamente
  formatPhone(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
      if (value.length <= 2) {
        value = value.replace(/(\d{0,2})/, '($1');
      } else if (value.length <= 6) {
        value = value.replace(/(\d{2})(\d{0,4})/, '($1) $2');
      } else if (value.length <= 10) {
        value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
      } else {
        value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
      }
    }
    
    event.target.value = value;
    this.registerForm.get('phone')?.setValue(value);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  goBack(): void {
    this.location.back();
  }

  goToLogin(): void {
    this.router.navigate(['/login'], { queryParams: { type: 'nutritionist' } });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.registerError = '';

      const formData = this.registerForm.value;
      
      // Remover confirmPassword antes de enviar
      const { confirmPassword, ...registrationData } = formData;

      // Simular chamada de API
      setTimeout(() => {
        console.log('Registration data:', registrationData);
        
        // Simular sucesso
        alert('Cadastro realizado com sucesso! Você será redirecionado para o login.');
        this.router.navigate(['/login'], { queryParams: { type: 'nutritionist' } });
        
        this.isLoading = false;
      }, 2000);
    } else {
      // Marcar todos os campos como touched para mostrar erros
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      
      this.registerError = 'Por favor, corrija os erros no formulário.';
    }
  }
}
