import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Patient } from '../models/patient.model';
import { HttpClient, HttpParams } from '@angular/common/http'; // Importar HttpClient e HttpParams
import { API_CONFIG } from '../config/api.config'; // Importar API_CONFIG

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private baseUrl = API_CONFIG.baseUrl; // Base URL da API

  constructor(private http: HttpClient) { }

  // Retorna pacientes de um nutricionista específico
  getPatients(nutritionistId: number): Observable<Patient[]> {
    const params = new HttpParams().set('nutritionistId', nutritionistId.toString());
    return this.http.get<Patient[]>(`${this.baseUrl}${API_CONFIG.endpoints.patients}`, { params });
  }

  // Retorna um paciente pelo ID, verificando se pertence ao nutricionista
  getPatientById(id: number, nutritionistId: number): Observable<Patient> {
    const params = new HttpParams().set('nutritionistId', nutritionistId.toString());
    return this.http.get<Patient>(`${this.baseUrl}${API_CONFIG.endpoints.patients}/${id}`, { params });
  }

  // Deleta um paciente pelo ID, verificando se pertence ao nutricionista
  deletePatient(id: number, nutritionistId: number): Observable<void> {
    const params = new HttpParams().set('nutritionistId', nutritionistId.toString());
    return this.http.delete<void>(`${this.baseUrl}${API_CONFIG.endpoints.patients}/${id}`, { params });
  }

  // Adiciona um novo paciente (o nutritionistId virá no patientData)
  addPatient(patientData: Omit<Patient, 'id' | 'lastUpdate'>): Observable<Patient> {
    return this.http.post<Patient>(`${this.baseUrl}${API_CONFIG.endpoints.patients}`, patientData);
  }

  // Atualiza um paciente existente
  updatePatient(patientData: FormData, patientId: number, nutritionistId?: number): Observable<Patient> {
    let params = new HttpParams();
    if (nutritionistId) {
      params = params.set('nutritionistId', nutritionistId.toString());
    }
    return this.http.put<Patient>(`${this.baseUrl}${API_CONFIG.endpoints.patients}/${patientId}`, patientData, { params });
  }
}