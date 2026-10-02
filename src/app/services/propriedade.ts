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

  private sanitizeForFirestore<T>(value: T): T {
    if (Array.isArray(value)) {
      return value
        .map((item) => this.sanitizeForFirestore(item))
        .filter((item) => item !== undefined) as T;
    }

    if (value !== null && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).filter(([, entryValue]) => entryValue !== undefined)
          .map(([key, entryValue]) => [key, this.sanitizeForFirestore(entryValue)])
      ) as T;
    }

    return value;
  }

  private normalizeGoogleDriveUrl(url: string): string {
    if (!url) {
      return url;
    }

    const match = url.match(/(?:\/d\/|id=)([a-zA-Z0-9_-]+)/i);
    if (!match?.[1]) {
      return url.trim();
    }

    return `https://drive.usercontent.google.com/download?id=${match[1]}&export=view`;
  }

  listar$(): Observable<Propriedade[]> {
    return new Observable<Propriedade[]>((subscriber) => {
      const q = query(this.propriedadesRef, orderBy('item'));
      const unsubscribe = onSnapshot(
        q,
        (snap) => {
          const list = snap.docs.map((d) => {
            const data = d.data() as Partial<Propriedade>;
            return {
              ...(data as Omit<Propriedade, 'id'>),
              id: d.id,
              imagens: Array.isArray(data.imagens)
                ? data.imagens.map((imagem) => this.normalizeGoogleDriveUrl(String(imagem)))
                : [],
            } as Propriedade;
          });
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
    const normalizedPropriedade = {
      ...propriedade,
      imagens: (propriedade.imagens ?? []).map((imagem) => this.normalizeGoogleDriveUrl(imagem)),
      criadoEm: Date.now(),
    };
    await setDoc(ref, this.sanitizeForFirestore(normalizedPropriedade));
    return smartId;
  }

  async atualizar(id: string, changes: Partial<Omit<Propriedade, 'id'>>): Promise<void> {
    const normalizedChanges = {
      ...changes,
      imagens: changes.imagens?.map((imagem) => this.normalizeGoogleDriveUrl(imagem)),
    };
    await updateDoc(doc(db, 'propriedades', id), this.sanitizeForFirestore(normalizedChanges));
  }

  async excluir(id: string): Promise<void> {
    await deleteDoc(doc(db, 'propriedades', id));
  }
}
