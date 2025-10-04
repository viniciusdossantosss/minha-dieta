import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location, CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

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
    private location: Location,
    private authService: AuthService
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

      // Usar o AuthService para fazer o login
      // Por enquanto, a validação de email/senha é simulada.
      // A lógica real de API viria aqui antes de chamar o serviço.
      const { email, password } = this.loginForm.value;

      if (email && password) {
        this.authService.login(this.userType);
      } else {
        // Simulação de erro
        this.loginError = 'Email ou senha inválidos';
        this.isLoading = false;
      }
    } else {
      // Marcar todos os campos como touched para mostrar erros
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }
}
