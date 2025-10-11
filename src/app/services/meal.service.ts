import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MealOption, MealType } from '../models/meal.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class MealService {
  private baseUrl = API_CONFIG.baseUrl;

  constructor(private http: HttpClient) { }

  // Para opções de um paciente específico
  getMealOptions(patientId: number, type?: MealType): Observable<MealOption[]> {
    let params = new HttpParams().set('patientId', patientId.toString());
    if (type) {
      params = params.set('type', type);
    }
    return this.http.get<MealOption[]>(`${this.baseUrl}${API_CONFIG.endpoints.mealOptions}`, { params });
  }

  // Para todas as opções de um nutricionista
  getMealOptionsByNutritionist(nutritionistId: number, type?: MealType): Observable<MealOption[]> {
    let params = new HttpParams().set('nutritionistId', nutritionistId.toString());
    if (type) {
      params = params.set('type', type);
    }
    return this.http.get<MealOption[]>(`${this.baseUrl}${API_CONFIG.endpoints.mealOptions}/nutritionist`, { params });
  }

  getMealOptionById(id: number, patientId: number): Observable<MealOption> {
    const params = new HttpParams().set('patientId', patientId.toString());
    return this.http.get<MealOption>(`${this.baseUrl}${API_CONFIG.endpoints.mealOptions}/${id}`, { params });
  }

  addMealOption(mealData: Omit<MealOption, 'id'>): Observable<MealOption> {
    return this.http.post<MealOption>(`${this.baseUrl}${API_CONFIG.endpoints.mealOptions}`, mealData);
  }

  updateMealOption(updatedOption: MealOption): Observable<MealOption> {
    const params = new HttpParams().set('patientId', updatedOption.patientId.toString());
    return this.http.put<MealOption>(`${this.baseUrl}${API_CONFIG.endpoints.mealOptions}/${updatedOption.id}`, updatedOption, { params });
  }

  deleteMealOption(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${API_CONFIG.endpoints.mealOptions}/${id}`);
  }
}