import { Component, inject, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { EjercicioService, EjercicioRegistro, Serie } from '../../services/ejercicio.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-ejercicios',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './ejercicios.component.html',
  styleUrl: './ejercicios.component.scss'
})
export class EjerciciosComponent implements OnInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  private ejercicioService = inject(EjercicioService);
  private authService = inject(AuthService);
  private chart: Chart | null = null;

  registros = signal<EjercicioRegistro[]>([]);
  nombresEjercicios = signal<string[]>([]);
  cargando = signal(true);
  vista = signal<'lista' | 'nuevo' | 'progreso'>('lista');
  ejercicioSeleccionado = signal<string>('');
  mesSeleccionado = new Date().toISOString().slice(0, 7);

  fecha = new Date().toISOString().split('T')[0];
  nombre = '';
  nombreCustom = '';
  series: Serie[] = [{ reps: 0, peso: 0 }];
  nota = '';
  guardando = signal(false);
  error = signal('');

  get mesesDisponibles(): string[] {
    const meses = new Set(this.registros().map(r => r.fecha.slice(0, 7)));
    return Array.from(meses).sort((a, b) => b.localeCompare(a));
  }

  get registrosFiltrados(): EjercicioRegistro[] {
    return this.registros()
      .filter(r => r.fecha.startsWith(this.mesSeleccionado))
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }

  get nombreMes(): string {
    const [year, month] = this.mesSeleccionado.split('-');
    const nombre = new Date(Number(year), Number(month) - 1)
      .toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    return nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase().replace(/\bde\b/, 'de');
  }

  get registrosRecientes(): EjercicioRegistro[] {
    return this.registros().slice(0, 10);
  }

  async ngOnInit() {
      await this.authService.waitForUser();

    this.authService.checkAuth();
    const datos = await this.ejercicioService.obtenerEjercicios();
    this.registros.set(datos);
    const nombres = await this.ejercicioService.obtenerNombresEjercicios();
    this.nombresEjercicios.set(nombres);
    this.cargando.set(false);
  }

  anadirSerie() {
    this.series = [...this.series, { reps: 0, peso: 0 }];
  }

  eliminarSerie(i: number) {
    this.series = this.series.filter((_, idx) => idx !== i);
  }

  async guardar() {
    const nombreFinal = this.nombre === '__custom__' ? this.nombreCustom : this.nombre;
    if (!nombreFinal) { this.error.set('Introduce el nombre del ejercicio'); return; }
    if (this.series.length === 0) { this.error.set('Añade al menos una serie'); return; }

    this.guardando.set(true);
    this.error.set('');
    try {
      await this.ejercicioService.guardarEjercicio({
        fecha: this.fecha,
        nombre: nombreFinal,
        series: this.series,
        nota: this.nota
      });
      const datos = await this.ejercicioService.obtenerEjercicios();
      this.registros.set(datos);
      const nombres = await this.ejercicioService.obtenerNombresEjercicios();
      this.nombresEjercicios.set(nombres);
      this.nombre = '';
      this.nombreCustom = '';
      this.series = [{ reps: 0, peso: 0 }];
      this.nota = '';
      this.vista.set('lista');
    } catch (e) {
      this.error.set('Error al guardar');
    }
    this.guardando.set(false);
  }

  async eliminar(id: string) {
    await this.ejercicioService.eliminarEjercicio(id);
    const datos = await this.ejercicioService.obtenerEjercicios();
    this.registros.set(datos);
    const nombres = await this.ejercicioService.obtenerNombresEjercicios();
    this.nombresEjercicios.set(nombres);
  }

  async verProgreso(nombre: string) {
    this.ejercicioSeleccionado.set(nombre);
    this.vista.set('progreso');
    const progreso = await this.ejercicioService.obtenerProgresoEjercicio(nombre);
    setTimeout(() => this.renderChart(progreso), 100);
  }

  renderChart(progreso: EjercicioRegistro[]) {
  if (!this.chartCanvas) return;
  if (this.chart) this.chart.destroy();
  const ctx = this.chartCanvas.nativeElement.getContext('2d');
  const labels = progreso.map(e => {
    const d = new Date(e.fecha + 'T00:00:00');
    return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
  });
    const maxPesos = progreso.map(e => Math.max(...e.series.map(s => s.peso)));

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Peso máx (kg)',
          data: maxPesos,
          borderColor: '#ff6a00',
          backgroundColor: 'rgba(255,106,0,0.1)',
          borderWidth: 2,
          pointBackgroundColor: '#ff6a00',
          pointRadius: 5,
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1a1a1a',
            borderColor: '#ff6a00',
            borderWidth: 1,
            titleColor: 'white',
            bodyColor: 'rgba(255,255,255,0.7)'
          }
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.4)' } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.4)' } }
        }
      }
    });
  }

  logout() { this.authService.logout(); }
}