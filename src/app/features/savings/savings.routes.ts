import { Routes } from '@angular/router';

export const savingsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./savings')
      .then(m => m.SavingsComponent)
  }
];