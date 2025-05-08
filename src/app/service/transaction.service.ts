import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  deleteDoc,
  setDoc,
  query,
  where,
  Timestamp,
  getDocs,
  QuerySnapshot,
  DocumentData
} from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Transaction } from '../model/transaction.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private transactionsRef;

  constructor(private firestore: Firestore, private authService: AuthService) {
    this.transactionsRef = collection(this.firestore, 'transactions'); // Flat collection
  }


  addSales(uid: string, amount: number): Promise<void> {
    const salesRef = collection(this.firestore, `users/${uid}/sales`);
    const saleData = {
      amount,
      date: new Date()
    };
    return addDoc(salesRef, saleData).then(() => {});
  }
  getMonthlySales(uid: string): Promise<{ [month: string]: number }> {
    const salesRef = collection(this.firestore, `users/${uid}/sales`);
    return getDocs(salesRef).then(snapshot => {
      const monthlySales: { [month: string]: number } = {};
      snapshot.forEach(doc => {
        const data = doc.data();
        const date = this.extractDate(data['date']);
        const month = date?.substring(0, 7);
        if (month && data['amount']) {
          monthlySales[month] = (monthlySales[month] || 0) + data['amount'];
        }
      });
      return monthlySales;
    });
  }

  private extractDate(input: any): string {
    if (input instanceof Date) return input.toISOString().substring(0, 10);
    if (input?.toDate) return input.toDate().toISOString().substring(0, 10);
    return typeof input === 'string' ? input : '';
  }
  getTotalSales(uid: string): Promise<number> {
    const salesRef = collection(this.firestore, `users/${uid}/sales`);
    return getDocs(salesRef).then(snapshot => {
      let total = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data['amount']) total += data['amount'];
      });
      return total;
    });
  }
  getTotalExpenses(uid: string): Promise<number> {
    const expensesRef = collection(this.firestore, 'transactions');
    const q = query(expensesRef, where('uid', '==', uid), where('type', '==', 'expense'));
  
    return getDocs(q).then(snapshot => {
      let total = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data['amount']) total += data['amount'];
      });
      return total;
    });
  }
  getExpensesByCategory(uid: string): Observable<{ category: string, amount: number }[]> {
    const categories = ['Feed', 'Gasoline', 'Water', 'Labor', 'Electricity', 'BIR'];

    // Firestore reference for the transactions collection
    const transactionsRef = collection(this.firestore, 'transactions');
    
    // Query to get only the transactions for the user with type 'expense' and categories matching the predefined ones
    const q = query(
      transactionsRef, 
      where('uid', '==', uid),  // Ensure you're fetching only for the current user
      where('type', '==', 'expense'),  // Only fetch 'expense' type transactions
      where('category', 'in', categories)  // Filter for predefined categories
    );

    // Convert Firestore query result to Observable and process the data
    return from(getDocs(q)).pipe(
      map(querySnapshot => {
        const categoryMap: Record<string, number> = {};

        // Loop through each document and aggregate the amount by category
        querySnapshot.forEach(doc => {
          const data = doc.data() as DocumentData;
          const category = data['category'];
          const amount = data['amount'];

          // Add amounts to the corresponding category
          if (categories.includes(category) && amount !== undefined) {
            categoryMap[category] = (categoryMap[category] || 0) + amount;
          }
        });

        // Return the aggregated data as an array of category-amount pairs
        return categories.map(category => ({
          category,
          amount: categoryMap[category] || 0  // Return 0 if there are no expenses for that category
        }));
      })
    );
  }

  // Get Transactions for a specific user (filtering by expense type)
  getTransactions(uid: string): Observable<Transaction[]> {
    const q = query(this.transactionsRef, where('uid', '==', uid), where('type', '==', 'expense'));
    return collectionData(q, { idField: 'id' }) as Observable<Transaction[]>;
  }

  // Add a new transaction
  async addTransaction(data: Omit<Transaction, 'id'>): Promise<any> {
    const user = await this.authService.getCurrentUser().toPromise();
    if (!user) throw new Error('User not authenticated');

    return addDoc(this.transactionsRef, {
      ...data,
      uid: user.uid,
      date: data.date instanceof Date ? Timestamp.fromDate(data.date) : data.date
    });
  }

  // Update an existing transaction
  updateTransaction(id: string, data: Omit<Transaction, 'id'>): Promise<any> {
    const txDocRef = doc(this.firestore, `transactions/${id}`);
    return setDoc(txDocRef, {
      ...data,
      date: data.date instanceof Date ? Timestamp.fromDate(data.date) : data.date
    });
  }

  // Delete a transaction by ID
  deleteTransaction(id: string): Promise<any> {
    const txDocRef = doc(this.firestore, `transactions/${id}`);
    return deleteDoc(txDocRef);
  }
}
