import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { RecurringTransaction, RecurringTransactionService } from '../../core/services/recurring-transaction.service';
import { Category } from '../../core/models/category.model';
import { CategoryService } from '../../core/services/category.service';

@Component({
  selector: 'app-recurring-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recurring-list.html',
  styleUrl: './recurring-list.scss'
})
export class RecurringListComponent implements OnInit {

  recurring = signal<RecurringTransaction[]>([]);
  categories = signal<Category[]>([]);
  isLoading = signal(true);
  showModal = signal(false);
  errorMessage = signal('');

  activeRecurring = computed(() =>
    this.recurring().filter(r => r.isActive));
  inactiveRecurring = computed(() =>
    this.recurring().filter(r => !r.isActive));

  recurringForm: FormGroup;

  frequencies = ['Daily', 'Weekly', 'Monthly', 'Yearly'];
  paymentMethods = ['Cash', 'Card', 'UPI', 'NetBanking', 'Other'];

  filteredCategories = signal<Category[]>([]);

  constructor(
    private fb: FormBuilder,
    private recurringService: RecurringTransactionService,
    private categoryService: CategoryService
  ) {
    this.recurringForm = this.fb.group({
      categoryId: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      type: ['Expense', Validators.required],
      paymentMethod: ['UPI', Validators.required],
      frequency: ['Monthly', Validators.required],
      startDate: [
        new Date().toISOString().split('T')[0],
        Validators.required
      ],
      endDate: [''],
      notes: ['']
    });

    // Filter categories on type change
    this.recurringForm.get('type')?.valueChanges.subscribe(type => {
      this.filteredCategories.set(
        this.categories().filter(c => c.type === type));
      this.recurringForm.patchValue({ categoryId: '' });
    });
  }

  ngOnInit() {
    this.loadRecurring();
    this.loadCategories();
  }

  loadRecurring() {
    this.isLoading.set(true);
    this.recurringService.getAll().subscribe({
      next: (data) => {
        this.recurring.set(data);
        this.isLoading.set(false);
      }
    });
  }

  loadCategories() {
    this.categoryService.getAll().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.filteredCategories.set(
          data.filter(c => c.type === 'Expense'));
      }
    });
  }

  openModal() {
    this.showModal.set(true);
    this.errorMessage.set('');
  }

  closeModal() {
    this.showModal.set(false);
    this.recurringForm.reset({
      type: 'Expense',
      paymentMethod: 'UPI',
      frequency: 'Monthly',
      startDate: new Date().toISOString().split('T')[0]
    });
  }

  onSubmit() {
    if (this.recurringForm.invalid) return;

    this.recurringService.add(this.recurringForm.value).subscribe({
      next: () => {
        this.closeModal();
        this.loadRecurring();
      },
      error: (err) => {
        this.errorMessage.set(
          err.error?.message || 'Failed to add!');
      }
    });
  }

  toggleActive(id: number) {
    this.recurringService.toggleActive(id).subscribe({
      next: () => this.loadRecurring()
    });
  }

  delete(id: number) {
    if (confirm('Delete this recurring transaction?')) {
      this.recurringService.delete(id).subscribe({
        next: () => this.loadRecurring()
      });
    }
  }

  getFrequencyIcon(frequency: string): string {
    const icons: { [key: string]: string } = {
      'Daily': '📅',
      'Weekly': '📆',
      'Monthly': '🗓️',
      'Yearly': '📊'
    };
    return icons[frequency] || '🔄';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }
}