import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = API_CONFIG.baseUrl;

  constructor(private http: HttpClient) { }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/profile`);
  }

  // Modificado para aceitar FormData
  updateProfile(id: number, userData: FormData): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/users/profile`, userData);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/${id}`);
  }
}