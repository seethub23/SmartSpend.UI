import { Routes } from '@angular/router';

export const reportRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./reports/reports')
      .then(m => m.ReportsComponent)
  }
];