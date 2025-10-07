import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { DailyMealChoice } from '../models/daily-meal-choice.model';
import { MealType } from '../models/meal.model';

export interface CreateDailyMealChoiceDto {
  date: string;
  mealType: MealType;
  mealOptionId: number;
}

@Injectable({
  providedIn: 'root',
})
export class DailyMealChoiceApiService {
  private baseUrl = API_CONFIG.baseUrl + API_CONFIG.endpoints.dailyMealChoices;

  constructor(private http: HttpClient) {}

  createOrUpdateDailyMealChoice(dto: CreateDailyMealChoiceDto): Observable<DailyMealChoice> {
    return this.http.post<DailyMealChoice>(this.baseUrl, dto).pipe(
      catchError((error) => {
        console.error('Erro ao criar/atualizar escolha diária de refeição:', error);
        return throwError(() => error);
      }),
    );
  }

  getDailyMealChoicesByPatientAndWeek(patientId: number, date: string): Observable<DailyMealChoice[]> {
    let params = new HttpParams();
    params = params.set('date', date);

    return this.http.get<DailyMealChoice[]>(`${this.baseUrl}/patient/${patientId}/date/${date}`, { params }).pipe(
      catchError((error) => {
        console.error('Erro ao buscar escolhas diárias de refeição:', error);
        return throwError(() => error);
      }),
    );
  }
}
