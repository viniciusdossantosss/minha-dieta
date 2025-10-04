import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'minha-dieta';
  currentRoute = '';

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
      }
    });
  }

  shouldShowGlobalHeader(): boolean {
    // Mostrar header global apenas nas páginas públicas
    const publicRoutes = ['/', '/login', '/register-nutritionist', '/terms-of-service', '/privacy-policy'];
    return publicRoutes.includes(this.currentRoute) || 
           this.currentRoute.startsWith('/login') || 
           this.currentRoute === '/home';
  }
}
