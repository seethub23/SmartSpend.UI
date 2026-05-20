import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../../core/services/transaction.service';
import { CategoryService } from '../../../core/services/category.service';
import { Transaction } from '../../../core/models/transaction.model';
import { Category } from '../../../core/models/category.model';
import { AddTransactionModalComponent } from '../add-transaction-modal/add-transaction-modal';

@Component({
  selector: 'app-transaction-list',
  imports: [
    DatePipe,
    FormsModule,
    AddTransactionModalComponent
  ],
  templateUrl: './transaction-list.html',
  styleUrl: './transaction-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionListComponent implements OnInit {
  private readonly transactionService = inject(TransactionService);
  private readonly categoryService = inject(CategoryService);

  transactions = signal<Transaction[]>([]);
  categories = signal<Category[]>([]);

  // Filters
  filterType = signal('');
  filterCategory = signal('');
  filterMonth = signal(new Date().getMonth() + 1);
  filterYear = signal(new Date().getFullYear());

  // Modal
  showModal = signal(false);
  selectedTransaction = signal<Transaction | null>(null);

  isLoading = signal(true);

  filteredTransactions = computed(() => {
    const filterType = this.filterType();
    const filterCategory = this.filterCategory();
    const filterMonth = this.filterMonth();
    const filterYear = this.filterYear();

    return this.transactions().filter(transaction => {
      const date = new Date(transaction.transactionDate);
      const matchMonth = date.getMonth() + 1 === filterMonth;
      const matchYear = date.getFullYear() === filterYear;
      const matchType = filterType ? transaction.type === filterType : true;
      const matchCategory = filterCategory
        ? transaction.categoryName === filterCategory
        : true;

      return matchMonth && matchYear && matchType && matchCategory;
    });
  });

  totalIncome = computed(() =>
    this.filteredTransactions()
      .filter(transaction => transaction.type === 'Income')
      .reduce((sum, transaction) => sum + transaction.amount, 0)
  );

  totalExpense = computed(() =>
    this.filteredTransactions()
      .filter(transaction => transaction.type === 'Expense')
      .reduce((sum, transaction) => sum + transaction.amount, 0)
  );

  ngOnInit() {
    this.loadTransactions();
    this.loadCategories();
  }

  loadTransactions() {
    this.isLoading.set(true);
    this.transactionService.getAll().subscribe({
      next: (data) => {
        this.transactions.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.transactions.set([]);
        this.isLoading.set(false);
      }
    });
  }

  loadCategories() {
    this.categoryService.getAll().subscribe({
      next: (data) => {
        this.categories.set(data);
      }
    });
  }

  openAddModal() {
    this.selectedTransaction.set(null);
    this.showModal.set(true);
  }

  openEditModal(transaction: Transaction) {
    this.selectedTransaction.set(transaction);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedTransaction.set(null);
  }

  onTransactionSaved() {
    this.closeModal();
    this.loadTransactions();
  }

  deleteTransaction(id: number) {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.transactionService.delete(id).subscribe({
        next: () => this.loadTransactions()
      });
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  setFilterMonth(month: number): void {
    this.filterMonth.set(month);
  }

  setFilterYear(year: number): void {
    this.filterYear.set(year);
  }

  setFilterType(type: string): void {
    this.filterType.set(type);
  }

  setFilterCategory(category: string): void {
    this.filterCategory.set(category);
  }
}
