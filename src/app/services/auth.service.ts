import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export type UserType = 'nutritionist' | 'patient';

export interface User {
  id: number;
  email: string;
  name: string;
  userType: UserType;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
} )
export class AuthService {
  private currentUser$ = new BehaviorSubject<User | null>(null);
  private baseUrl = API_CONFIG.baseUrl;

  constructor(private http: HttpClient, private router: Router ) {
    this.loadInitialUser();
  }

  private loadInitialUser(): void {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user_data');
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          this.currentUser$.next(user);
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error);
          this.logout();
        }
      }
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}${API_CONFIG.endpoints.auth.login}`, {
      email,
      password
    } ).pipe(
      tap(response => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('user_data', JSON.stringify(response.user));
          this.currentUser$.next(response.user);

          if (response.user.userType === 'nutritionist') {
            this.router.navigate(['/nutritionist/dashboard']);
          } else {
            this.router.navigate(['/patient/dashboard']);
          }
        }
      }),
      catchError(error => {
        console.error('Erro no login:', error);
        return throwError(() => error);
      })
    );
  }

  register(userData: {
    email: string;
    password: string;
    name: string;
    userType: UserType;
    crn?: string;
    phone?: string;
  }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}${API_CONFIG.endpoints.auth.register}`, userData ).pipe(
      tap(response => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('user_data', JSON.stringify(response.user));
          this.currentUser$.next(response.user);
        }
      }),
      catchError(error => {
        console.error('Erro no registro:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
      this.currentUser$.next(null);
      this.router.navigate(['/login']);
    }
  }

  isAuthenticated(): boolean {
    return this.currentUser$.value !== null && !!localStorage.getItem('access_token');
  }

  getUserType(): UserType | null {
    return this.currentUser$.value?.userType || null;
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUser$.asObservable();
  }

  getUser(): User | null {
    return this.currentUser$.value;
  }

  getToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  }
}
