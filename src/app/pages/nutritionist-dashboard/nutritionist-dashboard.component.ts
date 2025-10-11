import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Observable, of, forkJoin, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

// Shared Components and Services
import { DashboardLayoutComponent } from '../../shared/dashboard-layout/dashboard-layout.component';
import { PatientService } from '../../services/patient.service';
import { AuthService } from '../../services/auth.service';
import { DietPlansApiService } from '../../services/diet-plans-api.service';

// Models
import { Patient } from '../../models/patient.model';
import { User } from '../../models/user.model';

interface DashboardStats {
  totalPatients: number;
  totalDietPlans: number;
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DashboardLayoutComponent,
  ],
  templateUrl: './nutritionist-dashboard.component.html',
  styleUrls: ['./nutritionist-dashboard.component.css']
})
export class NutritionistDashboardComponent implements OnInit, OnDestroy {
  userProfile: User | null = null;
  stats: DashboardStats = { totalPatients: 0, totalDietPlans: 0 };
  recentPatients: Patient[] = [];
  private subscriptions = new Subscription();

  constructor(
    private patientService: PatientService,
    private authService: AuthService,
    private dietPlansApiService: DietPlansApiService, // Corrigido para DietPlansApiService
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(this.authService.getCurrentUser().subscribe((user) => {
      if (user && user.userType === 'nutritionist') {
        this.userProfile = user;
        this.loadDashboardData(user.id);
      } else {
        console.error('Usuário não é um nutricionista ou não está logado.');
        this.router.navigate(['/login']);
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadDashboardData(nutritionistId: number): void {
    const patients$ = this.patientService.getPatients(nutritionistId);
    const dietPlans$ = this.dietPlansApiService.getDietPlansByNutritionist();

    this.subscriptions.add(forkJoin([patients$, dietPlans$]).pipe(
      map(([patients, dietPlans]) => ({
        totalPatients: patients.length,
        totalDietPlans: dietPlans.length,
      }))
    ).subscribe(stats => {
      this.stats = stats;
    }));

    this.subscriptions.add(patients$.pipe(
      map((patients) => patients.sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime()).slice(0, 3))
    ).subscribe(recentPatients => {
      this.recentPatients = recentPatients;
    }));
  }

  addNewPatient(): void {
    this.router.navigate(['/nutritionist/patients/add']);
  }

  createDietPlan(): void {
    this.router.navigate(['/nutritionist/diet-plans/create']);
  }

  manageMealOptions(): void {
    this.router.navigate(['/nutritionist/meal-options']);
  }

  viewPatientDetails(patientId: number): void {
    this.router.navigate(['/nutritionist/patients', patientId]);
  }

  editPatientProfile(patientId: number): void {
    this.router.navigate(['/nutritionist/patients', patientId, 'edit']);
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Ativo' : 'Inativo';
  }
}
