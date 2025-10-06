import { Component, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit {

  @ViewChild('bgVideo') bgVideo!: ElementRef<HTMLVideoElement>;
  private userInteracted = false;

  constructor(private router: Router) { }

  @HostListener('window:click')
  onUserInteraction() {
    if (!this.userInteracted) {
      this.playVideo();
      this.userInteracted = true;
    }
  }

  ngAfterViewInit(): void {
    this.playVideo();
  }

  private playVideo(): void {
    if (this.bgVideo?.nativeElement?.paused) {
      this.bgVideo.nativeElement.play().catch(error => {
        // This warning is expected on some browsers until the user interacts.
        console.warn('Comando de play do vídeo foi bloqueado pelo navegador:', error);
      });
    }
  }

  navigateToLogin(userType: 'nutritionist' | 'patient'): void {
    // Navega para a página de login passando o tipo de usuário como parâmetro
    this.router.navigate(['/login'], { 
      queryParams: { type: userType } 
    });
  }

  navigateToRegister(): void {
    // Navega para a página de cadastro de nutricionista
    this.router.navigate(['/register-nutritionist']);
  }
}
