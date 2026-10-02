import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Cliente } from '../../models/cliente.model';
import { LocalizacaoFiltro } from '../../models/localizacao.model';
import { Propriedade } from '../../models/propriedade.model';
import { TipoPedido } from '../../models/pedido.model';
import { ClienteService } from '../../services/cliente';
import { LocalizacaoService } from '../../services/localizacao';
import { PedidoService } from '../../services/pedido';
import { PropriedadeService } from '../../services/propriedade';

interface ServicoTipo {
  nome: string;
  descricao: string;
  icone: string;
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  selector: 'app-inicio',
  styleUrl: './inicio.css',
  templateUrl: './inicio.html',
})
export class Inicio implements OnInit, OnDestroy {
  private readonly propriedadeService = inject(PropriedadeService);
  private readonly localizacaoService = inject(LocalizacaoService);
  private readonly clienteService = inject(ClienteService);
  private readonly pedidoService = inject(PedidoService);
  private readonly subscription = new Subscription();
  private readonly fb = inject(FormBuilder);

  readonly todasPropriedades = signal<Propriedade[]>([]);
  readonly propriedades = signal<Propriedade[]>([]);
  readonly bairros = signal<string[]>([]);

  readonly filtro = signal<LocalizacaoFiltro>({ provincia: 'Luanda' });

  readonly filtroBairro = computed(() => this.filtro().bairro ?? '');
  readonly propriedadesDestaque = computed(() => this.propriedades().slice(0, 3));
  readonly isLoadingPropriedades = signal(true);
  readonly tiposPedidoDisponiveis: TipoPedido[] = ['Visita', 'Mudança'];
  readonly selectedProperty = signal<Propriedade | null>(null);
  readonly isPedidoModalOpen = signal(false);
  readonly isSavingPedido = signal(false);
  readonly fallbackImage = '/property-fallback.svg';

  readonly pedidoForm = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    telefone: ['', [Validators.required, Validators.minLength(9)]],
    tipo: ['Visita' as TipoPedido, [Validators.required]],
    observacoes: ['', [Validators.maxLength(300)]],
  });

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
    this.subscription.add(
      this.propriedadeService.listar$().subscribe({
        next: (lista) => {
          const luanda = lista.filter((p) => p.localizacao?.provincia === 'Luanda');
          this.todasPropriedades.set(luanda);
          const opcoes = this.localizacaoService.extrairOpcoesLocais(luanda);
          this.bairros.set(opcoes.bairros);
          this.filtro.set({ provincia: 'Luanda' });
          this.aplicarFiltro();
          this.isLoadingPropriedades.set(false);
        },
        error: (error) => {
          console.error('Erro ao carregar propriedades em destaque:', error);
          this.isLoadingPropriedades.set(false);
        },
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  aplicarFiltro(): void {
    const filtroAtual = this.filtro();
    const listaFiltrada = this.localizacaoService.filtrarPropriedades(this.todasPropriedades(), filtroAtual);
    this.propriedades.set(listaFiltrada.slice(0, 12));
  }

  atualizarBairro(bairro: string): void {
    const filtroAtual = this.filtro();
    this.filtro.set({ ...filtroAtual, bairro });
    this.aplicarFiltro();
  }

  limparFiltro(): void {
    this.filtro.set({ provincia: 'Luanda' });
    this.aplicarFiltro();
  }

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

  abrirDetalhe(propriedade: Propriedade): void {
    this.selectedProperty.set(propriedade);
    this.isPedidoModalOpen.set(true);
  }

  fecharModal(): void {
    this.isPedidoModalOpen.set(false);
    this.selectedProperty.set(null);
    this.pedidoForm.reset({
      nome: '',
      email: '',
      telefone: '',
      tipo: 'Visita',
      observacoes: '',
    });
  }

  async enviarPedido(): Promise<void> {
    const propriedade = this.selectedProperty();
    if (!propriedade || this.pedidoForm.invalid) {
      this.pedidoForm.markAllAsTouched();
      return;
    }

    this.isSavingPedido.set(true);

    try {
      const values = this.pedidoForm.getRawValue();
      const cliente = await this.clienteService.criar({
        nome: values.nome,
        email: values.email,
        telefone: values.telefone,
        cidade: 'Luanda',
        bairro: propriedade.localizacao?.bairro ?? 'Luanda',
        rua: propriedade.localizacao?.rua ?? 'Sem rua definida',
        tipo: 'Pontual',
        observacoes: `Pedido gerado via modal de propriedade: ${propriedade.item}. ${values.observacoes || ''}`,
      });

      await this.pedidoService.criar({
        tipo: values.tipo,
        status: 'Aberto',
        preco: propriedade.preco,
        idPropriedade: propriedade.id,
        propriedadeItem: propriedade.item,
        idCliente: cliente,
        clienteNome: values.nome,
        observacoes: values.observacoes || 'Pedido gerado a partir de detalhe da propriedade.',
      });

      this.fecharModal();
      window.alert('Pedido criado com sucesso.');
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      window.alert('Não foi possível criar o pedido. Tente novamente.');
    } finally {
      this.isSavingPedido.set(false);
    }
  }
}
