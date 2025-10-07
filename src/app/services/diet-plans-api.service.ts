import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { DietPlan } from '../models/diet.model'; // Importar DietPlan do modelo
import { MealType, MealOption } from '../models/meal.model'; // Importar MealType e MealOption do modelo

@Injectable({
  providedIn: 'root'
} )
export class DietPlansApiService {
  private baseUrl = API_CONFIG.baseUrl + API_CONFIG.endpoints.dietPlans;

  constructor(private http: HttpClient ) { }

  createDietPlan(createDietPlanDto: {
    patientId: number;
    date: Date;
    mealType: MealType;
    mealOptions: { id: number }[]; // Usar array de IDs para mealOptions
    notes?: string;
    completed?: boolean;
  }): Observable<DietPlan> {
    return this.http.post<DietPlan>(this.baseUrl, createDietPlanDto ).pipe(
      catchError(error => {
        console.error('Erro ao criar plano de dieta:', error);
        return throwError(() => error);
      })
    );
  }

  getDietPlans(patientId?: number, date?: string): Observable<DietPlan[]> {
    let params = new HttpParams();
    if (patientId) params = params.set('patientId', patientId.toString());
    if (date) params = params.set('date', date);
    
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

  getDietPlansByNutritionist(): Observable<DietPlan[]> {
    return this.http.get<DietPlan[]>(this.baseUrl);
  }

  getDietPlanForWeek(date: string, patientId?: number): Observable<DietPlan[]> {
    let params = new HttpParams();
    if (patientId) {
      params = params.set('patientId', patientId.toString());
    }
    params = params.set('date', date); // Adicionar a data como parâmetro de query

    return this.http.get<DietPlan[]>(`${this.baseUrl}/week/${date}`, { params });
  }

  getDietPlan(id: number): Observable<DietPlan> {
    return this.http.get<DietPlan>(`${this.baseUrl}/${id}` ).pipe(
      catchError(error => {
        console.error('Erro ao buscar plano de dieta:', error);
        return throwError(() => error);
      })
    );
  }

  updateDietPlan(id: number, updates: {
    patientId?: number;
    date?: Date;
    mealType?: MealType;
    mealOptions?: { id: number }[];
    notes?: string;
    completed?: boolean;
  }): Observable<DietPlan> {
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
