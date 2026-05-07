// src/app/core/services/menu.service.ts

import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { RecursoAuth } from '../models/auth-response.model';

export interface MenuItem {
  id: number;
  nombre: string;
  path: string;
  icono?: string;
  orden: number;
  padre: number | null;
  estado: string;
  items: MenuItem[];
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(private storageService: StorageService) {}

  getMenu(): MenuItem[] {
    const recursos = this.storageService
      .getRecursosAuth()
      .filter(recurso => this.estaActivo(recurso))
      .sort((a, b) => this.getOrden(a) - this.getOrden(b));

    // 🔥 Si el backend envía recursos, usamos el menú dinámico real
    if (recursos.length > 0) {
      return this.construirArbol(recursos);
    }

    // 🔥 Si todavía no hay recursos en backend, usamos menú base por rol
    return this.getMenuBasePorRol();
  }

  hasAccess(path: string): boolean {
    const rutaNormalizada = this.normalizarRutaFrontend(path);

    // 🔥 Dashboard siempre permitido si ya está autenticado
    if (rutaNormalizada === '/dashboard') {
      return true;
    }

    const recursos = this.storageService
      .getRecursosAuth()
      .filter(recurso => this.estaActivo(recurso));

    // 🔥 Si hay recursos, validamos contra recursos reales
    if (recursos.length > 0) {
      return recursos.some((recurso: RecursoAuth) => {
        const rutaFrontend = this.normalizarRutaFrontend(
          recurso.url_frontend || recurso.path || recurso.ruta || ''
        );

        return rutaFrontend === rutaNormalizada;
      });
    }

    // 🔥 Si no hay recursos, validamos contra menú base por rol
    return this.tieneAccesoMenuBase(rutaNormalizada);
  }

  // ============================================
  // 🔥 MENÚ BASE POR ROL
  // Se usa mientras el backend no envía recursos
  // ============================================

  private getMenuBasePorRol(): MenuItem[] {
    const roles = this.storageService.getRolesAuth() || [];
    const nombresRoles = roles.map((rol: any) => String(rol.nombre).toLowerCase());

    const esAdministrador = nombresRoles.includes('administrador');
    const esOperador = nombresRoles.includes('operador');
    const esInvitado = nombresRoles.includes('invitado');

    const menu: MenuItem[] = [];

    // Dashboard para todos
    menu.push({
      id: 1,
      nombre: 'Dashboard',
      path: '/dashboard',
      icono: 'fa-solid fa-chart-line',
      orden: 1,
      padre: null,
      estado: 'activo',
      items: []
    });

    // Menú para Administrador
    if (esAdministrador) {
      menu.push(
        {
          id: 2,
          nombre: 'Roles',
          path: '/roles',
          icono: 'fa-solid fa-user-shield',
          orden: 2,
          padre: null,
          estado: 'activo',
          items: []
        },
        {
          id: 3,
          nombre: 'Dispositivos',
          path: '/dispositivos',
          icono: 'fa-solid fa-microchip',
          orden: 3,
          padre: null,
          estado: 'activo',
          items: []
        },
        {
          id: 4,
          nombre: 'Zonas',
          path: '/zonas',
          icono: 'fa-solid fa-map-location-dot',
          orden: 4,
          padre: null,
          estado: 'activo',
          items: []
        },
        {
          id: 5,
          nombre: 'Sensores',
          path: '/sensores',
          icono: 'fa-solid fa-satellite-dish',
          orden: 5,
          padre: null,
          estado: 'activo',
          items: []
        },
        {
          id: 6,
          nombre: 'Lecturas',
          path: '/lecturas',
          icono: 'fa-solid fa-water',
          orden: 6,
          padre: null,
          estado: 'activo',
          items: []
        },
        {
          id: 7,
          nombre: 'Alertas',
          path: '/alertas',
          icono: 'fa-solid fa-triangle-exclamation',
          orden: 7,
          padre: null,
          estado: 'activo',
          items: []
        },
        {
          id: 8,
          nombre: 'Pronóstico',
          path: '/pronostico',
          icono: 'fa-solid fa-cloud-sun-rain',
          orden: 8,
          padre: null,
          estado: 'activo',
          items: []
        },
        {
          id: 9,
          nombre: 'Predicciones',
          path: '/predicciones',
          icono: 'fa-solid fa-brain',
          orden: 9,
          padre: null,
          estado: 'activo',
          items: []
        },
        {
          id: 10,
          nombre: 'Actuadores',
          path: '/actuadores',
          icono: 'fa-solid fa-toggle-on',
          orden: 10,
          padre: null,
          estado: 'activo',
          items: []
        },
        {
          id: 11,
          nombre: 'Usuarios',
          path: '/usuarios',
          icono: 'fa-solid fa-users',
          orden: 11,
          padre: null,
          estado: 'activo',
          items: []
        }
      );
    }

    // Menú para Operador
    if (!esAdministrador && esOperador) {
      menu.push(
        {
          id: 3,
          nombre: 'Dispositivos',
          path: '/dispositivos',
          icono: 'fa-solid fa-microchip',
          orden: 3,
          padre: null,
          estado: 'activo',
          items: []
        },
        {
          id: 5,
          nombre: 'Sensores',
          path: '/sensores',
          icono: 'fa-solid fa-satellite-dish',
          orden: 5,
          padre: null,
          estado: 'activo',
          items: []
        },
        {
          id: 6,
          nombre: 'Lecturas',
          path: '/lecturas',
          icono: 'fa-solid fa-water',
          orden: 6,
          padre: null,
          estado: 'activo',
          items: []
        },
        {
          id: 7,
          nombre: 'Alertas',
          path: '/alertas',
          icono: 'fa-solid fa-triangle-exclamation',
          orden: 7,
          padre: null,
          estado: 'activo',
          items: []
        },
        {
          id: 8,
          nombre: 'Pronóstico',
          path: '/pronostico',
          icono: 'fa-solid fa-cloud-sun-rain',
          orden: 8,
          padre: null,
          estado: 'activo',
          items: []
        },
        {
          id: 9,
          nombre: 'Predicciones',
          path: '/predicciones',
          icono: 'fa-solid fa-brain',
          orden: 9,
          padre: null,
          estado: 'activo',
          items: []
        }
      );
    }

    // Menú para Invitado
    if (!esAdministrador && !esOperador && esInvitado) {
      menu.push(
        {
          id: 7,
          nombre: 'Alertas',
          path: '/alertas',
          icono: 'fa-solid fa-triangle-exclamation',
          orden: 7,
          padre: null,
          estado: 'activo',
          items: []
        },
        {
          id: 8,
          nombre: 'Pronóstico',
          path: '/pronostico',
          icono: 'fa-solid fa-cloud-sun-rain',
          orden: 8,
          padre: null,
          estado: 'activo',
          items: []
        }
      );
    }

    return menu.sort((a, b) => a.orden - b.orden);
  }

