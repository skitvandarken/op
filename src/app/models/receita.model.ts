export interface Receita {
  id: string;
  pedidoId: string;
  valor: number;
  data: number;
  descricao?: string;
}

export type NovaReceita = Omit<Receita, 'id'>;
export type PeriodoReceita = 'Diária' | 'Semanal' | 'Mensal' | 'Anual';
