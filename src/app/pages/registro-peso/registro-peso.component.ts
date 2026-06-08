import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PesoService } from '../../services/peso.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro-peso',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro-peso.component.html',
  styleUrl: './registro-peso.component.scss'
})
export class RegistroPesoComponent implements OnInit {
  private pesoService = inject(PesoService);
  private router = inject(Router);
  private authService = inject(AuthService);

  fecha = new Date().toISOString().split('T')[0];
  peso = '';
  nota = '';
  guardando = signal(false);
  error = signal('');

  async ngOnInit() {
     await this.authService.waitForUser();
    this.authService.checkAuth();
  }

  async guardar() {
    if (!this.peso || isNaN(Number(this.peso))) {
      this.error.set('Introduce un peso válido');
      return;
    }
    this.guardando.set(true);
    this.error.set('');
    try {
      await this.pesoService.guardarPeso({
        fecha: this.fecha,
        peso: Number(this.peso),
        nota: this.nota
      });
      this.router.navigate(['/dashboard']);
    } catch (e) {
      this.error.set('Error al guardar. Inténtalo de nuevo.');
      this.guardando.set(false);
    }
  }

  logout() {
    this.authService.logout();
  }
}