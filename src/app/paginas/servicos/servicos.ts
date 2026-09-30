import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface ServicoItem {
  nome: string;
  descricao: string;
  icone: string;
  destaque: string;
}

@Component({
  standalone: true,
  selector: 'app-servicos',
  imports: [CommonModule, RouterLink],
  styleUrl: './servicos.css',
  templateUrl: './servicos.html',
})
export class Servicos {
  readonly servicos: ServicoItem[] = [
    {
      nome: 'Visitas e Vistoria',
      descricao: 'Acompanhamento profissional para avaliação, visita guiada e confirmação das melhores opções para locação ou compra.',
      icone: 'home_work',
      destaque: 'Acompanhamento completo',
    },
    {
      nome: 'Limpeza e Higienização',
      descricao: 'Equipa especializada em organização, limpeza fina e preparação do imóvel para entrada ou apresentação.',
      icone: 'cleaning_services',
      destaque: 'Resultado impecável',
    },
    {
      nome: 'Mudança e Logística',
      descricao: 'Planeamento cuidadoso, transporte e coordenação para reduzir stress e acelerar a transição.',
      icone: 'moving',
      destaque: 'Processo sem fricção',
    },
    {
      nome: 'Montagem e Ajustes',
      descricao: 'Instalações, pequenas reformas, ajustes de mobiliário e reforço de detalhes estruturais.',
      icone: 'construction',
      destaque: 'Execução precisa',
    },
  ];

  readonly beneficios = [
    'Atendimento rápido e com acompanhamento humano',
    'Equipe experiente em imóveis e operação local',
    'Planificação clara e comunicação transparente',
    'Cobertura em Luanda e zonas adjacentes',
  ];

  readonly etapas = [
    { titulo: 'Consulta', texto: 'Entendemos a necessidade, o tipo de imóvel e a janela do serviço.' },
    { titulo: 'Planeamento', texto: 'Definimos a melhor equipa, horário e soluções mais adequadas.' },
    { titulo: 'Execução', texto: 'Acompanhamos a entrega com qualidade, organização e controlo.' },
  ];
}
