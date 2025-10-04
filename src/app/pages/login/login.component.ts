import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location, CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  userType: 'nutritionist' | 'patient' = 'nutritionist';
  showPassword = false;
  isLoading = false;
  loginError = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {
    // Inicializar o formulário
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Capturar o tipo de usuário da URL
    this.route.queryParams.subscribe(params => {
      if (params['type']) {
        this.userType = params['type'];
      }
    });
  }

  switchUserType(type: 'nutritionist' | 'patient'): void {
    this.userType = type;
    // Limpar erros quando trocar de tipo
    this.loginError = '';
    
    // Opcional: Atualizar a URL para refletir a mudança
    this.router.navigate(['/login'], { 
      queryParams: { type: type },
      replaceUrl: true 
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  goBack(): void {
    this.location.back();
  }

  goToRegister(): void {
    this.router.navigate(['/register-nutritionist']);
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.loginError = '';

      const { email, password } = this.loginForm.value;

      // Simular chamada de API
      setTimeout(() => {
        // Aqui você fará a chamada real para seu backend
        console.log('Login attempt:', { email, password, userType: this.userType });
        
        // Por enquanto, vamos simular um login bem-sucedido
        if (email && password) {
          // Redirecionar baseado no tipo de usuário
          if (this.userType === 'nutritionist') {
            this.router.navigate(['/nutritionist/dashboard']);
          } else {
            this.router.navigate(['/patient/dashboard']);
          }
        } else {
          this.loginError = 'Email ou senha inválidos';
        }
        
        this.isLoading = false;
      }, 1500);
    } else {
      // Marcar todos os campos como touched para mostrar erros
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }
}
