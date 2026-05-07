// src/app/features/pronostico/pronostico.ts

import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { forkJoin, interval, of, Subscription } from 'rxjs';
import { catchError, finalize, timeout } from 'rxjs/operators';

import { ApiService } from '../../services/api.services';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-pronostico',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './pronostico.html',
  styleUrl: './pronostico.css'
})
export class PronosticoComponent implements OnInit, OnDestroy {

  loading = false;
  errorMessage = '';
  warningMessage = '';

  ciudad = environment.OPENWEATHER_CITY || 'Riohacha';

  fechaActual = '';
  descripcionActual = '';
  temperaturaActual = 0;
  temperaturaPromedio = 0;
  humedad = 0;
  viento = 0;
  precipitacion = 0;
  iconoActual = '01d';

  totalRegistros = 0;
  diasConLluvia = 0;

  tabActiva: 'temperatura' | 'precipitaciones' | 'viento' = 'temperatura';

  hourlyData: any[] = [];
  dailyData: any[] = [];

  alertaTitulo = '';
  alertaDescripcion = '';
  alertaTiempo = 'Actualizado hace unos segundos';

  autoRefreshSub?: Subscription;

  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Temperatura',
        fill: true,
        tension: 0.35,
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 5,
        borderColor: '#facc15',
        backgroundColor: 'rgba(250, 204, 21, 0.15)',
        pointBackgroundColor: '#facc15',
        pointBorderColor: '#facc15'
      }
    ]
  };

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#cbd5e1'
        }
      },
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(255,255,255,0.08)'
        },
        ticks: {
          color: '#cbd5e1'
        }
      }
    }
  };

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarPronostico();

    this.autoRefreshSub = interval(3600000).subscribe(() => {
      this.cargarPronostico();
    });
  }

  ngOnDestroy(): void {
    if (this.autoRefreshSub) {
      this.autoRefreshSub.unsubscribe();
    }
  }

  cargarPronostico(): void {
    this.loading = true;
    this.errorMessage = '';
    this.warningMessage = '';
    this.cdr.detectChanges();

    console.log('🌦️ Cargando pronóstico desde backend...');

    forkJoin({
      actual: this.api.getClimaActual().pipe(
        timeout(20000),
        catchError((error: any) => {
          console.error('❌ Error en clima actual:', error);
          return of({
            error: true,
            source: 'actual',
            detalle: error.error || error.message || error
          });
        })
      ),
      pronostico: this.api.getPronostico5Dias().pipe(
        timeout(20000),
        catchError((error: any) => {
          console.error('❌ Error en forecast:', error);
          return of({
            error: true,
            source: 'forecast',
            detalle: error.error || error.message || error
          });
        })
      )
    })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (resp: any) => {
          console.log('📥 Respuesta clima actual:', resp.actual);
          console.log('📥 Respuesta forecast:', resp.pronostico);

          const actualTieneError = resp.actual?.error === true;
          const forecastTieneError = resp.pronostico?.error === true;

          if (actualTieneError && forecastTieneError) {
            this.errorMessage = this.obtenerMensajeErrorPronostico(resp.actual, resp.pronostico);
            this.generarDatosVacios();
            return;
          }

          if (!actualTieneError) {
            this.procesarClimaActual(resp.actual);
          } else {
            this.warningMessage = 'No fue posible cargar el clima actual, pero se intentará mostrar el pronóstico disponible.';
          }

          if (!forecastTieneError) {
            this.procesarPronostico(resp.pronostico);
          } else {
            this.warningMessage = 'El clima actual cargó, pero el pronóstico por horas no respondió.';
            this.generarForecastBasicoDesdeActual();
          }

          this.errorMessage = '';
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('❌ Error general cargando pronóstico:', error);

          this.errorMessage =
            error.error?.detail ||
            error.error?.detalle ||
            error.error?.error ||
            error.message ||
            'No fue posible cargar el pronóstico del clima.';

          this.generarDatosVacios();
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  obtenerMensajeErrorPronostico(actual: any, forecast: any): string {
    const detalleActual =
      actual?.detalle?.detail ||
      actual?.detalle?.detalle ||
      actual?.detalle?.error ||
      actual?.detalle;

    const detalleForecast =
      forecast?.detalle?.detail ||
      forecast?.detalle?.detalle ||
      forecast?.detalle?.error ||
      forecast?.detalle;

    if (detalleActual && typeof detalleActual === 'string') {
      return detalleActual;
    }

    if (detalleForecast && typeof detalleForecast === 'string') {
      return detalleForecast;
    }

    return 'No fue posible cargar el pronóstico desde el backend.';
  }

  procesarClimaActual(data: any): void {
    this.temperaturaActual = Math.round(data.main?.temp || 0);
    this.humedad = data.main?.humidity || 0;
    this.viento = Math.round((data.wind?.speed || 0) * 3.6);
    this.descripcionActual = this.capitalize(data.weather?.[0]?.description || 'Sin descripción');
    this.iconoActual = data.weather?.[0]?.icon || '01d';

    const lluvia1h = data.rain?.['1h'] || 0;
    const lluvia3h = data.rain?.['3h'] || 0;

    this.precipitacion = Math.round(lluvia1h || lluvia3h || 0);

    const now = new Date();
    this.fechaActual = this.formatearFecha(now);

    this.generarAlertaClimatica();
  }

  procesarPronostico(data: any): void {
    const lista = data.list || [];

    this.totalRegistros = lista.length;

    const primerasHoras = lista.slice(0, 8);

    this.hourlyData = primerasHoras.map((item: any) => ({
      hora: this.formatearHora(item.dt_txt),
      temperatura: Math.round(item.main?.temp || 0),
      precipitacion: Math.round((item.pop || 0) * 100),
      viento: Math.round((item.wind?.speed || 0) * 3.6)
    }));

    const primerItem = primerasHoras[0];

    if (primerItem) {
      this.precipitacion = Math.round((primerItem.pop || 0) * 100);
    }

    this.actualizarGrafica();

    const agrupado = this.agruparPorDia(lista);
    this.dailyData = agrupado.slice(0, 7);

    this.diasConLluvia = this.dailyData.filter((d: any) => d.lluvia > 0).length;

    if (this.dailyData.length > 0) {
      const promedio =
        this.dailyData.reduce((acc: number, item: any) => acc + item.max, 0) / this.dailyData.length;

      this.temperaturaPromedio = Math.round(promedio);
    } else {
      this.temperaturaPromedio = this.temperaturaActual;
    }
  }

  generarForecastBasicoDesdeActual(): void {
    const ahora = new Date();

    this.hourlyData = Array.from({ length: 8 }).map((_, index) => {
      const fecha = new Date(ahora);
      fecha.setHours(fecha.getHours() + index * 3);

      return {
        hora: this.formatearHoraDesdeDate(fecha),
        temperatura: this.temperaturaActual,
        precipitacion: this.precipitacion,
        viento: this.viento
      };
    });

    this.dailyData = Array.from({ length: 5 }).map((_, index) => {
      const fecha = new Date(ahora);
      fecha.setDate(fecha.getDate() + index);

      return {
        fecha: fecha.toISOString().slice(0, 10),
        dia: this.obtenerNombreDia(fecha.toISOString().slice(0, 10)),
        icono: this.iconoActual,
        descripcion: this.descripcionActual,
        max: this.temperaturaActual,
        min: Math.max(this.temperaturaActual - 4, 0),
        lluvia: this.precipitacion
      };
    });

    this.totalRegistros = this.hourlyData.length;
    this.diasConLluvia = this.dailyData.filter((d: any) => d.lluvia > 0).length;
    this.temperaturaPromedio = this.temperaturaActual;

    this.actualizarGrafica();
  }

  generarDatosVacios(): void {
    this.fechaActual = this.formatearFecha(new Date());
    this.descripcionActual = 'Sin información climática';
    this.temperaturaActual = 0;
    this.temperaturaPromedio = 0;
    this.humedad = 0;
    this.viento = 0;
    this.precipitacion = 0;
    this.iconoActual = '01d';
    this.totalRegistros = 0;
    this.diasConLluvia = 0;
    this.hourlyData = [];
    this.dailyData = [];
    this.alertaTitulo = 'Sin datos climáticos';
    this.alertaDescripcion = 'No fue posible consultar la información del clima en este momento.';
    this.actualizarGrafica();
  }

  cambiarTab(tab: 'temperatura' | 'precipitaciones' | 'viento'): void {
    this.tabActiva = tab;
    this.actualizarGrafica();
  }

  actualizarGrafica(): void {
    const labels = this.hourlyData.map((item: any) => item.hora);

    let data: number[] = [];
    let label = '';
    let borderColor = '#facc15';
    let backgroundColor = 'rgba(250, 204, 21, 0.15)';

    if (this.tabActiva === 'temperatura') {
      data = this.hourlyData.map((item: any) => item.temperatura);
      label = 'Temperatura';
      borderColor = '#facc15';
      backgroundColor = 'rgba(250, 204, 21, 0.15)';
    }

    if (this.tabActiva === 'precipitaciones') {
      data = this.hourlyData.map((item: any) => item.precipitacion);
      label = 'Precipitaciones';
      borderColor = '#38bdf8';
      backgroundColor = 'rgba(56, 189, 248, 0.15)';
    }

    if (this.tabActiva === 'viento') {
      data = this.hourlyData.map((item: any) => item.viento);
      label = 'Viento';
      borderColor = '#4ade80';
      backgroundColor = 'rgba(74, 222, 128, 0.15)';
    }

    this.lineChartData = {
      labels,
      datasets: [
        {
          data,
          label,
          fill: true,
          tension: 0.35,
          borderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 5,
          borderColor,
          backgroundColor,
          pointBackgroundColor: borderColor,
          pointBorderColor: borderColor
        }
      ]
    };
  }

  agruparPorDia(lista: any[]): any[] {
    const mapa = new Map<string, any[]>();

    lista.forEach((item: any) => {
      const fecha = item.dt_txt.split(' ')[0];

      if (!mapa.has(fecha)) {
        mapa.set(fecha, []);
      }

      mapa.get(fecha)?.push(item);
    });

    const resultado: any[] = [];

    mapa.forEach((items, fecha) => {
      const temps = items.map((i: any) => i.main.temp);
      const lluvias = items.map((i: any) => Math.round((i.pop || 0) * 100));
      const medioDia = items[Math.floor(items.length / 2)];

      resultado.push({
        fecha,
        dia: this.obtenerNombreDia(fecha),
        icono: medioDia.weather?.[0]?.icon || '01d',
        descripcion: this.capitalize(medioDia.weather?.[0]?.description || ''),
        max: Math.round(Math.max(...temps)),
        min: Math.round(Math.min(...temps)),
        lluvia: Math.max(...lluvias)
      });
    });

    return resultado;
  }

  generarAlertaClimatica(): void {
    if (this.temperaturaActual >= 35) {
      this.alertaTitulo = 'Calor excesivo';
      this.alertaDescripcion = 'Se espera un calor intenso en esta zona.';
      return;
    }

    if (this.precipitacion >= 60) {
      this.alertaTitulo = 'Lluvias probables';
      this.alertaDescripcion = 'Existe una alta probabilidad de precipitaciones en las próximas horas.';
      return;
    }

    if (this.viento > 35) {
      this.alertaTitulo = 'Vientos fuertes';
      this.alertaDescripcion = 'Se recomienda precaución por ráfagas de viento en la zona.';
      return;
    }

    this.alertaTitulo = 'Condiciones estables';
    this.alertaDescripcion = 'No se observan cambios climáticos críticos por el momento.';
  }

  obtenerNombreDia(fecha: string): string {
    const dias = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
    const date = new Date(fecha + 'T00:00:00');
    return dias[date.getDay()];
  }

  formatearHora(fechaHora: string): string {
    const date = new Date(fechaHora);
    return this.formatearHoraDesdeDate(date);
  }

  formatearHoraDesdeDate(date: Date): string {
    let horas = date.getHours();
    const ampm = horas >= 12 ? 'p.m.' : 'a.m.';
    horas = horas % 12;
    horas = horas ? horas : 12;
    return `${horas} ${ampm}`;
  }

  formatearFecha(date: Date): string {
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const horas = date.getHours();
    const minutos = date.getMinutes().toString().padStart(2, '0');
    const ampm = horas >= 12 ? 'p.m.' : 'a.m.';
    const hora12 = horas % 12 || 12;

    return `${dias[date.getDay()]}, ${hora12}:${minutos} ${ampm}`;
  }

  getIconoUrl(icono: string): string {
    return `https://openweathermap.org/img/wn/${icono}@2x.png`;
  }

  capitalize(texto: string): string {
    if (!texto) return '';
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }
}