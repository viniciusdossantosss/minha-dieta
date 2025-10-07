import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterNutritionistComponent } from './pages/register-nutritionist/register-nutritionist.component';
import { TermsOfServiceComponent } from './pages/terms-of-service/terms-of-service.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { NutritionistDashboardComponent } from './pages/nutritionist-dashboard/nutritionist-dashboard.component';
import { PatientDashboardComponent } from './pages/patient-dashboard/patient-dashboard.component';
import { authGuard } from './guards/auth.guard';
import { PatientsComponent } from './pages/patients/patients.component';
import { PatientDetailComponent } from './pages/patient-detail/patient-detail.component';
import { PatientFormComponent } from './pages/patient-form/patient-form.component';
import { MealOptionsComponent } from './pages/meal-options/meal-options.component';
import { MealOptionFormComponent } from './pages/meal-option-form/meal-option-form.component';
import { ProfileComponent } from './pages/profile/profile.component'; // Importar ProfileComponent
import { PatientListComponent } from './pages/patient-list/patient-list.component';
import { DietPlanFormComponent } from './pages/diet-plan-form/diet-plan-form.component';
import { MealOptionListComponent } from './pages/meal-option-list/meal-option-list.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'nutritionist/diet-plans/create', component: DietPlanFormComponent }, // Rota para criar plano de dieta
  { path: 'nutritionist/diet-plans/:id/edit', component: DietPlanFormComponent }, // Rota para editar plano de dieta
  { path: 'login', component: LoginComponent },
  { path: 'register-nutritionist', component: RegisterNutritionistComponent },
  { path: 'terms-of-service', component: TermsOfServiceComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'nutritionist/patients', component: PatientListComponent },
  { path: 'nutritionist/meal-options', component: MealOptionListComponent }, // Rota para listar
  { path: 'nutritionist/meal-options/add', component: MealOptionFormComponent }, // Rota para adicionar
  { path: 'nutritionist/meal-options/:id/edit', component: MealOptionFormComponent }, // Rota para editar
  { path: 'nutritionist/patients/add', component: PatientFormComponent }, // Rota para adicionar paciente
  { path: 'nutritionist/patients/:id/edit', component: PatientFormComponent }, // Rota para editar paciente
  {
    path: 'nutritionist/dashboard',
    component: NutritionistDashboardComponent,
    canActivate: [authGuard],
    data: { userType: 'nutritionist' },
  },
  {
    path: 'nutritionist/profile',
    component: ProfileComponent,
    canActivate: [authGuard],
    data: { userType: 'nutritionist' },
  },
  {
    path: 'nutritionist/patients',
    component: PatientsComponent,
    canActivate: [authGuard],
    data: { userType: 'nutritionist' },
  },
  {
    path: 'nutritionist/patients/add',
    component: PatientFormComponent,
    canActivate: [authGuard],
    data: { userType: 'nutritionist' },
  },
  {
    path: 'nutritionist/patients/:id/edit',
    component: PatientFormComponent,
    canActivate: [authGuard],
    data: { userType: 'nutritionist' },
  },
  {
    path: 'nutritionist/patients/:id',
    component: PatientDetailComponent,
    canActivate: [authGuard],
    data: { userType: 'nutritionist' },
  },
  {
    path: 'nutritionist/patients/:patientId/meal-options',
    component: MealOptionsComponent,
    canActivate: [authGuard],
    data: { userType: 'nutritionist' },
  },
  {
    path: 'nutritionist/patients/:patientId/meal-options/add',
    component: MealOptionFormComponent,
    canActivate: [authGuard],
    data: { userType: 'nutritionist' },
  },
  {
    path: 'nutritionist/patients/:patientId/meal-options/:id/edit',
    component: MealOptionFormComponent,
    canActivate: [authGuard],
    data: { userType: 'nutritionist' },
  },
  {
    path: 'patient/dashboard',
    component: PatientDashboardComponent,
    canActivate: [authGuard],
    data: { userType: 'patient' },
  },
  {
    path: 'patient/profile',
    component: ProfileComponent,
    canActivate: [authGuard],
    data: { userType: 'patient' },
  },
  { path: 'home', redirectTo: '', pathMatch: 'full' },
];
