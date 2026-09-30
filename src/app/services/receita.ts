import { Injectable } from '@angular/core';
import { collection, doc, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { db } from '../app.config';
import { NovaReceita, PeriodoReceita, Receita } from '../models/receita.model';
import { SmartIdService } from './smart-id';

@Injectable({ providedIn: 'root' })
export class ReceitaService {
  private readonly receitasRef = collection(db, 'receitas');

  constructor(private readonly smartId: SmartIdService) {}

  listar$(): Observable<Receita[]> {
    return new Observable<Receita[]>((subscriber) => {
      const q = query(this.receitasRef, orderBy('data', 'desc'));
      const unsubscribe = onSnapshot(
        q,
        (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Receita[];
          subscriber.next(list);
        },
        (err) => subscriber.error(err)
      );

      return () => unsubscribe();
    });
  }

  async criar(receita: NovaReceita): Promise<string> {
    const smartId = await this.smartId.next('RCP');
    const ref = doc(db, 'receitas', smartId);
    await setDoc(ref, { ...receita, data: receita.data ?? Date.now() });
    return smartId;
  }

  async registrarReceitaDoPedido(pedidoId: string, valor: number): Promise<string> {
    const ref = doc(db, 'receitas', pedidoId);
    await setDoc(
      ref,
      {
        pedidoId,
        valor,
        data: Date.now(),
        descricao: 'Receita gerada por pedido concluído',
      },
      { merge: true }
    );
    return pedidoId;
  }

  totalPorPeriodo(receitas: Receita[], periodo: PeriodoReceita, referencia = new Date()): number {
    const agora = new Date(referencia);
    const inicio = new Date(agora);

    switch (periodo) {
      case 'Diária':
        inicio.setHours(0, 0, 0, 0);
        break;
      case 'Semanal':
        inicio.setDate(agora.getDate() - 6);
        inicio.setHours(0, 0, 0, 0);
        break;
      case 'Mensal':
        inicio.setDate(1);
        inicio.setHours(0, 0, 0, 0);
        break;
      case 'Anual':
        inicio.setMonth(0, 1);
        inicio.setHours(0, 0, 0, 0);
        break;
      default:
        return 0;
    }

    return receitas
      .filter((receita) => receita.data >= inicio.getTime() && receita.data <= agora.getTime())
      .reduce((soma, receita) => soma + Number(receita.valor || 0), 0);
  }
}
