import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { TransactionService } from '../../core/services/transaction.service';
import { CategoryService } from '../../core/services/category.service';
import { Transaction } from '../../core/models/transaction.model';
import { Category, AddCategory } from '../../core/models/category.model';

@Component({
  selector: 'app-savings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './savings.html',
  styleUrl: './savings.scss'
})
export class SavingsComponent implements OnInit {

  savingsTransactions = signal<Transaction[]>([]);
  savingsCategories = signal<Category[]>([]);
  isLoading = signal(true);
  showAddCategoryModal = signal(false);
  errorMessage = signal('');
  categoryError = signal('');

  // Filter
  filterCategory = signal('');
  filterMonth = signal(new Date().getMonth() + 1);
  filterYear = signal(new Date().getFullYear());

  // Computed
  filteredSavings = computed(() => {
    return this.savingsTransactions().filter(t => {
      const date = new Date(t.transactionDate);
      const matchMonth = date.getMonth() + 1 === this.filterMonth();
      const matchYear = date.getFullYear() === this.filterYear();
      const matchCategory = this.filterCategory() ?
        t.categoryName === this.filterCategory() : true;
      return matchMonth && matchYear && matchCategory;
    });
  });

  totalSavings = computed(() =>
    this.filteredSavings().reduce((sum, t) => sum + t.amount, 0));

  savingsByCategory = computed(() => {
    const grouped: { [key: string]: number } = {};
    this.filteredSavings().forEach(t => {
      grouped[t.categoryName] =
        (grouped[t.categoryName] || 0) + t.amount;
    });
    return Object.entries(grouped).map(([name, amount]) => ({
      name,
      amount
    })).sort((a, b) => b.amount - a.amount);
  });

  categoryForm: FormGroup;

  months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private categoryService: CategoryService
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      type: ['Savings']
    });
  }

  ngOnInit() {
    this.loadSavings();
    this.loadCategories();
  }

  loadSavings() {
    this.isLoading.set(true);
    this.transactionService.getAll().subscribe({
      next: (data) => {
        this.savingsTransactions.set(
          data.filter(t => t.type === 'Savings'));
        this.isLoading.set(false);
      }
    });
  }

  loadCategories() {
    this.categoryService.getByType('Savings').subscribe({
      next: (data) => this.savingsCategories.set(data)
    });
  }

  addCategory() {
    if (this.categoryForm.invalid) return;

    this.categoryService.add(this.categoryForm.value).subscribe({
      next: () => {
        this.showAddCategoryModal.set(false);
        this.categoryForm.reset({ type: 'Savings' });
        this.loadCategories();
      },
      error: (err) => {
        this.categoryError.set(
          err.error?.message || 'Failed to add category!');
      }
    });
  }

  deleteCategory(id: number) {
    if (confirm('Delete this savings category?')) {
      this.categoryService.delete(id).subscribe({
        next: () => this.loadCategories(),
        error: (err) => alert(err.error?.message ||
          'Cannot delete this category!')
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

  getPercentage(amount: number): number {
    return this.totalSavings() > 0 ?
      Math.round((amount / this.totalSavings()) * 100) : 0;
  }

  protected readonly Math = Math;
}