import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { TransactionService } from '../../service/transaction.service';
import { Chart, registerables } from 'chart.js';  // Import Chart.js and the registerables
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

Chart.register(...registerables);  // Register all components of Chart.js

@Component({
  selector: 'app-dashboard',
  imports: [ReactiveFormsModule,CommonModule,FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    chart: any;  // Declare the chart variable
    showModal = false;
    productName = '';
    amount = 0;
    totalSales: number = 0;
    totalExpenses: number = 0;
    openModal() {
      this.showModal = true;
      document.body.style.overflow = 'hidden';
    }
  
    closeModal(event: Event) {
      this.showModal = false;
      document.body.style.overflow = '';
    }
  
    submitForm() {
      this.authService.getCurrentUser().subscribe(user => {
        if (user?.uid) {
          this.transactionService.addSales(user.uid, this.amount).then(() => {
            this.amount = 0;
            this.showModal = false;
            this.loadTotalSales(user.uid);  // Refresh displayed total
          }).catch(error => {
            console.error('Error saving sales:', error);
          });
        }
      });
    }
    loadTotalSales(uid: string): void {
      this.transactionService.getTotalSales(uid).then(total => {
        this.totalSales = total;
      });
    }

    loadTotalExpenses(uid: string): void {
      this.transactionService.getTotalExpenses(uid).then(total => {
        this.totalExpenses = total;
      });
    }

    formatNumber(amount: number): string {
      return new Intl.NumberFormat().format(amount);  // Format the number with commas
    }
    constructor(
      private transactionService: TransactionService,
      private authService: AuthService,
      private router: Router
    ) {}
  
    ngOnInit(): void {
      this.authService.getCurrentUser().subscribe(user => {
        if (user?.uid) {
          this.fetchExpensesByCategory(user.uid);  // Fetch expenses for the authenticated user
          this.loadTotalSales(user.uid);
          this.loadTotalExpenses(user.uid);
        } else {
          alert('User not authenticated. Please log in.');
          this.router.navigate(['/login']);
        }
      });
    }
  
    fetchExpensesByCategory(uid: string): void {
      this.transactionService.getExpensesByCategory(uid).subscribe(data => {
        console.log('Fetched Expenses:', data);  // Add this to check the data structure
        if (data && data.length > 0) {
          // Prepare data for the chart
          const categories = data.map(item => item.category);
          const amounts = data.map(item => item.amount);
    
          // Now create the chart with the data
          this.createBarChart(categories, amounts);
        } else {
          console.warn('No data available for expenses by category.');
        }
      });
    }
  
    // Create a bar chart using Chart.js
    createBarChart(categories: string[], amounts: number[]): void {
      const ctx = document.getElementById('expenseChart') as HTMLCanvasElement;
  
      if (this.chart) {
        this.chart.destroy();  // Destroy the previous chart if it exists
      }
  
      this.chart = new Chart(ctx, {
        type: 'bar',  // Bar chart
        data: {
          labels: categories,  // Categories on the x-axis
          datasets: [{
            label: 'Expenses by Category',  // Label for the dataset
            data: amounts,  // The amounts for each category
            backgroundColor: 'green',  // Bar color
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              beginAtZero: true
            },
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
}
  