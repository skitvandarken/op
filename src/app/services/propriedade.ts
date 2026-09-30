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
import { Propriedade } from '../models/propriedade.model';
import { SmartIdService } from './smart-id';

@Injectable({ providedIn: 'root' })
export class PropriedadeService {
  private readonly propriedadesRef = collection(db, 'propriedades');

  constructor(private smartId: SmartIdService) {}

  listar$(): Observable<Propriedade[]> {
    return new Observable<Propriedade[]>((subscriber) => {
      const q = query(this.propriedadesRef, orderBy('item'));
      const unsubscribe = onSnapshot(
        q,
        (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Propriedade[];
          subscriber.next(list);
        },
        (err) => subscriber.error(err)
      );

      return () => unsubscribe();
    });
  }

  async criar(propriedade: Omit<Propriedade, 'id'>): Promise<string> {
    const prefix = 'PROP';
    const smartId = await this.smartId.next(prefix);
    const ref = doc(db, 'propriedades', smartId);
    await setDoc(ref, { ...propriedade, criadoEm: Date.now() });
    return smartId;
  }

  async atualizar(id: string, changes: Partial<Omit<Propriedade, 'id'>>): Promise<void> {
    await updateDoc(doc(db, 'propriedades', id), changes);
  }

  async excluir(id: string): Promise<void> {
    await deleteDoc(doc(db, 'propriedades', id));
  }
}
