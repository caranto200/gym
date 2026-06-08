import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/registro-peso/registro-peso.component').then(m => m.RegistroPesoComponent)
  },
  {
    path: 'resumen',
    loadComponent: () => import('./pages/resumen-mensual/resumen-mensual.component').then(m => m.ResumenMensualComponent)
  },
  {
    path: 'ejercicios',
    loadComponent: () => import('./pages/ejercicios/ejercicios.component').then(m => m.EjerciciosComponent)
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil.component').then(m => m.PerfilComponent)
  },
  { path: '**', redirectTo: 'login' }
];