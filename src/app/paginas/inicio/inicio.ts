import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-inicio',
  styleUrl: './inicio.css',
  templateUrl: './inicio.html',
})
export class Inicio implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);

  readonly logoUrl = 'https://fluxo-digital.com/uploads/operativuz_logo.png';
  readonly whatsappUrl =
    'https://wa.me/244951074711?text=Olá%20Operativuz%2C%20quero%20arrendar%20uma%20casa%20em%20Luanda.';

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.location.href = this.whatsappUrl;
    }
  }

  redirectToWhatsapp(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.location.href = this.whatsappUrl;
    }
  }
}
