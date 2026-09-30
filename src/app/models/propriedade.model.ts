import { Intermediario } from './intermediario.model';
import { Localizacao } from './localizacao.model';

export type TipoTipologia = 'T1' | 'T2' | 'T3' | 'T4' | 'V1' | 'V2' | 'V3' | 'V4' | 'Outro(a)';
export type TipologiaPropriedade = TipoTipologia;

export interface Propriedade {
  id: string;
  item: string;
  tipologia: TipologiaPropriedade;
  descricao: string;
  preco: number;
  imagens: string[];
  idIntermediario?: Intermediario['id'];
  intermediarioNome?: string;
  localizacao: Localizacao;
}