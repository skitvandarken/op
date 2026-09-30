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
import { NovaReclamacao, Reclamacao } from '../models/reclamacao.model';
import { SmartIdService } from './smart-id';

@Injectable({ providedIn: 'root' })
export class ReclamacaoService {
  private readonly reclamacoesRef = collection(db, 'reclamacoes');

  constructor(private readonly smartId: SmartIdService) {}

  listar$(): Observable<Reclamacao[]> {
    return new Observable<Reclamacao[]>((subscriber) => {
      const q = query(this.reclamacoesRef, orderBy('criadoEm', 'desc'));
      const unsubscribe = onSnapshot(
        q,
        (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Reclamacao[];
          subscriber.next(list);
        },
        (err) => subscriber.error(err)
      );

      return () => unsubscribe();
    });
  }

  async criar(reclamacao: NovaReclamacao): Promise<string> {
    const smartId = await this.smartId.next('REC');
    const ref = doc(db, 'reclamacoes', smartId);
    await setDoc(ref, {
      ...reclamacao,
      criadoEm: Date.now(),
      atualizadoEm: Date.now(),
    });
    return smartId;
  }

  async atualizar(id: string, changes: Partial<NovaReclamacao>): Promise<void> {
    await updateDoc(doc(db, 'reclamacoes', id), {
      ...changes,
      atualizadoEm: Date.now(),
    });
  }

  async excluir(id: string): Promise<void> {
    await deleteDoc(doc(db, 'reclamacoes', id));
  }
}
