import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./paginas/inicio/inicio').then((m) => m.Inicio),
  },
  {
    path: 'inicio',
    loadComponent: () => import('./paginas/inicio/inicio').then((m) => m.Inicio),
  },
  {
    path: 'cliente',
    loadComponent: () => import('./layout/cliente/cliente').then((m) => m.ClienteFormComponent),
  },
  {
    path: 'propriedade',
    loadComponent: () => import('./layout/propriedade/propriedade').then((m) => m.PropriedadeCrudComponent),
  },
  {
    path: 'pedido',
    loadComponent: () => import('./layout/pedido/pedido').then((m) => m.PedidoComponent),
  },
  {
    path: 'servicos',
    loadComponent: () => import('./paginas/servicos/servicos').then((m) => m.Servicos),
  },
  {
    path: 'propriedades',
    loadComponent: () => import('./paginas/front-office/front-office').then((m) => m.FrontOfficeComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./layout/dashboard/dashboard').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'login',
    loadComponent: () => import('./paginas/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'operativo',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'intermediario',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];