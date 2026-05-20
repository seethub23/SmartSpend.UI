import { Routes } from '@angular/router';

export const transactionRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./transaction-list/transaction-list')
      .then(m => m.TransactionListComponent)
  }
];
