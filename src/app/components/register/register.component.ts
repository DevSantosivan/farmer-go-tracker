import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [CommonModule, FormsModule,ReactiveFormsModule],  // ✅ Add FormsModule & CommonModule here
})
export class RegisterComponent {
  fullname: string = '';
  email: string = '';
  password: string = '';
  contact: string = '';
  birthday: string = '';
  registrationSuccess: boolean = false;  // Flag to show/hide success modal
  missingFields: boolean = false; // Flag to show/hide missing fields modal
  existingCredentials: boolean = false; // Flag to show/hide existing credentials modal

  constructor(private authService: AuthService, private route: Router) {}

  // Navigate to login page
  navigateToLogin() {
    this.route.navigate(['/login']);
  }

  register() {
    // Validate all required fields
    if (this.fullname && this.email && this.password && this.contact && this.birthday) {
      this.authService
        .register(this.fullname,this.email, this.password, this.contact, this.birthday)
        .subscribe(
          (response) => {
            // If registration is successful, show success modal
            this.registrationSuccess = true;
            setTimeout(() => {
              this.registrationSuccess = false;
              this.navigateToLogin(); // Navigate to login after modal disappears
            }, 5000); // Hide the modal after 5 seconds
          },
          (error) => {
            // Log the error to see the structure
            console.error('Registration failed:', error);
    
            // Check if error contains an 'error' object and if it has a 'message'
            if (error?.error?.message) {
              if (error.error.message === 'Existing credentials') {
                // Show existing credentials error if email or contact is already in use
                this.existingCredentials = true;
                setTimeout(() => {
                  this.existingCredentials = false;
                }, 5000); // Hide the modal after 5 seconds
              } else {
                // Handle other error messages here
                this.handleUnknownError(error);
                this.existingCredentials = true;
              }
            } else {
              // If there's no message, handle it as an unknown error
              this.handleUnknownError(error);
              this.existingCredentials = true;
            }
          }
        );
    } else {
      // If any field is missing, show missing fields modal
      this.missingFields = true;
      setTimeout(() => {
        this.missingFields = false;
      }, 5000); // Hide the modal after 5 seconds
    }
  }
    
  handleUnknownError(error: any) {
    // If we don't know the structure, log it and show a generic error
    console.error('Unknown registration error:', error);
    // Optionally, show a generic error modal or message here
  }
}  