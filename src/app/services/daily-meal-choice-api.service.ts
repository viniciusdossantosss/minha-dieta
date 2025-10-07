import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { DailyMealChoice } from '../models/daily-meal-choice.model';

@Injectable({
  providedIn: 'root'
} )
export class DailyMealChoiceService {
  private baseUrl = `${API_CONFIG.baseUrl}/daily-meal-choices`;

  constructor(private http: HttpClient ) { }

  // Novo método para buscar escolhas diárias por paciente
  getDailyMealChoicesByPatient(patientId: number): Observable<DailyMealChoice[]> {
    return this.http.get<DailyMealChoice[]>(`${this.baseUrl}/patient/${patientId}` );
  }

  getDailyMealChoiceById(id: number): Observable<DailyMealChoice> {
    return this.http.get<DailyMealChoice>(`${this.baseUrl}/${id}` );
  }

  addDailyMealChoice(dailyMealChoice: Partial<DailyMealChoice>): Observable<DailyMealChoice> {
    return this.http.post<DailyMealChoice>(this.baseUrl, dailyMealChoice );
  }

  updateDailyMealChoice(id: number, dailyMealChoice: Partial<DailyMealChoice>): Observable<DailyMealChoice> {
    return this.http.put<DailyMealChoice>(`${this.baseUrl}/${id}`, dailyMealChoice );
  }

  deleteDailyMealChoice(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}` );
  }
}
