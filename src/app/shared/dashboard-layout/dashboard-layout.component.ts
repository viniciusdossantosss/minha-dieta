import { Component, Input, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SideMenuComponent } from '../side-menu/side-menu.component';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, SideMenuComponent],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.css']
})
export class DashboardLayoutComponent implements OnInit {
  @Input() pageTitle = 'Dashboard';
  @Input() userProfile: User | null = null;

  isSideMenuOpen = false;
  isDesktop = false;

  ngOnInit(): void {
    this.checkScreenWidth(window.innerWidth);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkScreenWidth((event.target as Window).innerWidth);
  }

  private checkScreenWidth(width: number): void {
    this.isDesktop = width >= 768;
    this.isSideMenuOpen = this.isDesktop;
  }

  toggleSideMenu(): void {
    if (!this.isDesktop) {
      this.isSideMenuOpen = !this.isSideMenuOpen;
    }
  }

  closeSideMenu(): void {
    if (!this.isDesktop) {
      this.isSideMenuOpen = false;
    }
  }
}
