import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { MealType, MealOption } from './meal-options-api.service';
import { PatientAPI } from './patient-api.service';

export interface DietPlan {
  id: number;
  date: Date;
  mealType: MealType;
  notes?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  patientId: number;
  mealOptionId: number;
  patient?: PatientAPI;
  mealOption?: MealOption;
}

@Injectable({
  providedIn: 'root'
} )
export class DietPlansApiService {
  private baseUrl = API_CONFIG.baseUrl + API_CONFIG.endpoints.dietPlans;

  constructor(private http: HttpClient ) { }

  getDietPlans(patientId?: number, date?: string): Observable<DietPlan[]> {
    const params: any = {};
    if (patientId) params.patientId = patientId;
    if (date) params.date = date;
    
    return this.http.get<DietPlan[]>(this.baseUrl, { params } ).pipe(
      catchError(error => {
        console.error('Erro ao buscar planos de dieta:', error);
        return throwError(() => error);
      })
    );
  }

  getDietPlansByPatient(patientId: number): Observable<DietPlan[]> {
    return this.http.get<DietPlan[]>(`${this.baseUrl}/patient/${patientId}` ).pipe(
      catchError(error => {
        console.error('Erro ao buscar planos do paciente:', error);
        return throwError(() => error);
      })
    );
  }

  getWeeklyDietPlans(date: string, patientId?: number): Observable<DietPlan[]> {
    const params = patientId ? { patientId } : {};
    return this.http.get<DietPlan[]>(`${this.baseUrl}/week/${date}`, { params } ).pipe(
      catchError(error => {
        console.error('Erro ao buscar planos da semana:', error);
        return throwError(() => error);
      })
    );
  }

  getDietPlan(id: number): Observable<DietPlan> {
    return this.http.get<DietPlan>(`${this.baseUrl}/${id}` ).pipe(
      catchError(error => {
        console.error('Erro ao buscar plano de dieta:', error);
        return throwError(() => error);
      })
    );
  }

  createDietPlan(dietPlan: {
    patientId: number;
    date: Date;
    mealType: MealType;
    mealOptionId: number;
    notes?: string;
    completed?: boolean;
  }): Observable<DietPlan> {
    return this.http.post<DietPlan>(this.baseUrl, dietPlan ).pipe(
      catchError(error => {
        console.error('Erro ao criar plano de dieta:', error);
        return throwError(() => error);
      })
    );
  }

  updateDietPlan(id: number, updates: Partial<DietPlan>): Observable<DietPlan> {
    return this.http.put<DietPlan>(`${this.baseUrl}/${id}`, updates ).pipe(
      catchError(error => {
        console.error('Erro ao atualizar plano de dieta:', error);
        return throwError(() => error);
      })
    );
  }

  deleteDietPlan(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}` ).pipe(
      catchError(error => {
        console.error('Erro ao deletar plano de dieta:', error);
        return throwError(() => error);
      })
    );
  }
}
