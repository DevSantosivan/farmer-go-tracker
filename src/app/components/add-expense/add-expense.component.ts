import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TransactionService } from '../../service/transaction.service';
import { Router } from '@angular/router';
import { Transaction } from '../../model/transaction.model';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/auth.service';
import { Subscription } from 'rxjs';

interface UITransaction extends Transaction {
  showActions?: boolean;
}

@Component({
  selector: 'app-add-expense',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './add-expense.component.html',
  styleUrls: ['./add-expense.component.scss']
})
export class AddExpenseComponent implements OnInit, OnDestroy {
  form: FormGroup;
  showModal = false;
  submitting = false;
  transactions: UITransaction[] = [];
  selectedTransaction: UITransaction | null = null;
  searchText: string = '';
  categories = ['Feed', 'Gasoline', 'Water', 'Labor', 'Electricity', 'BIR'];

  private userSubscription: Subscription = new Subscription();
  private transactionSubscription: Subscription = new Subscription();

  categoryStyles: { [key: string]: { icon: string, color: string } } = {
    Feed: { icon: 'bx bxs-bowl-hot', color: '#FFB74D' },
    Gasoline: { icon: 'bx bxs-gas-pump', color: '#EF5350' },
    Water: { icon: 'bx bxs-droplet', color: '#42A5F5' },
    Labor: { icon: 'bx bxs-user', color: '#66BB6A' },
    Electricity: { icon: 'bx bxs-bolt', color: '#FFD54F' },
    BIR: { icon: 'bx bxs-bank', color: '#AB47BC' }
  };

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      category: ['', Validators.required],
      date: [new Date().toISOString().substring(0, 10), Validators.required],
      note: ['']
    });
  }

  ngOnInit(): void {
    this.userSubscription = this.authService.getCurrentUser().subscribe(
      user => {
        if (user?.uid) {
          this.fetchTransactions(user.uid);
        } else {
          alert('User not authenticated. Please log in.');
          this.router.navigate(['/login']);
        }
      },
      err => {
        console.error('Error fetching user:', err);
        alert('Failed to authenticate.');
        this.router.navigate(['/login']);
      }
    );
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
    this.transactionSubscription.unsubscribe();
  }

  fetchTransactions(uid: string): void {
    this.transactionSubscription = this.transactionService.getTransactions(uid).subscribe(
      transactions => {
        this.transactions = transactions.map(tx => ({ ...tx, showActions: false }));
      },
      err => {
        console.error('Error fetching transactions:', err);
        alert('Failed to load transactions.');
      }
    );
  }

  toggleActions(tx: UITransaction): void {
    tx.showActions = !tx.showActions;
  }

  editTransaction(tx: UITransaction): void {
    this.selectedTransaction = tx;
    this.form.setValue({
      amount: tx.amount,
      category: tx.category,
      date: this.convertDate(tx.date),
      note: tx.note || ''
    });
    this.showModal = true;
  }

  async submitTransactions(): Promise<void> {
    if (this.form.invalid) return;
    this.submitting = true;

    try {
      const user = await this.authService.getCurrentUser().toPromise();
      if (!user?.uid) throw new Error('User not authenticated');

      const formData = {
        ...this.form.value,
        type: 'expense',
        uid: user.uid
      };

      if (this.selectedTransaction) {
        // Update existing transaction
        await this.transactionService.updateTransaction(this.selectedTransaction.id, formData);
        alert('Transaction updated successfully!');
        this.selectedTransaction = null;
      } else {
        // Add new transaction
        await this.transactionService.addTransaction(formData);
        alert('Transaction added successfully!');
      }

      this.fetchTransactions(user.uid);
      this.form.reset({ date: new Date().toISOString().substring(0, 10) });
      this.showModal = false;
    } catch (error) {
      console.error('Error submitting transaction:', error);
      alert('Error submitting transaction.');
    } finally {
      this.submitting = false;
    }
  }

  deleteTransaction(tx: UITransaction): void {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.transactionService.deleteTransaction(tx.id)
        .then(() => {
          alert('Transaction deleted.');
          this.fetchTransactions(tx.uid);
        })
        .catch(err => {
          console.error('Failed to delete:', err);
          alert('Error deleting transaction.');
        });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedTransaction = null;
    this.form.reset({ date: new Date().toISOString().substring(0, 10) });
  }

  filteredTransactions(): UITransaction[] {
    const search = this.searchText.toLowerCase();
    return this.transactions.filter(tx =>
      tx.amount.toString().includes(search) ||
      tx.category.toLowerCase().includes(search) ||
      tx.note?.toLowerCase().includes(search) ||
      this.convertDate(tx.date).toLowerCase().includes(search)
    );
  }

  private convertDate(input: any): string {
    if (input instanceof Date) {
      return input.toISOString().substring(0, 10);
    } else if (input && typeof input.toDate === 'function') {
      return input.toDate().toISOString().substring(0, 10);
    } else if (typeof input === 'string') {
      return input;
    }
    return new Date().toISOString().substring(0, 10);
  }
}
