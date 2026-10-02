import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Cliente, TipoCliente } from '../../models/cliente.model';
import { Intermediario } from '../../models/intermediario.model';
import { Meio, TipoMeio } from '../../models/meio.model';
import { Operativo } from '../../models/operativo.model';
import { NovoPedido, Pedido, StatusPedido, TipoPedido } from '../../models/pedido.model';
import { Propriedade, TipoTipologia } from '../../models/propriedade.model';
import { Reclamacao, StatusReclamacao } from '../../models/reclamacao.model';
import { PeriodoReceita, Receita } from '../../models/receita.model';
import { ClienteService } from '../../services/cliente';
import { IntermediarioService } from '../../services/intermediario';
import { MeioService } from '../../services/meio';
import { OperativoService } from '../../services/operativo';
import { PedidoService } from '../../services/pedido';
import { WebDiskService } from '../../services/google-drive';
import { PropriedadeService } from '../../services/propriedade';
import { ReclamacaoService } from '../../services/reclamacao';
import { ReceitaService } from '../../services/receita';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  activeTab = signal<'clientes' | 'propriedades' | 'operativos' | 'meios' | 'intermediarios' | 'pedidos' | 'reclamacoes'>('clientes');

  clientes = signal<Cliente[]>([]);
  propriedades = signal<Propriedade[]>([]);
  operativos = signal<Operativo[]>([]);
  meios = signal<Meio[]>([]);
  intermediarios = signal<Intermediario[]>([]);
  pedidos = signal<Pedido[]>([]);
  reclamacoes = signal<Reclamacao[]>([]);
  receitas = signal<Receita[]>([]);

  pedidoStatusFilter = signal<'Todos' | StatusPedido>('Todos');
  pedidoSortMode = signal<'mais_recente' | 'mais_antigo' | 'maior_valor' | 'menor_valor'>('mais_recente');

  isLoading = signal(false);

  pedidosFiltrados = computed<Pedido[]>(() => {
    const filtro = this.pedidoStatusFilter();
    const sortMode = this.pedidoSortMode();
    const lista =
      filtro === 'Todos'
        ? [...this.pedidos()]
        : this.pedidos().filter((pedido) => pedido.status === filtro);

    lista.sort((a, b) => {
      const dataA = a.criadoEm ?? 0;
      const dataB = b.criadoEm ?? 0;
      switch (sortMode) {
        case 'mais_antigo':
          return dataA - dataB;
        case 'maior_valor':
          return Number(b.preco) - Number(a.preco);
        case 'menor_valor':
          return Number(a.preco) - Number(b.preco);
        case 'mais_recente':
        default:
          return dataB - dataA;
      }
    });

    return lista;
  });

  clienteForm: FormGroup;
  propriedadeForm: FormGroup;
  operativoForm: FormGroup;
  meioForm: FormGroup;
  intermediarioForm: FormGroup;
  pedidoForm: FormGroup;
  reclamacaoForm: FormGroup;

  editingClienteId = signal<string | null>(null);
  editingPropriedadeId = signal<string | null>(null);
  driveUploadStatus = signal('');
  isUploadingImages = signal(false);
  editingOperativoId = signal<string | null>(null);
  editingMeioId = signal<string | null>(null);
  editingIntermediarioId = signal<string | null>(null);
  editingPedidoId = signal<string | null>(null);
  editingReclamacaoId = signal<string | null>(null);

  tiposCliente: TipoCliente[] = ['Recorrente', 'Pontual'];
  tipologias: TipoTipologia[] = ['T1', 'T2', 'T3', 'T4', 'V1', 'V2', 'V3', 'V4', 'Outro(a)'];
  tiposMeio: TipoMeio[] = ['Carro', 'Moto', 'Camião', 'Carrinha'];
  tiposPedido: TipoPedido[] = ['Visita', 'Limpeza', 'Mudança', 'Montagem'];
  statusPedido: StatusPedido[] = ['Aberto', 'Em curso', 'Concluído'];
  statusReclamacao: StatusReclamacao[] = ['Aberto', 'Resolvido', 'Sem Solução'];

  showError(form: FormGroup, controlName: string): string | null {
    const control = form.get(controlName);

  if (!control || !(control.touched || control.dirty)) {
    return null;
  }

  // FIX: bail out early if the control has no errors at all. Without this,
  // execution falls through to `return 'Valor inválido.';` and every touched
  // control shows a bogus error — even valid ones.
  if (!control.errors) {
    return null;
  }


    if (control.errors?.['required']) {
      return 'Este campo é obrigatório.';
    }

    if (control.errors?.['email']) {
      return 'Digite um e-mail válido.';
    }

    if (control.errors?.['minlength']) {
      return `Mínimo de ${control.errors['minlength'].requiredLength} caracteres.`;
    }

    if (control.errors?.['pattern']) {
      return 'Formato inválido.';
    }

    if (control.errors?.['min']) {
      return `O valor mínimo é ${control.errors['min'].min}.`;
    }

    if (control.errors?.['maxLength']) {
      return 'Texto muito longo.';
    }

    if (control.errors?.['maxlength']) {
      return `Máximo de ${control.errors['maxlength'].requiredLength} caracteres.`;
    }

    return 'Valor inválido.';
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly clienteService: ClienteService,
    private readonly propriedadeService: PropriedadeService,
    private readonly webDiskService: WebDiskService,
    private readonly operativoService: OperativoService,
    private readonly meioService: MeioService,
    private readonly intermediarioService: IntermediarioService,
    private readonly pedidoService: PedidoService,
    private readonly reclamacaoService: ReclamacaoService,
    private readonly receitaService: ReceitaService
  ) {
    this.clienteForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email, Validators.minLength(6)]],
      telefone: ['', [Validators.required, Validators.minLength(9), Validators.pattern(/^[0-9+\s()-]{9,}$/)]],
      cidade: ['', [Validators.required, Validators.minLength(2)]],
      bairro: ['', [Validators.required, Validators.minLength(2)]],
      rua: ['', [Validators.required, Validators.minLength(3)]],
      tipo: ['Pontual', [Validators.required]],
      observacoes: ['', [Validators.maxLength(250)]],
    });

    this.propriedadeForm = this.fb.group({
      item: ['', [Validators.required, Validators.minLength(3)]],
      tipologia: ['T1', [Validators.required]],
      descricao: ['', [Validators.required, Validators.minLength(10)]],
      preco: [0, [Validators.required, Validators.min(0.01)]],
      imagens: ['', [Validators.maxLength(500)]],
      idIntermediario: [''],
      provincia: ['', [Validators.required, Validators.minLength(2)]],
      bairro: ['', [Validators.required, Validators.minLength(2)]],
      rua: ['', [Validators.required, Validators.minLength(3)]],
      referencia: ['', [Validators.required, Validators.minLength(3)]],
    });

    this.operativoForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email, Validators.minLength(6)]],
      telefone: ['', [Validators.required, Validators.minLength(9), Validators.pattern(/^[0-9+\s()-]{9,}$/)]],
      cidade: ['', [Validators.required, Validators.minLength(2)]],
      bairro: ['', [Validators.required, Validators.minLength(2)]],
      rua: ['', [Validators.required, Validators.minLength(3)]],
      meioId: ['', [Validators.required]],
      licenca: ['', [Validators.required, Validators.minLength(3)]],
      cartadeconducao: ['', [Validators.required, Validators.minLength(3)]],
      validadeLicensa: ['', [Validators.required]],
      numeroBilhetes: [0, [Validators.required, Validators.min(0)]],
      validadeBilhete: ['', [Validators.required, Validators.minLength(3)]],
      observacoes: ['', [Validators.maxLength(250)]],
    });

    this.meioForm = this.fb.group({
      tipo: ['Carro', [Validators.required]],
      marca: ['', [Validators.required, Validators.minLength(2)]],
      modelo: ['', [Validators.required, Validators.minLength(2)]],
      matricula: ['', [Validators.required, Validators.minLength(3)]],
      operativoId: [''],
      operativoNome: [''],
    });

    this.intermediarioForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email, Validators.minLength(6)]],
      telefone: ['', [Validators.required, Validators.minLength(9), Validators.pattern(/^[0-9+\s()-]{9,}$/)]],
      cidade: ['', [Validators.required, Validators.minLength(2)]],
      bairro: ['', [Validators.required, Validators.minLength(2)]],
      rua: ['', [Validators.required, Validators.minLength(3)]],
      documento: ['', [Validators.required, Validators.minLength(3)]],
      observacoes: ['', [Validators.maxLength(250)]],
    });

    this.pedidoForm = this.fb.group({
      tipo: ['Visita', [Validators.required]],
      status: ['Aberto', [Validators.required]],
      preco: [0, [Validators.required, Validators.min(0.01)]],
      idPropriedade: ['', [Validators.required]],
      idCliente: ['', [Validators.required]],
      idOperativo: [''],
      observacoes: ['', [Validators.maxLength(500)]],
    });

    this.reclamacaoForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      descricao: ['', [Validators.required, Validators.minLength(10)]],
      status: ['Aberto', [Validators.required]],
      idPropriedade: ['', [Validators.required]],
      idCliente: ['', [Validators.required]],
      idIntermediario: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loadAll();
  }

  clientePesquisaLabel(cliente: Cliente): string {
    return `${cliente.nome} (${cliente.id})`;
  }

  propriedadePesquisaLabel(propriedade: Propriedade): string {
    return `${propriedade.item} (${propriedade.id})`;
  }

  operativoPesquisaLabel(operativo: Operativo): string {
    return `${operativo.nome} (${operativo.id})`;
  }

  intermediarioPesquisaLabel(intermediario: Intermediario): string {
    return `${intermediario.nome} (${intermediario.id})`;
  }

  clienteLookupValue(id: string | null): string {
    if (!id) return '';
    const cliente = this.clientes().find((item) => item.id === id);
    return cliente ? this.clientePesquisaLabel(cliente) : id;
  }

  propriedadeLookupValue(id: string | null): string {
    if (!id) return '';
    const propriedade = this.propriedades().find((item) => item.id === id);
    return propriedade ? this.propriedadePesquisaLabel(propriedade) : id;
  }

  operativoLookupValue(id: string | null): string {
    if (!id) return '';
    const operativo = this.operativos().find((item) => item.id === id);
    return operativo ? this.operativoPesquisaLabel(operativo) : id;
  }

  intermediarioLookupValue(id: string | null): string {
    if (!id) return '';
    const intermediario = this.intermediarios().find((item) => item.id === id);
    return intermediario ? this.intermediarioPesquisaLabel(intermediario) : id;
  }

  private resolveIdFromSearch<T extends { id: string; nome?: string; item?: string }>(texto: string, colecao: T[], prop: 'nome' | 'item'): string {
    const valor = texto.trim();
    if (!valor) return '';

    const item = colecao.find((entry) => {
      const label = entry[prop] ?? '';
      const variantes = [entry.id, label, `${label} (${entry.id})`, `${label} - ${entry.id}`];
      return variantes.some((variante) => variante.toLowerCase() === valor.toLowerCase());
    });

    return item?.id ?? '';
  }

  selecionarClientePedido(valor: string): void {
    this.pedidoForm.patchValue({ idCliente: this.resolveIdFromSearch(valor, this.clientes(), 'nome') });
  }

  selecionarPropriedadePedido(valor: string): void {
    this.pedidoForm.patchValue({ idPropriedade: this.resolveIdFromSearch(valor, this.propriedades(), 'item') });
  }

  selecionarOperativoPedido(valor: string): void {
    this.pedidoForm.patchValue({ idOperativo: this.resolveIdFromSearch(valor, this.operativos(), 'nome') });
  }

  selecionarIntermediarioPropriedade(valor: string): void {
    this.propriedadeForm.patchValue({ idIntermediario: this.resolveIdFromSearch(valor, this.intermediarios(), 'nome') });
  }

  selecionarClienteReclamacao(valor: string): void {
    this.reclamacaoForm.patchValue({ idCliente: this.resolveIdFromSearch(valor, this.clientes(), 'nome') });
  }

  selecionarPropriedadeReclamacao(valor: string): void {
    this.reclamacaoForm.patchValue({ idPropriedade: this.resolveIdFromSearch(valor, this.propriedades(), 'item') });
  }

  selecionarIntermediarioReclamacao(valor: string): void {
    this.reclamacaoForm.patchValue({ idIntermediario: this.resolveIdFromSearch(valor, this.intermediarios(), 'nome') });
  }

  private loadAll(): void {
    this.isLoading.set(true);

    this.clienteService.listar$().subscribe({
      next: (list) => this.clientes.set(list),
      error: (err) => console.error('Erro ao carregar clientes:', err),
    });

    this.propriedadeService.listar$().subscribe({
      next: (list) => this.propriedades.set(list),
      error: (err) => console.error('Erro ao carregar propriedades:', err),
    });

    this.operativoService.listar$().subscribe({
      next: (list) => this.operativos.set(list),
      error: (err) => console.error('Erro ao carregar operativos:', err),
    });

    this.meioService.listar$().subscribe({
      next: (list) => this.meios.set(list),
      error: (err) => console.error('Erro ao carregar meios:', err),
    });

    this.intermediarioService.listar$().subscribe({
      next: (list) => this.intermediarios.set(list),
      error: (err) => console.error('Erro ao carregar intermediários:', err),
    });

    this.pedidoService.listar$().subscribe({
      next: (list) => this.pedidos.set(list),
      error: (err) => console.error('Erro ao carregar pedidos:', err),
    });

    this.receitaService.listar$().subscribe({
      next: (list) => this.receitas.set(list),
      error: (err) => console.error('Erro ao carregar receitas:', err),
    });

    this.reclamacaoService.listar$().subscribe({
      next: (list) => this.reclamacoes.set(list),
      error: (err) => console.error('Erro ao carregar reclamações:', err),
      complete: () => this.isLoading.set(false),
    });
  }

  setTab(tab: 'clientes' | 'propriedades' | 'operativos' | 'meios' | 'intermediarios' | 'pedidos' | 'reclamacoes'): void {
    this.activeTab.set(tab);
  }

  // Cliente handlers
  async saveCliente(): Promise<void> {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      return;
    }

    const confirmMessage = this.editingClienteId() ? 'Deseja confirmar as alterações deste cliente?' : 'Deseja salvar este cliente?';
    if (!window.confirm(confirmMessage)) {
      return;
    }

    const value = this.clienteForm.getRawValue();
    const payload = {
      nome: value.nome.trim(),
      email: value.email.trim(),
      telefone: value.telefone.trim(),
      cidade: value.cidade.trim(),
      bairro: value.bairro.trim(),
      rua: value.rua.trim(),
      tipo: value.tipo as TipoCliente,
      observacoes: value.observacoes?.trim() ?? '',
    };

    try {
      const id = this.editingClienteId();
      if (id) {
        await this.clienteService.atualizar(id, payload);
      } else {
        await this.clienteService.criar(payload);
      }
      this.resetClienteForm();
      this.loadAll();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
    }
  }

  editCliente(cliente: Cliente): void {
    this.editingClienteId.set(cliente.id);
    this.clienteForm.patchValue({
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone,
      cidade: cliente.cidade,
      bairro: cliente.bairro,
      rua: cliente.rua,
      tipo: cliente.tipo,
      observacoes: cliente.observacoes,
    });
  }

  async deleteCliente(id: string): Promise<void> {
    if (!window.confirm('Deseja realmente excluir este cliente?')) return;
    await this.clienteService.excluir(id);
    this.loadAll();
  }

  resetClienteForm(): void {
    this.editingClienteId.set(null);
    this.clienteForm.reset({
      tipo: 'Pontual',
    });
  }

  getImageUrls(value: string | null | undefined): string[] {
    return (value ?? '')
      .split(',')
      .map((imageUrl) => imageUrl.trim())
      .filter((imageUrl) => !!imageUrl);
  }

  async uploadPropertyImagesToWebDisk(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);

    if (!files.length) {
      return;
    }

    this.isUploadingImages.set(true);
    this.driveUploadStatus.set('A enviar imagens para o WebDisk...');

    try {
      const uploadedUrls = await this.webDiskService.uploadFiles(files);
      const existingUrls = (this.propriedadeForm.get('imagens')?.value ?? '')
        .split(',')
        .map((value: string) => value.trim())
        .filter(Boolean);

      const mergedUrls = [...new Set([...existingUrls, ...uploadedUrls])];
      this.propriedadeForm.patchValue({ imagens: mergedUrls.join(', ') });
      this.driveUploadStatus.set(`${uploadedUrls.length} imagem(ns) carregada(s) com sucesso no WebDisk.`);
    } catch (error) {
      console.error('Erro ao enviar imagens para o WebDisk:', error);
      this.driveUploadStatus.set(
        error instanceof Error ? error.message : 'Não foi possível enviar as imagens para o WebDisk.'
      );
    } finally {
      this.isUploadingImages.set(false);
      input.value = '';
    }
  }

  // Propriedade handlers
  async savePropriedade(): Promise<void> {
    if (this.propriedadeForm.invalid) {
      this.propriedadeForm.markAllAsTouched();
      return;
    }

    const confirmMessage = this.editingPropriedadeId() ? 'Deseja confirmar as alterações desta propriedade?' : 'Deseja salvar esta propriedade?';
    if (!window.confirm(confirmMessage)) {
      return;
    }

    const value = this.propriedadeForm.getRawValue();
    const intermediarioSelecionado = this.intermediarios().find((item) => item.id === value.idIntermediario);
    const payload: Omit<Propriedade, 'id'> = {
      item: value.item.trim(),
      tipologia: value.tipologia as TipoTipologia,
      descricao: value.descricao.trim(),
      preco: Number(value.preco),
      imagens: (value.imagens || '')
        .split(',')
        .map((img: string) => img.trim())
        .filter(Boolean),
      ...(value.idIntermediario ? { idIntermediario: value.idIntermediario } : {}),
      intermediarioNome: intermediarioSelecionado?.nome ?? '',
      localizacao: {
        provincia: value.provincia.trim(),
        bairro: value.bairro.trim(),
        rua: value.rua.trim(),
        referencia: value.referencia.trim(),
      },
    };

    try {
      const id = this.editingPropriedadeId();
      if (id) {
        await this.propriedadeService.atualizar(id, payload);
      } else {
        await this.propriedadeService.criar(payload);
      }
      this.resetPropriedadeForm();
      this.loadAll();
    } catch (error) {
      console.error('Erro ao salvar propriedade:', error);
    }
  }

  editPropriedade(propriedade: Propriedade): void {
    this.editingPropriedadeId.set(propriedade.id);
    this.propriedadeForm.patchValue({
      item: propriedade.item,
      tipologia: propriedade.tipologia,
      descricao: propriedade.descricao,
      preco: propriedade.preco,
      imagens: propriedade.imagens?.join(', ') ?? '',
      idIntermediario: propriedade.idIntermediario ?? '',
      provincia: propriedade.localizacao?.provincia ?? '',
      bairro: propriedade.localizacao?.bairro ?? '',
      rua: propriedade.localizacao?.rua ?? '',
      referencia: propriedade.localizacao?.referencia ?? '',
    });
  }

  async deletePropriedade(id: string): Promise<void> {
    if (!window.confirm('Deseja realmente excluir esta propriedade?')) return;
    await this.propriedadeService.excluir(id);
    this.loadAll();
  }

  resetPropriedadeForm(): void {
    this.editingPropriedadeId.set(null);
    this.driveUploadStatus.set('');
    this.propriedadeForm.reset({
      tipologia: 'T1',
      preco: 0,
      idIntermediario: '',
    });
  }

  // Operativo handlers
  async saveOperativo(): Promise<void> {
    if (this.operativoForm.invalid) {
      this.operativoForm.markAllAsTouched();
      return;
    }

    const confirmMessage = this.editingOperativoId() ? 'Deseja confirmar as alterações deste operativo?' : 'Deseja salvar este operativo?';
    if (!window.confirm(confirmMessage)) {
      return;
    }

    const value = this.operativoForm.getRawValue();
    const payload = {
      nome: value.nome.trim(),
      email: value.email.trim(),
      telefone: value.telefone.trim(),
      cidade: value.cidade.trim(),
      bairro: value.bairro.trim(),
      rua: value.rua.trim(),
      meioId: value.meioId,
      licenca: value.licenca.trim(),
      cartadeconducao: value.cartadeconducao.trim(),
      validadeLicensa: value.validadeLicensa.trim(),
      fotografia: '',
      numeroBilhetes: Number(value.numeroBilhetes),
      validadeBilhete: value.validadeBilhete.trim(),
      pai: '',
      mae: '',
      observacoes: value.observacoes?.trim() ?? '',
      pedidosRespondidos: 0,
    };

    try {
      const id = this.editingOperativoId();
      if (id) {
        await this.operativoService.atualizar(id, payload);
      } else {
        const newId = await this.operativoService.criar(payload);
        const selectedMeio = this.meios().find((m) => m.id === value.meioId);
        if (selectedMeio) {
          await this.meioService.associarOperativo(selectedMeio.id, newId, value.nome.trim());
        }
      }
      this.resetOperativoForm();
      this.loadAll();
    } catch (error) {
      console.error('Erro ao salvar operativo:', error);
    }
  }

  editOperativo(operativo: Operativo): void {
    this.editingOperativoId.set(operativo.id);
    this.operativoForm.patchValue({
      nome: operativo.nome,
      email: operativo.email,
      telefone: operativo.telefone,
      cidade: operativo.cidade,
      bairro: operativo.bairro,
      rua: operativo.rua,
      meioId: operativo.meioId,
      licenca: operativo.licenca,
      cartadeconducao: operativo.cartadeconducao,
      validadeLicensa: operativo.validadeLicensa,
      numeroBilhetes: operativo.numeroBilhetes,
      validadeBilhete: operativo.validadeBilhete,
      observacoes: operativo.observacoes ?? '',
    });
  }

  async deleteOperativo(id: string): Promise<void> {
    if (!window.confirm('Deseja realmente excluir este operativo?')) return;
    await this.operativoService.excluir(id);
    this.loadAll();
  }

  resetOperativoForm(): void {
    this.editingOperativoId.set(null);
    this.operativoForm.reset({
      numeroBilhetes: 0,
    });
  }

  // Meio handlers
  async saveMeio(): Promise<void> {
    if (this.meioForm.invalid) {
      this.meioForm.markAllAsTouched();
      return;
    }

    const confirmMessage = this.editingMeioId() ? 'Deseja confirmar as alterações deste meio?' : 'Deseja salvar este meio?';
    if (!window.confirm(confirmMessage)) {
      return;
    }

    const value = this.meioForm.getRawValue();
    const payload: any = {
      tipo: value.tipo as TipoMeio,
      marca: value.marca.trim(),
      modelo: value.modelo.trim(),
      matricula: value.matricula.trim(),
      operativoNome: value.operativoNome?.trim() || '',
      ativo: true,
    };

    if (value.operativoId) {
      payload.operativoId = value.operativoId;
    }

    try {
      const id = this.editingMeioId();
      if (id) {
        await this.meioService.atualizar(id, payload);
      } else {
        await this.meioService.criar(payload);
      }
      this.resetMeioForm();
      this.loadAll();
    } catch (error) {
      console.error('Erro ao salvar meio:', error);
    }
  }

  editMeio(meio: Meio): void {
    this.editingMeioId.set(meio.id);
    this.meioForm.patchValue({
      tipo: meio.tipo,
      marca: meio.marca,
      modelo: meio.modelo,
      matricula: meio.matricula,
      operativoId: meio.operativoId ?? '',
      operativoNome: meio.operativoNome ?? '',
    });
  }

  async deleteMeio(id: string): Promise<void> {
    if (!window.confirm('Deseja realmente excluir este meio?')) return;
    await this.meioService.excluir(id);
    this.loadAll();
  }

  resetMeioForm(): void {
    this.editingMeioId.set(null);
    this.meioForm.reset({
      tipo: 'Carro',
      operativoId: '',
      operativoNome: '',
    });
  }

  // Intermediário handlers
  async saveIntermediario(): Promise<void> {
    if (this.intermediarioForm.invalid) {
      this.intermediarioForm.markAllAsTouched();
      return;
    }

    const confirmMessage = this.editingIntermediarioId() ? 'Deseja confirmar as alterações deste intermediário?' : 'Deseja salvar este intermediário?';
    if (!window.confirm(confirmMessage)) {
      return;
    }

    const value = this.intermediarioForm.getRawValue();
    const payload = {
      nome: value.nome.trim(),
      email: value.email.trim(),
      telefone: value.telefone.trim(),
      cidade: value.cidade.trim(),
      bairro: value.bairro.trim(),
      rua: value.rua.trim(),
      documento: value.documento.trim(),
      observacoes: value.observacoes?.trim() ?? '',
    };

    try {
      const id = this.editingIntermediarioId();
      if (id) {
        await this.intermediarioService.atualizar(id, payload);
      } else {
        await this.intermediarioService.criar(payload);
      }
      this.resetIntermediarioForm();
      this.loadAll();
    } catch (error) {
      console.error('Erro ao salvar intermediário:', error);
    }
  }

  editIntermediario(intermediario: Intermediario): void {
    this.editingIntermediarioId.set(intermediario.id);
    this.intermediarioForm.patchValue({
      nome: intermediario.nome,
      email: intermediario.email,
      telefone: intermediario.telefone,
      cidade: intermediario.cidade,
      bairro: intermediario.bairro,
      rua: intermediario.rua,
      documento: intermediario.documento,
      observacoes: intermediario.observacoes ?? '',
    });
  }

  async deleteIntermediario(id: string): Promise<void> {
    if (!window.confirm('Deseja realmente excluir este intermediário?')) return;
    await this.intermediarioService.excluir(id);
    this.loadAll();
  }

  resetIntermediarioForm(): void {
    this.editingIntermediarioId.set(null);
    this.intermediarioForm.reset();
  }

  // Pedido handlers
  editPedido(pedido: Pedido): void {
    this.editingPedidoId.set(pedido.id);
    this.pedidoForm.patchValue({
      tipo: pedido.tipo,
      status: pedido.status,
      preco: pedido.preco ?? 0,
      idPropriedade: pedido.idPropriedade,
      idCliente: pedido.idCliente,
      idOperativo: pedido.idOperativo ?? '',
      observacoes: pedido.observacoes ?? '',
    });
  }

  async deletePedido(id: string): Promise<void> {
    if (!window.confirm('Deseja realmente excluir este pedido?')) return;
    await this.pedidoService.excluir(id);
    this.loadAll();
  }

  resetPedidoForm(): void {
    this.editingPedidoId.set(null);
    this.pedidoForm.reset({
      tipo: 'Visita',
      status: 'Aberto',
      preco: 0,
      idOperativo: '',
    });
  }

  displayPedidoOperativo(pedido: Pedido): string {
    const operativo = this.operativos().find((item) => item.id === pedido.idOperativo);
    return operativo?.nome ?? pedido.operativoNome ?? 'Sem operativo';
  }

  getPedidosFiltrados(): Pedido[] {
    return this.pedidosFiltrados();
  }

  receitaTotal(periodo: PeriodoReceita): number {
    return this.receitaService.totalPorPeriodo(this.receitas(), periodo);
  }

  async savePedido(): Promise<void> {
    if (this.pedidoForm.invalid) {
      this.pedidoForm.markAllAsTouched();
      return;
    }

    const confirmMessage = this.editingPedidoId() ? 'Deseja confirmar as alterações deste pedido?' : 'Deseja salvar este pedido?';
    if (!window.confirm(confirmMessage)) {
      return;
    }

    const value = this.pedidoForm.getRawValue();
    const cliente = this.clientes().find((item) => item.id === value.idCliente);
    const propriedade = this.propriedades().find((item) => item.id === value.idPropriedade);
    const operativo = this.operativos().find((item) => item.id === value.idOperativo);

    const payload: NovoPedido = {
      tipo: value.tipo as TipoPedido,
      status: value.status as StatusPedido,
      preco: Number(value.preco),
      idPropriedade: value.idPropriedade,
      propriedadeItem: propriedade?.item ?? '',
      idCliente: value.idCliente,
      clienteNome: cliente?.nome ?? '',
      operativoNome: operativo?.nome ?? '',
      observacoes: value.observacoes?.trim() ?? '',
    };

    if (value.idOperativo) {
      payload.idOperativo = value.idOperativo;
    }

    try {
      const id = this.editingPedidoId();
      let pedidoId: string;

      if (id) {
        await this.pedidoService.atualizar(id, payload);
        pedidoId = id;
      } else {
        pedidoId = await this.pedidoService.criar(payload);
      }

      if (payload.status === 'Concluído') {
        const jaGerouReceita = this.receitas().some((receita) => receita.pedidoId === pedidoId);
        if (!jaGerouReceita) {
          await this.receitaService.registrarReceitaDoPedido(pedidoId, Number(payload.preco));
        }
      }

      this.resetPedidoForm();
      this.loadAll();
    } catch (error) {
      console.error('Erro ao salvar pedido:', error);
    }
  }

  async saveReclamacao(): Promise<void> {
    if (this.reclamacaoForm.invalid) {
      this.reclamacaoForm.markAllAsTouched();
      return;
    }

    const confirmMessage = this.editingReclamacaoId() ? 'Deseja confirmar as alterações desta reclamação?' : 'Deseja salvar esta reclamação?';
    if (!window.confirm(confirmMessage)) {
      return;
    }

    const value = this.reclamacaoForm.getRawValue();
    const propriedade = this.propriedades().find((item) => item.id === value.idPropriedade);
    const cliente = this.clientes().find((item) => item.id === value.idCliente);
    const intermediario = this.intermediarios().find((item) => item.id === value.idIntermediario);

    const payload = {
      titulo: value.titulo.trim(),
      descricao: value.descricao.trim(),
      status: value.status as StatusReclamacao,
      idPropriedade: value.idPropriedade,
      propriedadeItem: propriedade?.item ?? '',
      idCliente: value.idCliente,
      clienteNome: cliente?.nome ?? '',
      idIntermediario: value.idIntermediario,
      intermediarioNome: intermediario?.nome ?? '',
    };

    try {
      const id = this.editingReclamacaoId();
      if (id) {
        await this.reclamacaoService.atualizar(id, payload);
      } else {
        await this.reclamacaoService.criar(payload);
      }
      this.resetReclamacaoForm();
      this.loadAll();
    } catch (error) {
      console.error('Erro ao salvar reclamação:', error);
    }
  }

  editReclamacao(reclamacao: Reclamacao): void {
    this.editingReclamacaoId.set(reclamacao.id);
    this.reclamacaoForm.patchValue({
      titulo: reclamacao.titulo,
      descricao: reclamacao.descricao,
      status: reclamacao.status,
      idPropriedade: reclamacao.idPropriedade,
      idCliente: reclamacao.idCliente,
      idIntermediario: reclamacao.idIntermediario,
    });
  }

  async deleteReclamacao(id: string): Promise<void> {
    if (!window.confirm('Deseja realmente excluir esta reclamação?')) return;
    await this.reclamacaoService.excluir(id);
    this.loadAll();
  }

  resetReclamacaoForm(): void {
    this.editingReclamacaoId.set(null);
    this.reclamacaoForm.reset({
      status: 'Aberto',
    });
  }
}
