import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

type UserType = 'nutritionist' | 'patient';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUser$ = new BehaviorSubject<UserType | null>(null);

  constructor(private router: Router) {
    this.loadInitialUser();
  }

  private loadInitialUser(): void {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('currentUser') as UserType | null;
      if (user) {
        this.currentUser$.next(user);
      }
    }
  }

  login(userType: UserType): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', userType);
      this.currentUser$.next(userType);

      // Redireciona para o dashboard correspondente
      if (userType === 'nutritionist') {
        this.router.navigate(['/nutritionist/dashboard']);
      } else {
        this.router.navigate(['/patient/dashboard']);
      }
    }
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
      this.currentUser$.next(null);
      this.router.navigate(['/login']);
    }
  }

  isAuthenticated(): boolean {
    return this.currentUser$.value !== null;
  }

  getUserType(): UserType | null {
    return this.currentUser$.value;
  }

  getCurrentUser(): Observable<UserType | null> {
    return this.currentUser$.asObservable();
  }
}