// cliente.service.ts
import { Injectable } from '@angular/core';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { db } from '../app.config';                          // adjust path
import { Cliente, NovoCliente } from '../models/cliente.model';
import { SmartIdService } from '../services/smart-id';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private clientesRef = collection(db, 'clientes');

  constructor(private smartId: SmartIdService) {}

  /** Live list of clientes, ordered by nome. */
  listar$(): Observable<Cliente[]> {
    return new Observable<Cliente[]>((subscriber) => {
      const q = query(this.clientesRef, orderBy('nome'));
      const unsubscribe = onSnapshot(
        q,
        (snap) => {
          const list = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as Cliente[];
          subscriber.next(list);
        },
        (err) => subscriber.error(err)
      );

      // Cleanup when unsubscribed
      return () => unsubscribe();
    });
  }

  /** Live single cliente by ID. */
  obter$(id: string): Observable<Cliente | undefined> {
    return new Observable<Cliente | undefined>((subscriber) => {
      const ref = doc(db, 'clientes', id);
      const unsubscribe = onSnapshot(
        ref,
        (snap) => {
          if (!snap.exists()) {
            subscriber.next(undefined);
            return;
          }
          subscriber.next({ id: snap.id, ...snap.data() } as Cliente);
        },
        (err) => subscriber.error(err)
      );
      return () => unsubscribe();
    });
  }

  /**
   * CREATE — generates a Smart ID (e.g. "CLI-2609-001")
   * and uses it as the Firestore document ID.
   */
  async criar(cliente: NovoCliente): Promise<string> {
    const smartId = await this.smartId.next('CLI');
    const ref = doc(db, 'clientes', smartId);
    await setDoc(ref, {
      ...cliente,
      criadoEm: Date.now(),
    });
    return smartId;
  }

  /** UPDATE — only the fields you pass. */
  async atualizar(id: string, changes: Partial<NovoCliente>): Promise<void> {
    const ref = doc(db, 'clientes', id);
    await updateDoc(ref, changes);
  }

  /** DELETE. */
  async excluir(id: string): Promise<void> {
    const ref = doc(db, 'clientes', id);
    await deleteDoc(ref);
  }
}