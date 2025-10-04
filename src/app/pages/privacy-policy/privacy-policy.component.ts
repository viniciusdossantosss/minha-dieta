import { Component } from '@angular/core';
import { Location, CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.css']
})
export class PrivacyPolicyComponent {
  lastUpdated = '03 de Outubro de 2025';

  constructor(private location: Location) { }

  goBack(): void {
    this.location.back();
  }
}
