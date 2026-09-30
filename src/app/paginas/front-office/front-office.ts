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

  ngOnInit(): void {
    this.propriedadeService.listar$().subscribe({
      next: (lista) => this.propriedades.set(lista.slice(0, 6)),
      error: (error) => console.error('Erro ao carregar propriedades em destaque:', error),
    });
  }
}
