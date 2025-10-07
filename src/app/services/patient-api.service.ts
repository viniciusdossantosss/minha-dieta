import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { Patient } from '../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientApiService {
  private baseUrl = API_CONFIG.baseUrl + API_CONFIG.endpoints.patients;

  constructor(private http: HttpClient) { }

  getPatientById(patientId: number, nutritionistId: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.baseUrl}/${patientId}`).pipe(
      catchError(error => {
        console.error('Erro ao buscar paciente por ID:', error);
        return throwError(() => error);
      })
    );
  }

  getPatientsByNutritionist(nutritionistId: number): Observable<Patient[]> {
    return this.http.get<Patient[]>(this.baseUrl, { params: { nutritionistId: nutritionistId.toString() } }).pipe(
      catchError(error => {
        console.error('Erro ao buscar pacientes por nutricionista:', error);
        return throwError(() => error);
      })
    );
  }

  // Adicione outros métodos conforme necessário (create, update, delete)
}
