import { Injectable } from '@angular/core';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { db } from '../app.config';
import { Meio, NovoMeio } from '../models/meio.model';
import { SmartIdService } from './smart-id';

@Injectable({ providedIn: 'root' })
export class MeioService {
  private readonly meiosRef = collection(db, 'meios');

  constructor(private smartId: SmartIdService) {}

  listar$(): Observable<Meio[]> {
    return new Observable<Meio[]>((subscriber) => {
      const q = query(this.meiosRef, orderBy('tipo'));
      const unsubscribe = onSnapshot(
        q,
        (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Meio[];
          subscriber.next(list);
        },
        (err) => subscriber.error(err)
      );

      return () => unsubscribe();
    });
  }

  async obter(id: string): Promise<Meio | undefined> {
    const ref = doc(db, 'meios', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return undefined;
    }

    return { id: snap.id, ...(snap.data() as Omit<Meio, 'id'>) };
  }

  async criar(meio: NovoMeio): Promise<string> {
    const smartId = await this.smartId.next('MEIO');
    const ref = doc(db, 'meios', smartId);
    await setDoc(ref, { ...meio, ativo: true, criadoEm: Date.now() });
    return smartId;
  }

  async atualizar(id: string, changes: Partial<NovoMeio>): Promise<void> {
    await updateDoc(doc(db, 'meios', id), changes);
  }

  async excluir(id: string): Promise<void> {
    await deleteDoc(doc(db, 'meios', id));
  }

  async associarOperativo(meioId: string, operativoId: string, operativoNome: string): Promise<void> {
    await updateDoc(doc(db, 'meios', meioId), {
      operativoId,
      operativoNome,
      ativo: true,
    });
  }

  async desassociarOperativo(meioId: string): Promise<void> {
    await updateDoc(doc(db, 'meios', meioId), {
      operativoId: null,
      operativoNome: '',
      ativo: true,
    });
  }
}
