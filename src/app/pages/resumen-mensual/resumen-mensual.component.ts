import { Component, inject, OnInit, signal, AfterViewInit, ViewChild, ElementRef, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PesoService, RegistroPeso } from '../../services/peso.service';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../../services/auth.service';

Chart.register(...registerables);

interface ResumenMes {
  pesoMin: number;
  pesoMax: number;
  pesoPromedio: number;
  totalRegistros: number;
  diferencia: number;
  registros: RegistroPeso[];
}

@Component({
  selector: 'app-resumen-mensual',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './resumen-mensual.component.html',
  styleUrl: './resumen-mensual.component.scss'
})
export class ResumenMensualComponent implements OnInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  private pesoService = inject(PesoService);
  private chart: Chart | null = null;
private authService = inject(AuthService);
  todosLosRegistros = signal<RegistroPeso[]>([]);
  cargando = signal(true);
  mesSeleccionado = new Date().toISOString().slice(0, 7);

  get mesesDisponibles(): string[] {
    const meses = new Set(this.todosLosRegistros().map(r => r.fecha.slice(0, 7)));
    return Array.from(meses).sort((a, b) => b.localeCompare(a));
  }

  get resumen(): ResumenMes | null {
    const registros = this.todosLosRegistros().filter(r => r.fecha.startsWith(this.mesSeleccionado));
    if (registros.length === 0) return null;
    const sorted = registros.sort((a, b) => a.fecha.localeCompare(b.fecha));
    const pesos = sorted.map(r => r.peso);
    return {
      pesoMin: Math.min(...pesos),
      pesoMax: Math.max(...pesos),
      pesoPromedio: Math.round(pesos.reduce((a, b) => a + b, 0) / pesos.length * 10) / 10,
      totalRegistros: sorted.length,
      diferencia: Math.round((pesos[pesos.length - 1] - pesos[0]) * 10) / 10,
      registros: sorted
    };
  }

get nombreMes(): string {
  const [year, month] = this.mesSeleccionado.split('-');
  const nombre = new Date(Number(year), Number(month) - 1)
    .toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  return nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase().replace(/\bde\b/, 'de');
}

  get diasDelMes(): (RegistroPeso | null)[] {
    const [year, month] = this.mesSeleccionado.split('-');
    const totalDias = new Date(Number(year), Number(month), 0).getDate();
    const registrosPorDia = new Map(
      this.todosLosRegistros()
        .filter(r => r.fecha.startsWith(this.mesSeleccionado))
        .map(r => [r.fecha, r])
    );
    return Array.from({ length: totalDias }, (_, i) => {
      const dia = String(i + 1).padStart(2, '0');
      const fecha = `${this.mesSeleccionado}-${dia}`;
      return registrosPorDia.get(fecha) || null;
    });
  }

  get primerDiaSemana(): number {
    const [year, month] = this.mesSeleccionado.split('-');
    let dia = new Date(Number(year), Number(month) - 1, 1).getDay();
    return dia === 0 ? 6 : dia - 1;
  }

async ngOnInit() {
   await this.authService.waitForUser();
  this.authService.checkAuth();
  const datos = await this.pesoService.obtenerPesos();
  this.todosLosRegistros.set(datos);
  this.cargando.set(false);
  setTimeout(() => this.renderChart(), 100);
}

  onMesChange() {
    setTimeout(() => this.renderChart(), 100);
  }

  renderChart() {
    if (!this.chartCanvas || !this.resumen) return;
    if (this.chart) this.chart.destroy();
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    const labels = this.resumen.registros.map(r => {
      const d = new Date(r.fecha + 'T00:00:00');
      return d.getDate() + ' ' + d.toLocaleDateString('es-ES', { month: 'short' });
    });
    const data = this.resumen.registros.map(r => r.peso);

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Peso (kg)',
          data,
          borderColor: '#ff6a00',
          backgroundColor: 'rgba(255, 106, 0, 0.1)',
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
          x: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: 'rgba(255,255,255,0.4)' }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: 'rgba(255,255,255,0.4)' }
          }
        }
      }
    });
  }
  logout() {
  this.authService.logout();
}
}