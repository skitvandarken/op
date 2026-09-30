import { Operativo } from './operativo.model';

export type TipoMeio = 'Carro' | 'Moto' | 'Camião' | 'Carrinha';

export interface Meio {
  id: string;
  tipo: TipoMeio;
  marca: string;
  modelo: string;
  matricula: string;
  operativoId?: string;
  operativoNome?: string;
  ativo?: boolean;
}

export type NovoMeio = Omit<Meio, 'id'>;