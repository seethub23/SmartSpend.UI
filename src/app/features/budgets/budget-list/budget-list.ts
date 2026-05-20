import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BudgetService } from '../../../core/services/budget.service';
import { CategoryService } from '../../../core/services/category.service';
import { Budget } from '../../../core/models/budget.model';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-budget-list',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './budget-list.html',
  styleUrl: './budget-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BudgetListComponent implements OnInit {
  private readonly budgetService = inject(BudgetService);
  private readonly categoryService = inject(CategoryService);
  private readonly fb = inject(FormBuilder);

  budgets = signal<Budget[]>([]);
  categories = signal<Category[]>([]);
  isLoading = signal(true);
  showModal = signal(false);
  errorMessage = signal('');
  protected readonly Math = Math;

  currentMonth = new Date().getMonth() + 1;
  currentYear = new Date().getFullYear();

  // Computed values
  totalBudget = computed(() =>
    this.budgets().reduce((sum, b) => sum + b.limitAmount, 0));
  totalSpent = computed(() =>
    this.budgets().reduce((sum, b) => sum + b.spentAmount, 0));
  totalRemaining = computed(() =>
    this.totalBudget() - this.totalSpent());

  budgetForm: FormGroup = this.fb.group({
    categoryId: ['', Validators.required],
    limitAmount: ['', [Validators.required, Validators.min(1)]],
    month: [this.currentMonth, Validators.required],
    year: [this.currentYear, Validators.required]
  });

  expenseCategories = computed(() =>
    this.categories().filter(c => c.type === 'Expense'));

  ngOnInit() {
    this.loadBudgets();
    this.loadCategories();
  }

  loadBudgets() {
    this.isLoading.set(true);
    this.budgetService.getAll(this.currentMonth, this.currentYear).subscribe({
      next: (data) => {
        this.budgets.set(data);
        this.isLoading.set(false);
      }
    });
  }

  loadCategories() {
    this.categoryService.getAll().subscribe({
      next: (data) => this.categories.set(data)
    });
  }

  openModal() {
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.budgetForm.reset({
      month: this.currentMonth,
      year: this.currentYear
    });
  }

  onSubmit() {
    if (this.budgetForm.invalid) return;

    this.budgetService.add(this.budgetForm.value).subscribe({
      next: () => {
        this.closeModal();
        this.loadBudgets();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to add budget!');
      }
    });
  }

  deleteBudget(id: number) {
    if (confirm('Delete this budget?')) {
      this.budgetService.delete(id).subscribe({
        next: () => this.loadBudgets()
      });
    }
  }

  getProgressColor(percentage: number): string {
    if (percentage >= 100) return '#e53935';
    if (percentage >= 80) return '#ff9800';
    return '#43a047';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }

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
}
