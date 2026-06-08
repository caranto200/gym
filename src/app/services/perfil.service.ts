import { Injectable, inject } from '@angular/core';
import { Database, ref, set, get } from '@angular/fire/database';
import { Auth } from '@angular/fire/auth';

export interface Perfil {
  altura?: number;
  pesoObjetivo?: number;
  nombre?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  private db = inject(Database);
  private auth = inject(Auth);

  private getUserId(): string {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No user');
    return user.uid;
  }

  async guardarPerfil(perfil: Perfil): Promise<void> {
    const uid = this.getUserId();
    await set(ref(this.db, `usuarios/${uid}/perfil`), perfil);
  }

  async obtenerPerfil(): Promise<Perfil | null> {
    const uid = this.getUserId();
    const snapshot = await get(ref(this.db, `usuarios/${uid}/perfil`));
    if (!snapshot.exists()) return null;
    return snapshot.val();
  }
}