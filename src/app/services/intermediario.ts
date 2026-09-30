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
import { Intermediario, NovoIntermediario } from '../models/intermediario.model';
import { SmartIdService } from './smart-id';

@Injectable({ providedIn: 'root' })
export class IntermediarioService {
  private readonly intermediariosRef = collection(db, 'intermediarios');

  constructor(private readonly smartId: SmartIdService) {}

  listar$(): Observable<Intermediario[]> {
    return new Observable<Intermediario[]>((subscriber) => {
      const q = query(this.intermediariosRef, orderBy('nome'));
      const unsubscribe = onSnapshot(
        q,
        (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Intermediario[];
          subscriber.next(list);
        },
        (err) => subscriber.error(err)
      );

      return () => unsubscribe();
    });
  }

  async criar(intermediario: NovoIntermediario): Promise<string> {
    const smartId = await this.smartId.next('INT');
    const ref = doc(db, 'intermediarios', smartId);
    await setDoc(ref, { ...intermediario, criadoEm: Date.now() });
    return smartId;
  }

  async atualizar(id: string, changes: Partial<NovoIntermediario>): Promise<void> {
    await updateDoc(doc(db, 'intermediarios', id), { ...changes, atualizadoEm: Date.now() });
  }

  async excluir(id: string): Promise<void> {
    await deleteDoc(doc(db, 'intermediarios', id));
  }
}
