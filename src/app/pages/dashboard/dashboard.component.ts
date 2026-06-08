import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PesoService, RegistroPeso } from '../../services/peso.service';
import { CommonModule } from '@angular/common';
import { PerfilService, Perfil } from '../../services/perfil.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private pesoService = inject(PesoService);
  private router = inject(Router);
  

  user$ = this.authService.user$;
  registros = signal<RegistroPeso[]>([]);
  cargando = signal(true);

  private perfilService = inject(PerfilService);
perfil = signal<Perfil | null>(null);

get progresoObjetivo(): number {
  if (!this.perfil()?.pesoObjetivo || !this.ultimoPeso || !this.pesoInicial) return 0;
  const objetivo = this.perfil()!.pesoObjetivo!;
  const inicio = this.pesoInicial;
  const actual = this.ultimoPeso;

  // Si el objetivo es bajar
  if (objetivo < inicio) {
    if (actual <= objetivo) return 100;
    if (actual >= inicio) return 0;
    return Math.round(((inicio - actual) / (inicio - objetivo)) * 100);
  }

  // Si el objetivo es subir
  if (objetivo > inicio) {
    if (actual >= objetivo) return 100;
    if (actual <= inicio) return 0;
    return Math.round(((actual - inicio) / (objetivo - inicio)) * 100);
  }

  return 100;
}

get faltanKg(): number | null {
  if (!this.perfil()?.pesoObjetivo || !this.ultimoPeso) return null;
  return Math.round((this.perfil()!.pesoObjetivo! - this.ultimoPeso) * 10) / 10;
}
  get ultimoPeso(): number | null {
    return this.registros().length > 0 ? this.registros()[0].peso : null;
  }

  get pesoInicial(): number | null {
    const r = this.registros();
    return r.length > 0 ? r[r.length - 1].peso : null;
  }

  get diferencia(): number | null {
    if (this.ultimoPeso && this.pesoInicial) {
      return Math.round((this.ultimoPeso - this.pesoInicial) * 10) / 10;
    }
    return null;
  }

  get registrosRecientes(): RegistroPeso[] {
    return this.registros().slice(0, 7);
  }

async ngOnInit() {
    await this.authService.waitForUser();
const perfil = await this.perfilService.obtenerPerfil();
this.perfil.set(perfil);
  this.authService.checkAuth();
  const datos = await this.pesoService.obtenerPesos();
  this.registros.set(datos);
  this.cargando.set(false);
}

  async eliminar(id: string) {
    await this.pesoService.eliminarPeso(id);
    const datos = await this.pesoService.obtenerPesos();
    this.registros.set(datos);
  }
  
get imc(): number | null {
  if (!this.perfil()?.altura || !this.ultimoPeso) return null;
  const alturaM = this.perfil()!.altura! / 100;
  return Math.round((this.ultimoPeso / (alturaM * alturaM)) * 10) / 10;
}

get imcCategoria(): string {
  if (!this.imc) return '';
  if (this.imc < 18.5) return 'Bajo peso';
  if (this.imc < 25) return 'Normal';
  if (this.imc < 30) return 'Sobrepeso';
  return 'Obesidad';
}

get imcColor(): string {
  if (!this.imc) return '';
  if (this.imc < 18.5) return '#2196f3';
  if (this.imc < 25) return '#00c853';
  if (this.imc < 30) return '#ff6a00';
  return '#ff3d00';
}
  logout() {
    this.authService.logout();
  }
}