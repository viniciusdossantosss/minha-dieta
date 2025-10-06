import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
} )
export class ErrorHandlerService {
  constructor(private snackBar: MatSnackBar) {}

  handleError(error: any): void {
    let message = 'Ocorreu um erro inesperado';

    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 0:
          message = 'Erro de conexão. Verifique sua internet e tente novamente.';
          break;
        case 400:
          message = error.error?.message || 'Dados inválidos fornecidos.';
          break;
        case 401:
          message = 'Credenciais inválidas ou sessão expirada.';
          break;
        case 403:
          message = 'Você não tem permissão para realizar esta ação.';
          break;
        case 404:
          message = 'Recurso não encontrado.';
          break;
        case 409:
          message = error.error?.message || 'Conflito de dados.';
          break;
        case 422:
          message = 'Dados fornecidos são inválidos.';
          break;
        case 500:
          message = 'Erro interno do servidor. Tente novamente mais tarde.';
          break;
        default:
          message = `Erro ${error.status}: ${error.error?.message || error.message}`;
      }
    } else if (error?.message) {
      message = error.message;
    }

    this.showError(message);
    console.error('Erro capturado:', error);
  }

  showError(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  showSuccess(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  showInfo(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 4000,
      panelClass: ['info-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
