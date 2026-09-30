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
import { NovoOperativo, Operativo } from '../models/operativo.model';
import { SmartIdService } from './smart-id';

@Injectable({ providedIn: 'root' })
export class OperativoService {
  private readonly operativosRef = collection(db, 'operativos');

  constructor(private smartId: SmartIdService) {}

  listar$(): Observable<Operativo[]> {
    return new Observable<Operativo[]>((subscriber) => {
      const q = query(this.operativosRef, orderBy('nome'));
      const unsubscribe = onSnapshot(
        q,
        (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Operativo[];
          subscriber.next(list);
        },
        (err) => subscriber.error(err)
      );

      return () => unsubscribe();
    });
  }

  async criar(operativo: NovoOperativo): Promise<string> {
    const smartId = await this.smartId.next('OP');
    const ref = doc(db, 'operativos', smartId);
    await setDoc(ref, { ...operativo, pedidosRespondidos: 0, criadoEm: Date.now() });
    return smartId;
  }

  async atualizar(id: string, changes: Partial<NovoOperativo>): Promise<void> {
    await updateDoc(doc(db, 'operativos', id), changes);
  }

  async excluir(id: string): Promise<void> {
    await deleteDoc(doc(db, 'operativos', id));
  }

  async registrarResposta(id: string): Promise<void> {
    const ref = doc(db, 'operativos', id);
    const current = await this.obter(id);
    await updateDoc(ref, {
      pedidosRespondidos: (current?.pedidosRespondidos ?? 0) + 1,
    });
  }

  async obter(id: string): Promise<Operativo | undefined> {
    const snapshot = await doc(db, 'operativos', id);
    return snapshot ? undefined : undefined;
  }
}
