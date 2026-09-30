import { Injectable } from '@angular/core';
import { collection, onSnapshot } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { db } from '../app.config';
import { LocalizacaoFiltro } from '../models/localizacao.model';
import { Propriedade } from '../models/propriedade.model';

@Injectable({ providedIn: 'root' })
export class LocalizacaoService {
  private readonly propriedadesRef = collection(db, 'propriedades');

  listarPropriedadesPorLocalizacao$(filtro: LocalizacaoFiltro = {}): Observable<Propriedade[]> {
    return new Observable<Propriedade[]>((subscriber) => {
      const unsubscribe = onSnapshot(
        this.propriedadesRef,
        (snapshot) => {
          const propriedades = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Propriedade, 'id'>),
          })) as Propriedade[];

          subscriber.next(this.filtrarPropriedades(propriedades, filtro));
        },
        (error) => subscriber.error(error)
      );

      return () => unsubscribe();
    });
  }

  filtrarPropriedades(propriedades: Propriedade[], filtro: LocalizacaoFiltro = {}): Propriedade[] {
    const provincia = this.normalizar(filtro.provincia);
    const bairro = this.normalizar(filtro.bairro);
    const rua = this.normalizar(filtro.rua);
    const termo = this.normalizar(filtro.termo);

    return propriedades
      .filter((propriedade) => {
        const localizacao = propriedade.localizacao ?? {};

        const coincideProvincia = !provincia || this.normalizar(localizacao.provincia) === provincia;
        const coincideBairro = !bairro || this.normalizar(localizacao.bairro) === bairro;
        const coincideRua = !rua || this.normalizar(localizacao.rua) === rua;

        const textoPesquisa = [
          propriedade.item,
          propriedade.descricao,
          localizacao.provincia,
          localizacao.bairro,
          localizacao.rua,
        ]
          .filter(Boolean)
          .join(' ');

        const coincideTermo = !termo || this.normalizar(textoPesquisa).includes(termo);

        return coincideProvincia && coincideBairro && coincideRua && coincideTermo;
      })
      .sort((a, b) => a.item.localeCompare(b.item));
  }

  extrairOpcoesLocais(propriedades: Propriedade[]): { provincias: string[]; bairros: string[] } {
    const provincias = [...new Set(propriedades.map((p) => p.localizacao?.provincia).filter(Boolean))].sort();
    const bairros = [...new Set(propriedades.map((p) => p.localizacao?.bairro).filter(Boolean))].sort();

    return { provincias, bairros };
  }

  private normalizar(valor?: string): string {
    return (valor ?? '').trim().toLowerCase();
  }
}
