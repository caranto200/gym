import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { PerfilService, Perfil } from '../../services/perfil.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss'
})
export class PerfilComponent implements OnInit {
  private authService = inject(AuthService);
  private perfilService = inject(PerfilService);

  user$ = this.authService.user$;
  guardando = signal(false);
  guardado = signal(false);
  cargando = signal(true);

  altura = '';
  pesoObjetivo = '';

async ngOnInit() {
  await this.authService.waitForUser();
  this.authService.checkAuth();
  const perfil = await this.perfilService.obtenerPerfil();
  if (perfil) {
    this.altura = perfil.altura?.toString() || '';
    this.pesoObjetivo = perfil.pesoObjetivo?.toString() || '';
  }
  this.cargando.set(false);
}

  async guardar() {
    this.guardando.set(true);
    this.guardado.set(false);
    await this.perfilService.guardarPerfil({
      altura: this.altura ? Number(this.altura) : undefined,
      pesoObjetivo: this.pesoObjetivo ? Number(this.pesoObjetivo) : undefined
    });
    this.guardando.set(false);
    this.guardado.set(true);
    setTimeout(() => this.guardado.set(false), 3000);
  }

  logout() { this.authService.logout(); }
}