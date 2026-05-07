// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

import { LoginComponent } from './pages/login/login.component';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { RegisterComponent } from './pages/register/register.component';




export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },

  // 👇 ESTE ES EL ARREGLO CLAVE
  {
    path: 'register',
    component: RegisterComponent
  },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [


     {
  path: 'pronostico',
  loadComponent: () =>
    import('./features/pronostico/pronostico').then(m => m.PronosticoComponent),
  canActivate: [authGuard]
}, 

{
  path: 'actuadores',
  loadComponent: () =>
    import('./features/actuadores/actuadores').then(m => m.ActuadoresComponent),
  canActivate: [authGuard]
},
{
  path: 'usuarios',
  loadComponent: () =>
    import('./features/usuarios/usuarios').then(m => m.UsuariosComponent),
  canActivate: [authGuard]
},


{
  path: 'predicciones',
  loadComponent: () =>
    import('./features/predicciones/predicciones').then(m => m.PrediccionesComponent),
  canActivate: [authGuard]
},


{
  path: 'lecturas',
  loadComponent: () =>
    import('./features/lecturas/lecturas').then(m => m.LecturasComponent),
  canActivate: [authGuard]
},
{
  path: 'sensores',
  loadComponent: () =>
    import('./features/sensores/sensores').then(m => m.SensoresComponent),
  canActivate: [authGuard]
},

{
  path: 'zonas',
  loadComponent: () =>
    import('./features/zonas/zonas').then(m => m.ZonasComponent),
  canActivate: [authGuard]
},

    {
      path: 'alertas',
      loadComponent: () =>
        import('./features/alertas/alertas').then(m => m.AlertasComponent),
      canActivate: [authGuard]
    },

      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [authGuard]
      },
      {
        path: 'roles',
        loadComponent: () =>
          import('./features/roles/roles').then(m => m.RolesComponent),
        canActivate: [authGuard]
      },
      {
        path: 'dispositivos',
        loadComponent: () =>
          import('./features/dispositivos/dispositivos').then(m => m.Dispositivos),
        canActivate: [authGuard]
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  {
    path: '**',
    redirectTo: 'login'
  }
];