  private tieneAccesoMenuBase(path: string): boolean {
    const menu = this.getMenuBasePorRol();

    return menu.some(item => {
      if (item.path === path) {
        return true;
      }

      return item.items.some(subItem => subItem.path === path);
    });
  }

  // ============================================
  // 🔥 CONSTRUIR ÁRBOL DESDE RECURSOS BACKEND
  // ============================================

  private construirArbol(recursos: RecursoAuth[]): MenuItem[] {
    const mapa = new Map<number | string, MenuItem>();
    const raiz: MenuItem[] = [];

    recursos.forEach((recurso: RecursoAuth) => {
      const id = this.getId(recurso);

      mapa.set(id, {
        id: typeof id === 'number' ? id : 0,
        nombre: recurso.nombre || 'Sin nombre',
        path: this.normalizarRutaFrontend(
          recurso.url_frontend || recurso.path || recurso.ruta || '#'
        ),
        icono: recurso.icono || 'fa-solid fa-circle',
        orden: this.getOrden(recurso),
        padre: this.getPadre(recurso),
        estado: String(recurso.estado || 'activo'),
        items: []
      });
    });

    mapa.forEach(item => {
      if (item.padre !== null && item.padre !== undefined) {
        const padre = mapa.get(item.padre);

        if (padre) {
          padre.items.push(item);
        }
      } else {
        raiz.push(item);
      }
    });

    raiz.sort((a, b) => a.orden - b.orden);

    raiz.forEach(item => {
      item.items.sort((a, b) => a.orden - b.orden);
    });

    return raiz;
  }

  // ============================================
  // 🔥 HELPERS
  // ============================================

  private getId(recurso: RecursoAuth): number | string {
    return recurso.id || recurso.idRecursos || recurso.nombre || 0;
  }

  private getOrden(recurso: RecursoAuth): number {
    const orden = recurso.orden;
    return typeof orden === 'number' ? orden : 0;
  }

  private getPadre(recurso: RecursoAuth): number | null {
    const padre = recurso.padre || recurso.recurso_padre;

    if (typeof padre === 'number' && padre > 0) {
      return padre;
    }

    return null;
  }

  private estaActivo(recurso: RecursoAuth): boolean {
    const estado = recurso.estado;

    if (typeof estado === 'string') {
      return estado.toLowerCase() === 'activo' || estado === '1';
    }

    if (typeof estado === 'boolean') {
      return estado === true;
    }

    return true;
  }

  private normalizarRutaFrontend(ruta: string): string {
    if (!ruta || ruta === '#') {
      return '#';
    }

    let rutaNormalizada = ruta.trim();

    if (!rutaNormalizada.startsWith('/')) {
      rutaNormalizada = `/${rutaNormalizada}`;
    }

    if (rutaNormalizada.length > 1 && rutaNormalizada.endsWith('/')) {
      rutaNormalizada = rutaNormalizada.slice(0, -1);
    }

    return rutaNormalizada;
  }
}