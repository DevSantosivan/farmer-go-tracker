import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { HomeComponent } from './components/home/home.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AddExpenseComponent } from './components/add-expense/add-expense.component';
import { MonthlyreportComponent } from './components/monthlyreport/monthlyreport.component';
import { LoginComponent } from './components/login/login.component';

@NgModule({
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    RouterModule.forChild(routes), // child routes for admin module
    // ✅ Standalone Components go here:
    HomeComponent,
    DashboardComponent,AddExpenseComponent,MonthlyreportComponent,LoginComponent
    
  ]
})
export class AdminModule { }
