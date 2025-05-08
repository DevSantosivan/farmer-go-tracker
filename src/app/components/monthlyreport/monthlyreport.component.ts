import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { TransactionService } from '../../service/transaction.service';
import { Chart } from 'chart.js';
import { CommonModule } from '@angular/common'; // Import CommonModule for pipes like currency

@Component({
  selector: 'app-monthlyreport',
  standalone: true,
  imports: [CommonModule], // Import any custom pipes if needed
  templateUrl: './monthlyreport.component.html',
  styleUrls: ['./monthlyreport.component.scss']
})
export class MonthlyreportComponent implements OnInit {
  monthlyData: { month: string; sales: number; expenses: number; netIncome: number }[] = [];
  @ViewChild('incomeChart', { static: true }) incomeChartRef!: ElementRef<HTMLCanvasElement>;
  chart: Chart | null = null;

  currentMonth: string = new Date().toISOString().substring(0, 7);  // Get current month
  monthlySales: { [month: string]: number } = {};
  monthlyExpenses: { [month: string]: number } = {};
  netIncome: number = 0;

  constructor(
    private authService: AuthService,
    private transactionService: TransactionService
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      if (user?.uid) {
        const uid = user.uid;

        // Get sales by UID
        this.transactionService.getMonthlySales(uid).then(monthlySales => {
          this.monthlySales = monthlySales;

          // Get expenses for the user
          this.transactionService.getTransactions(uid).subscribe(transactions => {
            const monthlyExpenses: { [month: string]: number } = {};

            // Filter and sum up the expenses by month
            transactions
              .filter(tx => tx.type === 'expense')
              .forEach(tx => {
                const date = this.formatDate(tx.date);
                const month = date.substring(0, 7);
                monthlyExpenses[month] = (monthlyExpenses[month] || 0) + tx.amount;
              });

            this.monthlyExpenses = monthlyExpenses;

            // Combine months from both sales and expenses data
            const allMonths = Array.from(new Set([
              ...Object.keys(this.monthlySales),
              ...Object.keys(this.monthlyExpenses)
            ])).sort();

            // Map each month to the net income (sales - expenses)
            this.monthlyData = allMonths.map(month => {
              const sales = this.monthlySales[month] || 0;
              const expenses = this.monthlyExpenses[month] || 0;
              const netIncome = sales - expenses;

              return {
                month,
                sales,
                expenses,
                netIncome
              };
            });

            // Set current month's net income
            const currentMonthData = this.monthlyData.find(data => data.month === this.currentMonth);
            this.netIncome = currentMonthData?.netIncome || 0;

            // Draw bar chart with net income for each month
            const netIncomeArray = this.monthlyData.map(data => data.netIncome);
            this.createBarChart(allMonths, netIncomeArray);
          });
        });
      }
    });
  }

  // Create bar chart
  createBarChart(months: string[], incomes: number[]): void {
    const ctx = this.incomeChartRef.nativeElement;

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [{
          label: 'Net Income (Sales - Expenses)',
          data: incomes,
          backgroundColor: '#66BB6A',
          borderColor: '#388E3C',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: { beginAtZero: true },
          y: { beginAtZero: true }
        }
      }
    });
  }

  // Format date to ISO string (needed for Firestore dates)
  formatDate(input: any): string {
    if (input instanceof Date) return input.toISOString().substring(0, 10);
    if (input?.toDate) return input.toDate().toISOString().substring(0, 10);
    return typeof input === 'string' ? input : '';
  }
}
