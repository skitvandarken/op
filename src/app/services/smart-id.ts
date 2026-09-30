// smart-id.service.ts
import { Injectable } from '@angular/core';
import { doc, runTransaction } from 'firebase/firestore';
import { db } from '../app.config';   // adjust path to your app.config

@Injectable({ providedIn: 'root' })
export class SmartIdService {
  /**
   * Generates the next Smart ID for a given prefix.
   * Format: PREFIX-YYMM-NNN  (sequence resets monthly)
   *
   * @param prefix e.g. "CLI", "PED", "PROP"
   */
  async next(prefix: string): Promise<string> {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const period = `${yy}${mm}`;                 // e.g. "2609"
    const counterId = `${prefix}_${period}`;     // e.g. "CLI_2609"

    const counterRef = doc(db, 'counters', counterId);

    const seq = await runTransaction(db, async (tx) => {
      const snap = await tx.get(counterRef);
      const current = snap.exists() ? (snap.data()['seq'] as number) : 0;
      const next = current + 1;
      tx.set(counterRef, { seq: next, updatedAt: Date.now() }, { merge: true });
      return next;
    });

    return `${prefix}-${period}-${String(seq).padStart(3, '0')}`;
  }
}