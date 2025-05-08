import { Routes } from '@angular/router';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AddExpenseComponent } from './components/add-expense/add-expense.component';
import { HomeComponent } from './components/home/home.component';
import { MonthlyreportComponent } from './components/monthlyreport/monthlyreport.component';

export const routes: Routes = [
  {
    path: '',
    component: LoginComponent  // Direct the user to the login page initially
  },
  {
    path: 'login',
    component: LoginComponent  // Login route
  },
  {
    path: 'home',  // Home should be a top-level route
    component: HomeComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },  // Default to Dashboard if no child is selected
      { path: 'dashboard', component: DashboardComponent },
      { path: 'add-expense', component: AddExpenseComponent },
      { path: 'report', component: MonthlyreportComponent },
    ]
  },
  {
    path: 'register',
    component: RegisterComponent  // Registration route
  },
 
];
