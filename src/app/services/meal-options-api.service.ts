import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { MealOption, MealType, MealItem } from '../models/meal.model'; // Importar MealOption, MealType e MealItem do modelo

@Injectable({
  providedIn: 'root'
} )
export class MealOptionsApiService {
  private baseUrl = API_CONFIG.baseUrl + API_CONFIG.endpoints.mealOptions;

  constructor(private http: HttpClient ) { }

  getMealOptions(patientId?: number, type?: MealType): Observable<MealOption[]> {
    let params = new HttpParams();
    if (patientId) {
      params = params.set('patientId', patientId.toString());
    }
    if (type) {
      params = params.set('type', type);
    }
    return this.http.get<MealOption[]>(this.baseUrl, { params } ).pipe(
      catchError(error => {
        console.error('Erro ao buscar opções de refeições:', error);
        return throwError(() => error);
      })
    );
  }

  getMealOption(id: number): Observable<MealOption> {
    return this.http.get<MealOption>(`${this.baseUrl}/${id}` ).pipe(
      catchError(error => {
        console.error('Erro ao buscar opção de refeição:', error);
        return throwError(() => error);
      })
    );
  }

  createMealOption(mealOption: {
    name: string;
    type: MealType;
    description?: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    items?: MealItem[];
  }): Observable<MealOption> {
    return this.http.post<MealOption>(this.baseUrl, mealOption ).pipe(
      catchError(error => {
        console.error('Erro ao criar opção de refeição:', error);
        return throwError(() => error);
      })
    );
  }

  updateMealOption(id: number, updates: Partial<MealOption>): Observable<MealOption> {
    return this.http.put<MealOption>(`${this.baseUrl}/${id}`, updates ).pipe(
      catchError(error => {
        console.error('Erro ao atualizar opção de refeição:', error);
        return throwError(() => error);
      })
    );
  }

  deleteMealOption(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}` ).pipe(
      catchError(error => {
        console.error('Erro ao deletar opção de refeição:', error);
        return throwError(() => error);
      })
    );
  }
}
