import { Meio } from './meio.model';

export interface Operativo {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  bairro: string;
  rua: string;
  meioId: Meio['id'];
  meioNome?: string;
  licenca: string;
  cartadeconducao: string;
  validadeLicensa: string;
  fotografia?: string;
  numeroBilhetes: number;
  validadeBilhete: string;
  pai?: string;
  mae?: string;
  observacoes?: string;
  pedidosRespondidos?: number;
  criadoEm?: number;
}

export type NovoOperativo = Omit<Operativo, 'id'>;