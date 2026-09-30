import { Injectable } from '@angular/core';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { db } from '../app.config';
import { NovoPedido, Pedido, TipoPedido } from '../models/pedido.model';
import { SmartIdService } from './smart-id';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private pedidosRef = collection(db, 'pedidos');

  private readonly prefixMap: Record<TipoPedido, string> = {
    Visita: 'VIS',
    Limpeza: 'LIM',
    'Mudança': 'MUD',
    Montagem: 'MON',
  };

  constructor(private smartId: SmartIdService) {}

  listar$(): Observable<Pedido[]> {
    return new Observable<Pedido[]>((subscriber) => {
      const q = query(this.pedidosRef, orderBy('criadoEm', 'desc'));
      const unsubscribe = onSnapshot(
        q,
        (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Pedido[];
          subscriber.next(list);
        },
        (err) => subscriber.error(err)
      );
      return () => unsubscribe();
    });
  }

  async criar(pedido: NovoPedido): Promise<string> {
    const prefix = this.prefixMap[pedido.tipo] ?? 'PED';
    const smartId = await this.smartId.next(prefix);

    const ref = doc(db, 'pedidos', smartId);
    await setDoc(ref, { ...pedido, criadoEm: Date.now() });
    return smartId;
  }

  async atualizar(id: string, changes: Partial<NovoPedido>): Promise<void> {
    await updateDoc(doc(db, 'pedidos', id), changes);
  }

  async excluir(id: string): Promise<void> {
    await deleteDoc(doc(db, 'pedidos', id));
  }
}