import { Cliente } from './cliente.model';
import { Operativo } from './operativo.model';
import { Propriedade } from './propriedade.model';

export type TipoPedido = 'Visita' | 'Limpeza' | 'Mudança' | 'Montagem';
export type StatusPedido = 'Aberto' | 'Em curso' | 'Concluído';

export interface Pedido {
  id: string;
  tipo: TipoPedido;
  status: StatusPedido;
  preco: number;
  idPropriedade: Propriedade['id'];
  propriedadeItem: string;
  idCliente: Cliente['id'];
  clienteNome: string;
  idOperativo?: Operativo['id'];
  operativoNome?: string;
  observacoes: string;
  criadoEm?: number;
  atualizadoEm?: number;
}

export type NovoPedido = Omit<Pedido, 'id'>;