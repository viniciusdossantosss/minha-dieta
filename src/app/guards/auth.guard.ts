import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedUserType = route.data['userType'] as 'nutritionist' | 'patient';
  const currentUserType = authService.getUserType();

  if (!authService.isAuthenticated()) {
    // Se não estiver autenticado, redireciona para o login
    router.navigate(['/login']);
    return false;
  }

  if (expectedUserType && currentUserType !== expectedUserType) {
    // Se estiver autenticado, mas não for o tipo de usuário correto,
    // redireciona para o dashboard do tipo de usuário atual ou para o login
    if (currentUserType === 'nutritionist') {
      router.navigate(['/nutritionist/dashboard']);
    } else if (currentUserType === 'patient') {
      router.navigate(['/patient/dashboard']);
    } else {
      router.navigate(['/login']);
    }
    return false;
  }

  // Se estiver autenticado e for o tipo de usuário correto, permite o acesso
  return true;
};
