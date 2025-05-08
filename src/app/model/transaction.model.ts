import { Timestamp } from 'firebase/firestore';

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: Timestamp | Date; // Use Timestamp or Date depending on how it's handled
  note: string;
  type: 'expense' | 'income';
  uid: string;
}