import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'] // Corrected typo here
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  loginSuccess: boolean = false;  // Flag to show/hide success modal
  missingFields: boolean = false; // Flag to show/hide missing fields modal
  invalidCredentials: boolean = false; // Flag to show/hide invalid credentials modal

  constructor(private authService: AuthService, private router: Router) {}

  // Navigate to register page
  navigateToregister() {
    this.router.navigate(['/register']);
  }

  login() {
    if (this.email && this.password) {
      this.authService
        .login(this.email, this.password)
        .subscribe(
          (user) => {
            // Success: Navigate to dashboard
            if (user) {
              this.loginSuccess = true;
              setTimeout(() => {
                this.loginSuccess = false;
                this.router.navigate(['/home']); // Replace with your dashboard route
              }, 5000); // Hide the modal after 5 seconds
            }
          },
          (error) => {
            // Safe check for error.message and handle other errors gracefully
            if (error?.error?.message) {
              if (error.error.message === 'Invalid credentials') {
                this.invalidCredentials = true;
                setTimeout(() => {
                  this.invalidCredentials = false;
                }, 5000); // Hide the modal after 5 seconds
              }
            } else {
              console.error('Login failed:', error);
              this.invalidCredentials = true;
              setTimeout(() => {
                this.invalidCredentials = false;
              }, 5000); // Hide the modal after 5 seconds
            }
          }
        );
    } else {
      // If email or password is missing, show the missing fields modal
      this.missingFields = true;
      setTimeout(() => {
        this.missingFields = false;
      }, 5000); // Hide the modal after 5 seconds
    }
  }
  
}
