// src/app/core/models/auth-response.model.ts
// src/app/core/models/auth-response.model.ts

export interface UsuarioAuth {
  id: number;
  nombre: string;
  email: string;
}

export interface RolAuth {
  id: number;
  nombre: string;
}

export interface RecursoAuth {
  id?: number;
  idRecursos?: number;
  nombre?: string;
  path?: string;
  ruta?: string;
  url_frontend?: string;
  icono?: string;
  orden?: number;
  estado?: string | boolean;
  padre?: number | null;
  recurso_padre?: number | null;
  [key: string]: any;  // 🔥 PERMITIR CUALQUIER OTRA PROPIEDAD
}

export interface AuthResponse {
  access: string;
  refresh: string;
  usuario: UsuarioAuth;
  roles: RolAuth[];
  recursos: RecursoAuth[];
}