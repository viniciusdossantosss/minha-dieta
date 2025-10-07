import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SideMenuComponent } from '../side-menu/side-menu.component';
import { User } from '../../models/user.model'; // Importar User

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, SideMenuComponent],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.css']
})
export class DashboardLayoutComponent {
  @Input() pageTitle = 'Dashboard';
  @Input() userProfile: User | null = null; // Aceitar User ou null

  isSideMenuOpen = false;

  toggleSideMenu(): void {
    this.isSideMenuOpen = !this.isSideMenuOpen;
  }

  closeSideMenu(): void {
    this.isSideMenuOpen = false;
  }
}
