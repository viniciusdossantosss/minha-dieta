import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  constructor(private router: Router) { }

  navigateToLogin(userType: 'nutritionist' | 'patient'): void {
    // Navega para a página de login passando o tipo de usuário como parâmetro
    this.router.navigate(['/login'], { 
      queryParams: { type: userType } 
    });
  }

  navigateToRegister(): void {
    // Navega para a página de cadastro de nutricionista
    this.router.navigate(['/register-nutritionist']);
  }
}
