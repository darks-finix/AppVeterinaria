import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login', // Cambiado de 'home' a 'login' para que sea lo primero que se vea
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'registro',
    loadComponent: () => import('./registro/registro.page').then( m => m.RegistroPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'mascotas',
    loadComponent: () => import('./mascotas/mascotas.page').then( m => m.MascotasPage)
  },
  {
    path: 'vacunas',
    loadComponent: () => import('./vacunas/vacunas.page').then( m => m.VacunasPage)
  },
  {
    path: 'perfil',
    loadComponent: () => import('./perfil/perfil.page').then( m => m.PerfilPage)
  },
  {
    path: 'alimentacion',
    loadComponent: () => import('./alimentacion/alimentacion.page').then( m => m.AlimentacionPage)
  },
  {
    path: 'controldiario',
    loadComponent: () => import('./controldiario/controldiario.page').then( m => m.ControlDiarioPage)
  },
  {
    path: 'historial',
    loadComponent: () => import('./historial/historial.page').then( m => m.HistorialPage)
  },
  {
    path: 'recordatorios',
    loadComponent: () => import('./recordatorios/recordatorios.page').then( m => m.RecordatoriosPage)
  },
 
];