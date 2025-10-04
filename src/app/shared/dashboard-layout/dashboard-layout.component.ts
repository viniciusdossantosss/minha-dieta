import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SideMenuComponent } from '../side-menu/side-menu.component';

interface UserProfile {
  name: string;
  type: 'nutritionist' | 'patient';
  avatar?: string;
  email?: string;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, SideMenuComponent],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.css']
})
export class DashboardLayoutComponent {
  @Input() pageTitle = 'Dashboard';
  @Input() userProfile: UserProfile = {
    name: 'Juliana Sobral',
    type: 'nutritionist',
    avatar: '/assets/default-avatar.png'
  };

  isSideMenuOpen = false;

  toggleSideMenu(): void {
    this.isSideMenuOpen = !this.isSideMenuOpen;
  }

  closeSideMenu(): void {
    this.isSideMenuOpen = false;
  }
}
