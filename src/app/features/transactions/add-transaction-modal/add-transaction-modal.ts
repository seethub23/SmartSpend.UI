import { ChangeDetectionStrategy, Component, OnInit, inject, input, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TransactionService } from '../../../core/services/transaction.service';
import { Transaction } from '../../../core/models/transaction.model';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-add-transaction-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './add-transaction-modal.html',
  styleUrl: './add-transaction-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddTransactionModalComponent implements OnInit {
  readonly transaction = input<Transaction | null>(null);
  readonly categories = input<Category[]>([]);
  readonly save = output<void>();
  readonly closeModal = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly transactionService = inject(TransactionService);
  transactionForm: FormGroup = this.fb.group({
    categoryId: ['', Validators.required],
    amount: ['', [Validators.required, Validators.min(1)]],
    type: ['Expense', Validators.required],
    paymentMethod: ['UPI', Validators.required],
    transactionDate: [new Date().toISOString().split('T')[0], Validators.required],
    notes: [''],
    isRecurring: [false]
  });
  isLoading = signal(false);
  errorMessage = signal('');

  filteredCategories = signal<Category[]>([]);

  paymentMethods = ['Cash', 'Card', 'UPI', 'NetBanking', 'Other'];

  ngOnInit() {
    // Filter categories based on type
    this.transactionForm.get('type')?.valueChanges.subscribe(type => {
      this.filteredCategories.set(this.categories().filter(c => c.type === type));
      this.transactionForm.patchValue({ categoryId: '' });
    });

    // Initialize filtered categories
    this.filteredCategories.set(this.categories().filter(c => c.type === 'Expense'));

    // If editing -- populate form
    const transaction = this.transaction();

    if (transaction) {
      const category = this.categories().find(
        c => c.name === transaction.categoryName);

      this.transactionForm.patchValue({
        categoryId: category?.categoryId,
        amount: transaction.amount,
        type: transaction.type,
        paymentMethod: transaction.paymentMethod,
        transactionDate: new Date(transaction.transactionDate)
          .toISOString().split('T')[0],
        notes: transaction.notes,
        isRecurring: transaction.isRecurring
      });

      this.filteredCategories.set(this.categories()
        .filter(c => c.type === transaction.type));
    }
  }

  get isEditing(): boolean {
    return !!this.transaction();
  }

  onSubmit() {
    if (this.transactionForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    const formValue = this.transactionForm.value;
    const transaction = this.transaction();

    if (transaction) {
      this.transactionService.update(
        transaction.transactionId, formValue).subscribe({
        next: () => this.save.emit(),
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Update failed!');
          this.isLoading.set(false);
        }
      });
    } else {
      this.transactionService.add(formValue).subscribe({
        next: () => this.save.emit(),
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Add failed!');
          this.isLoading.set(false);
        }
      });
    }
  }

  close() {
    this.closeModal.emit();
  }
}
