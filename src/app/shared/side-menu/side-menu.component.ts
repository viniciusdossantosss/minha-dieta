import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user.model'; // Importar User

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.css']
})
export class SideMenuComponent {
  @Input() isOpen = false;
  @Input() userProfile: User | null = null; // Aceitar User ou null
  
  @Output() menuClosed = new EventEmitter<void>();

  constructor(private router: Router) {}

  closeMenu(): void {
    this.menuClosed.emit();
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  logout(): void {
    // Aqui você implementará a lógica de logout
    console.log('Logout clicked');
    
    // Limpar dados do usuário (localStorage, sessionStorage, etc.)
    // localStorage.removeItem('user');
    // sessionStorage.clear();
    
    // Redirecionar para home
    this.router.navigate(['/']);
    this.closeMenu();
  }
}
