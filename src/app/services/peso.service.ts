import { Injectable, inject } from '@angular/core';
import { Database, ref, push, set, get, remove, query, orderByChild } from '@angular/fire/database';
import { Auth } from '@angular/fire/auth';

export interface RegistroPeso {
  id?: string;
  fecha: string;
  peso: number;
  nota?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PesoService {
  private db = inject(Database);
  private auth = inject(Auth);

  private getUserId(): string {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No user');
    return user.uid;
  }

  async guardarPeso(registro: RegistroPeso): Promise<void> {
    const uid = this.getUserId();
    const registrosRef = ref(this.db, `usuarios/${uid}/pesos`);
    const nuevoRef = push(registrosRef);
    await set(nuevoRef, registro);
  }

  async obtenerPesos(): Promise<RegistroPeso[]> {
    const uid = this.getUserId();
    const registrosRef = query(ref(this.db, `usuarios/${uid}/pesos`), orderByChild('fecha'));
    const snapshot = await get(registrosRef);
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.entries(data).map(([id, val]: any) => ({ id, ...val }))
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }

  async eliminarPeso(id: string): Promise<void> {
    const uid = this.getUserId();
    await remove(ref(this.db, `usuarios/${uid}/pesos/${id}`));
  }
}