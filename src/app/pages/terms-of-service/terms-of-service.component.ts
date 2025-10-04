import { Component } from '@angular/core';
import { Location, CommonModule } from '@angular/common';

@Component({
  selector: 'app-terms-of-service',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './terms-of-service.component.html',
  styleUrls: ['./terms-of-service.component.css']
})
export class TermsOfServiceComponent {
  lastUpdated = '03 de Outubro de 2025';

  constructor(private location: Location) { }

  goBack(): void {
    this.location.back();
  }
}
