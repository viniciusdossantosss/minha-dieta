import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterNutritionistComponent } from './pages/register-nutritionist/register-nutritionist.component';
import { TermsOfServiceComponent } from './pages/terms-of-service/terms-of-service.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { NutritionistDashboardComponent } from './pages/nutritionist-dashboard/nutritionist-dashboard.component';
import { PatientDashboardComponent } from './pages/patient-dashboard/patient-dashboard.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register-nutritionist', component: RegisterNutritionistComponent },
  { path: 'terms-of-service', component: TermsOfServiceComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'nutritionist/dashboard', component: NutritionistDashboardComponent },
  { path: 'patient/dashboard', component: PatientDashboardComponent },
  { path: 'home', redirectTo: '', pathMatch: 'full' },
];
