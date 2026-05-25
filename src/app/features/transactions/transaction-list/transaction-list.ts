import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../../core/services/transaction.service';
import { CategoryService } from '../../../core/services/category.service';
import { Transaction } from '../../../core/models/transaction.model';
import { Category } from '../../../core/models/category.model';
import { AddTransactionModalComponent } from '../add-transaction-modal/add-transaction-modal';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddTransactionModalComponent
  ],
  templateUrl: './transaction-list.html',
  styleUrls: ['./transaction-list.scss']
})
export class TransactionListComponent implements OnInit {

  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  categories: Category[] = [];

  // Filters
  filterType = '';
  filterCategory = '';
  filterMonth = new Date().getMonth() + 1;
  filterYear = new Date().getFullYear();

  // Modal
  showModal = false;
  selectedTransaction: Transaction | null = null;

  isLoading = true;

  constructor(
    private transactionService: TransactionService,
    private categoryService: CategoryService
  ) { }

  ngOnInit() {
    this.loadTransactions();
    this.loadCategories();
  }

  loadTransactions() {
    this.isLoading = true;
    this.transactionService.getAll().subscribe({
      next: (data) => {
        this.transactions = data;
        this.applyFilters();
        this.isLoading = false;
      }
    });
  }

  loadCategories() {
    this.categoryService.getAll().subscribe({
      next: (data) => {
        this.categories = data;
      }
    });
  }

  applyFilters() {
    this.filteredTransactions = this.transactions.filter(t => {
      const date = new Date(t.transactionDate);
      const matchMonth = date.getMonth() + 1 === this.filterMonth;
      const matchYear = date.getFullYear() === this.filterYear;
      const matchType = this.filterType ? t.type === this.filterType : true;
      const matchCategory = this.filterCategory ?
        t.categoryName === this.filterCategory : true;
      return matchMonth && matchYear && matchType && matchCategory;
    });
  }

  openAddModal() {
    this.selectedTransaction = null;
    this.showModal = true;
  }

  openEditModal(transaction: Transaction) {
    this.selectedTransaction = transaction;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedTransaction = null;
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

  get totalIncome(): number {
    return this.filteredTransactions
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  get totalExpense(): number {
    return this.filteredTransactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }
}