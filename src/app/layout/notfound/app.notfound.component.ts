import { Component, inject } from '@angular/core';
import { AppConfigService } from '../../../services/appconfigservice';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-notfound',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule],
  templateUrl: './app.notfound.component.html',
})
export class AppNotfoundComponent {
  configService = inject(AppConfigService);

  getLogoSrc(): string {
    return this.isDarkMode
      ? 'https://my-fyp-s3-bucket.s3.eu-west-2.amazonaws.com/sca-official-logo.png'
      : 'https://my-fyp-s3-bucket.s3.eu-west-2.amazonaws.com/sca-official-logo.png';
  }

  get isDarkMode(): boolean {
    return this.configService.appState().darkTheme;
  }
}
