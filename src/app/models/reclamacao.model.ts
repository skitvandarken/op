export type StatusReclamacao = 'Aberto' | 'Resolvido' | 'Sem Solução';

export interface Reclamacao {
  id: string;
  titulo: string;
  descricao: string;
  status: StatusReclamacao;
  idPropriedade: string;
  propriedadeItem?: string;
  idCliente: string;
  clienteNome?: string;
  idIntermediario: string;
  intermediarioNome?: string;
  criadoEm?: number;
  atualizadoEm?: number;
}

export type NovaReclamacao = Omit<Reclamacao, 'id'>;
