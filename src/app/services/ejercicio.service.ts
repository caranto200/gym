import { Injectable, inject } from '@angular/core';
import { Database, ref, push, set, get, remove, query, orderByChild } from '@angular/fire/database';
import { Auth } from '@angular/fire/auth';

export interface Serie {
  reps: number;
  peso: number;
}

export interface EjercicioRegistro {
  id?: string;
  fecha: string;
  nombre: string;
  series: Serie[];
  nota?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EjercicioService {
  private db = inject(Database);
  private auth = inject(Auth);

  private getUserId(): string {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No user');
    return user.uid;
  }

  async guardarEjercicio(registro: EjercicioRegistro): Promise<void> {
    const uid = this.getUserId();
    const ejerciciosRef = ref(this.db, `usuarios/${uid}/ejercicios`);
    const nuevoRef = push(ejerciciosRef);
    await set(nuevoRef, registro);
  }

  async obtenerEjercicios(): Promise<EjercicioRegistro[]> {
    const uid = this.getUserId();
    const snapshot = await get(ref(this.db, `usuarios/${uid}/ejercicios`));
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.entries(data)
      .map(([id, val]: any) => ({ id, ...val }))
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }

  async eliminarEjercicio(id: string): Promise<void> {
    const uid = this.getUserId();
    await remove(ref(this.db, `usuarios/${uid}/ejercicios/${id}`));
  }

  async obtenerNombresEjercicios(): Promise<string[]> {
    const todos = await this.obtenerEjercicios();
    const nombres = new Set(todos.map(e => e.nombre));
    return Array.from(nombres).sort();
  }

  async obtenerProgresoEjercicio(nombre: string): Promise<EjercicioRegistro[]> {
    const todos = await this.obtenerEjercicios();
    return todos
      .filter(e => e.nombre === nombre)
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  }
}