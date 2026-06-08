// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

import { LoginComponent } from './pages/login/login.component';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { RegisterComponent } from './pages/register/register.component';
import { PronosticoComponent } from './features/pronostico/pronostico';
import { ActuadoresComponent } from './features/actuadores/actuadores';
import { UsuariosComponent } from './features/usuarios/usuarios';
import { PrediccionesComponent } from './features/predicciones/predicciones';
import { LecturasComponent } from './features/lecturas/lecturas';
import { SensoresComponent } from './features/sensores/sensores';
import { ZonasComponent } from './features/zonas/zonas';
import { AlertasComponent } from './features/alertas/alertas';
import { RolesComponent } from './features/roles/roles';
import { Dispositivos } from './features/dispositivos/dispositivos';


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
  component: PronosticoComponent,
  canActivate: [authGuard]
}, 

{
  path: 'actuadores',
  component: ActuadoresComponent,
  canActivate: [authGuard]
},
{
  path: 'usuarios',
  component: UsuariosComponent,
  canActivate: [authGuard]
},


{
  path: 'predicciones',
  component: PrediccionesComponent,
  canActivate: [authGuard]
},


{
  path: 'lecturas',
  component: LecturasComponent,
  canActivate: [authGuard]
},
{
  path: 'sensores',
  component: SensoresComponent,
  canActivate: [authGuard]
},

{
  path: 'zonas',
  component: ZonasComponent,
  canActivate: [authGuard]
},

    {
      path: 'alertas',
      component: AlertasComponent,
      canActivate: [authGuard]
    },

      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [authGuard]
      },
      {
        path: 'roles',
        component: RolesComponent,
        canActivate: [authGuard]
      },
      {
        path: 'dispositivos',
        component: Dispositivos,
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
