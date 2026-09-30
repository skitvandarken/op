export interface Intermediario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  bairro: string;
  rua: string;
  documento: string;
  observacoes?: string;
  criadoEm?: number;
  atualizadoEm?: number;
}

export type NovoIntermediario = Omit<Intermediario, 'id'>;
