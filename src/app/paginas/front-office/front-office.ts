import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Propriedade } from '../../models/propriedade.model';
import { PropriedadeService } from '../../services/propriedade';

interface ServicoTipo {
  nome: string;
  descricao: string;
  icone: string;
}

@Component({
  selector: 'app-front-office',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './front-office.html',
  styleUrl: './front-office.css',
})
export class FrontOfficeComponent implements OnInit {
  private readonly propriedadeService = inject(PropriedadeService);

  readonly propriedades = signal<Propriedade[]>([]);
  readonly fallbackImage = '/property-fallback.svg';

  readonly servicos: ServicoTipo[] = [
    {
      nome: 'Visitas',
      descricao: 'Avaliações rápidas e acompanhamento profissional do imóvel.',
      icone: 'home_work',
    },
    {
      nome: 'Limpeza',
      descricao: 'Serviços de higiene, organização e cuidado final da propriedade.',
      icone: 'cleaning_services',
    },
    {
      nome: 'Mudança',
      descricao: 'Planeamento e logística para uma mudança tranquila e segura.',
      icone: 'moving',
    },
    {
      nome: 'Montagem',
      descricao: 'Montagem e ajustes para mobiliário, acessórios e estruturas.',
      icone: 'construction',
    },
  ];

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement | null;
    if (!target) {
      return;
    }

    const currentUrl = target.currentSrc || target.src;
    if (currentUrl.endsWith('/property-fallback.svg')) {
      return;
    }

    const normalizedGoogleDriveUrl = this.normalizeGoogleDriveUrl(currentUrl);
    if (normalizedGoogleDriveUrl !== currentUrl) {
      target.src = normalizedGoogleDriveUrl;
      target.onerror = () => {
        target.src = this.fallbackImage;
        target.onerror = null;
      };
      return;
    }

    target.src = this.fallbackImage;
    target.onerror = null;
  }

  private normalizeGoogleDriveUrl(url: string): string {
    const match = url.match(/(?:lh3\.googleusercontent\.com\/d\/|drive\.google\.com\/file\/d\/)([a-zA-Z0-9_-]+)/i);
    if (!match?.[1]) {
      return url;
    }

    return `https://drive.usercontent.google.com/download?id=${match[1]}&export=view`;
  }

  ngOnInit(): void {
    this.propriedadeService.listar$().subscribe({
      next: (lista) => this.propriedades.set(lista.slice(0, 6)),
      error: (error) => console.error('Erro ao carregar propriedades em destaque:', error),
    });
  }
}
