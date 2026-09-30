// pedido.component.ts
import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { Pedido, StatusPedido, TipoPedido } from '../../models/pedido.model';
import { Cliente } from '../../models/cliente.model';
import { Operativo } from '../../models/operativo.model';
import { Propriedade } from '../../models/propriedade.model';
import { PedidoService } from '../../services/pedido';
import { ClienteService } from '../../services/cliente';
import { OperativoService } from '../../services/operativo';
import { PropriedadeService } from '../../services/propriedade';

@Component({
  selector: 'app-pedido',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pedido.html',
  styleUrl: './pedido.css',
})
export class PedidoComponent implements OnInit, OnDestroy {
  // Signals
  pedidos = signal<Pedido[]>([]);
  clientes = signal<Cliente[]>([]);
  propriedades = signal<Propriedade[]>([]);
  operativos = signal<Operativo[]>([]);

  isLoading = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);
  isModalOpen = signal<boolean>(false);
  editingPedidoId = signal<string | null>(null);

  tiposPedido: TipoPedido[] = ['Visita', 'Limpeza', 'Mudança', 'Montagem'];
  pedidoForm!: FormGroup;

  private subs = new Subscription();

  constructor(
    private fb: FormBuilder,
    private pedidoService: PedidoService,
    private clienteService: ClienteService,
    private propriedadeService: PropriedadeService,
    private operativoService: OperativoService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.listenToPedidos();
    this.listenToClientes();
    this.listenToPropriedades();
    this.listenToOperativos();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private initForm(): void {
    this.pedidoForm = this.fb.group({
      tipo: ['Visita', [Validators.required]],
      preco: [0, [Validators.required, Validators.min(0.01)]],
      idPropriedade: ['', [Validators.required]],
      idCliente: ['', [Validators.required]],
      idOperativo: [''],
      observacoes: ['', [Validators.maxLength(500)]],
    });
  }

  // ---------- Listeners ----------

  private listenToPedidos(): void {
    this.isLoading.set(true);
    this.subs.add(
      this.pedidoService.listar$().subscribe({
        next: (list) => {
          this.pedidos.set(list);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error fetching pedidos:', err);
          this.isLoading.set(false);
        },
      })
    );
  }

  private listenToClientes(): void {
    this.subs.add(
      this.clienteService.listar$().subscribe({
        next: (list) => this.clientes.set(list),
        error: (err) => console.error('Erro ao carregar clientes:', err),
      })
    );
  }

  private listenToPropriedades(): void {
    this.subs.add(
      this.propriedadeService.listar$().subscribe({
        next: (list) => this.propriedades.set(list),
        error: (err) => console.error('Erro ao carregar propriedades:', err),
      })
    );
  }

  private listenToOperativos(): void {
    this.subs.add(
      this.operativoService.listar$().subscribe({
        next: (list) => this.operativos.set(list),
        error: (err) => console.error('Erro ao carregar operativos:', err),
      })
    );
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
  // ---------- Modal ----------

  openCreateModal(): void {
    this.editingPedidoId.set(null);
    this.pedidoForm.reset({ tipo: 'Visita', preco: 0, idOperativo: '' });
    this.isModalOpen.set(true);
  }

  openEditModal(pedido: Pedido): void {
    this.editingPedidoId.set(pedido.id);
    this.pedidoForm.patchValue({
      tipo: pedido.tipo,
      preco: pedido.preco ?? 0,
      idPropriedade: pedido.idPropriedade,
      idCliente: pedido.idCliente,
      idOperativo: pedido.idOperativo ?? '',
      observacoes: pedido.observacoes || '',
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingPedidoId.set(null);
    this.pedidoForm.reset({ tipo: 'Visita', preco: 0, idOperativo: '' });
  }

  // ---------- Helpers for the template ----------

  /** Get the display label for a given cliente ID. */
  clienteLabel(id: string): string {
    const c = this.clientes().find((x) => x.id === id);
    return c ? `${c.id} — ${c.nome}` : id;
  }

  /** Get the display label for a given propriedade ID. */
  propriedadeLabel(id: string): string {
    const p = this.propriedades().find((x) => x.id === id);
    return p ? `${p.id} — ${p.item}` : id;
  }

  /** Display name for the table (falls back to cached label, then raw ID). */
  displayCliente(pedido: Pedido): string {
    const c = this.clientes().find((x) => x.id === pedido.idCliente);
    return c?.nome ?? pedido.clienteNome ?? pedido.idCliente;
  }

  displayPropriedade(pedido: Pedido): string {
    const p = this.propriedades().find((x) => x.id === pedido.idPropriedade);
    return p?.item ?? pedido.propriedadeItem ?? pedido.idPropriedade;
  }

  displayOperativo(pedido: Pedido): string {
    const o = this.operativos().find((x) => x.id === pedido.idOperativo);
    return o?.nome ?? pedido.operativoNome ?? 'Sem operativo';
  }

  // ---------- Submit / Delete ----------

  async onSubmit(): Promise<void> {
    if (this.pedidoForm.invalid) {
      this.pedidoForm.markAllAsTouched();
      return;
    }

    const confirmMessage = this.editingPedidoId() ? 'Deseja confirmar as alterações deste pedido?' : 'Deseja salvar este pedido?';
    if (!window.confirm(confirmMessage)) {
      return;
    }

    this.isSubmitting.set(true);
    const formVal = this.pedidoForm.value;

    // Resolve cached labels from the currently selected IDs
    const cliente = this.clientes().find((c) => c.id === formVal.idCliente);
    const propriedade = this.propriedades().find((p) => p.id === formVal.idPropriedade);

    const operativo = this.operativos().find((o) => o.id === formVal.idOperativo);
    const payload: {
      tipo: TipoPedido;
      status: StatusPedido;
      preco: number;
      idPropriedade: string;
      propriedadeItem: string;
      idCliente: string;
      clienteNome: string;
      idOperativo?: string;
      operativoNome?: string;
      observacoes: string;
    } = {
      tipo: formVal.tipo as TipoPedido,
      status: 'Aberto' as StatusPedido,
      preco: Number(formVal.preco),
      idPropriedade: formVal.idPropriedade,
      propriedadeItem: propriedade?.item ?? '',
      idCliente: formVal.idCliente,
      clienteNome: cliente?.nome ?? '',
      idOperativo: formVal.idOperativo || undefined,
      operativoNome: operativo?.nome ?? '',
      observacoes: formVal.observacoes || '',
    };

    try {
      const currentId = this.editingPedidoId();

      if (currentId) {
        await this.pedidoService.atualizar(currentId, payload);
      } else {
        const generatedId = await this.pedidoService.criar(payload);
        console.log(`Pedido criado com ID: ${generatedId}`);
      }

      this.closeModal();
    } catch (error) {
      console.error('Erro ao salvar o pedido:', error);
      alert('Erro ao salvar o pedido.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async deletePedido(id: string): Promise<void> {
    if (!window.confirm('Deseja realmente excluir este pedido?')) return;

    try {
      await this.pedidoService.excluir(id);
    } catch (error) {
      console.error('Erro ao excluir o pedido:', error);
      alert('Erro ao excluir o pedido.');
    }
  }
}