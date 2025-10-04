import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Patient } from '../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  // Mock data - agora com nutritionistId
  private patients: Patient[] = [
    {
      id: 1,
      name: 'Maria Silva',
      age: 32,
      status: 'active',
      lastUpdate: new Date('2025-09-28'),
      email: 'maria.silva@example.com',
      goal: 'Perder 5kg',
      nutritionistId: 1
    },
    {
      id: 2,
      name: 'João Santos',
      age: 28,
      status: 'active',
      lastUpdate: new Date('2025-10-01'),
      email: 'joao.santos@example.com',
      goal: 'Ganhar massa muscular',
      nutritionistId: 1
    },
    {
      id: 3,
      name: 'Ana Costa',
      age: 45,
      status: 'inactive',
      lastUpdate: new Date('2025-08-15'),
      email: 'ana.costa@example.com',
      goal: 'Manter peso atual',
      nutritionistId: 2
    },
    {
      id: 4,
      name: 'Pedro Lima',
      age: 35,
      status: 'active',
      lastUpdate: new Date('2025-09-30'),
      email: 'pedro.lima@example.com',
      goal: 'Melhorar alimentação',
      nutritionistId: 1
    },
    {
      id: 5,
      name: 'Carla Souza',
      age: 29,
      status: 'active',
      lastUpdate: new Date('2025-10-02'),
      email: 'carla.souza@example.com',
      goal: 'Preparação para maratona',
      nutritionistId: 2
    },
    {
      id: 6,
      name: 'Fernando Andrade',
      age: 50,
      status: 'inactive',
      lastUpdate: new Date('2025-07-20'),
      email: 'fernando.andrade@example.com',
      goal: 'Controle de diabetes',
      nutritionistId: 1
    }
  ];

  constructor() { }

  // Retorna pacientes de um nutricionista específico
  getPatients(nutritionistId: number): Observable<Patient[]> {
    const filteredPatients = this.patients.filter(p => p.nutritionistId === nutritionistId);
    return of(filteredPatients);
  }

  // Retorna um paciente pelo ID, verificando se pertence ao nutricionista
  getPatientById(id: number, nutritionistId: number): Observable<Patient | undefined> {
    const patient = this.patients.find(p => p.id === id && p.nutritionistId === nutritionistId);
    return of(patient);
  }

  // Deleta um paciente pelo ID, verificando se pertence ao nutricionista
  deletePatient(id: number, nutritionistId: number): Observable<boolean> {
    const patientIndex = this.patients.findIndex(p => p.id === id && p.nutritionistId === nutritionistId);
    if (patientIndex > -1) {
      this.patients.splice(patientIndex, 1);
      return of(true);
    }
    return of(false);
  }

  // Adiciona um novo paciente (o nutritionistId virá no patientData)
  addPatient(patientData: Omit<Patient, 'id' | 'lastUpdate'>): Observable<Patient> {
    const newId = this.patients.length > 0 ? Math.max(...this.patients.map(p => p.id)) + 1 : 1;
    
    const newPatient: Patient = {
      ...patientData,
      id: newId,
      lastUpdate: new Date(),
    };

    this.patients.push(newPatient);
    return of(newPatient);
  }

  // Atualiza um paciente existente
  updatePatient(updatedPatient: Patient): Observable<Patient | undefined> {
    const patientIndex = this.patients.findIndex(p => p.id === updatedPatient.id && p.nutritionistId === updatedPatient.nutritionistId);
    if (patientIndex > -1) {
      this.patients[patientIndex] = { ...this.patients[patientIndex], ...updatedPatient, lastUpdate: new Date() };
      return of(this.patients[patientIndex]);
    }
    return of(undefined);
  }
}