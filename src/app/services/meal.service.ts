import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MealOption, MealType } from '../models/meal.model';
import { HttpClient, HttpParams } from '@angular/common/http'; // Importar HttpClient e HttpParams
import { API_CONFIG } from '../config/api.config'; // Importar API_CONFIG

@Injectable({
  providedIn: 'root'
})
export class MealService {
  private baseUrl = API_CONFIG.baseUrl; // Base URL da API

  constructor(private http: HttpClient) { }

  // Modificado para aceitar patientId
  getMealOptions(patientId: number, type?: MealType): Observable<MealOption[]> {
    let params = new HttpParams().set('patientId', patientId.toString());
    if (type) {
      params = params.set('type', type);
    }
    return this.http.get<MealOption[]>(`${this.baseUrl}${API_CONFIG.endpoints.mealOptions}`, { params });
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