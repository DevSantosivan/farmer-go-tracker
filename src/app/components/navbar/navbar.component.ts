import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { User } from '../../model/auth.model';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  currentUser$: Observable<User | null>;
  isProfileMenuOpen = false;

  constructor(private authService: AuthService, private router: Router) {
    // Initialize currentUser$ in the constructor to fetch the current user
    this.currentUser$ = this.authService.getCurrentUser();
  }

  ngOnInit(): void {

  }


  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  // Navigate to settings page and pass the current user's UID
  goToSettings() {
    this.authService.getCurrentUser().subscribe(user => {
      if (user?.uid) {
        // Navigate to the settings page with the user's UID
        this.router.navigate(['/settings', user.uid]);
      }
    });
  }

  // Log out the current user (fixing Observable issue)
  logout() {
    console.log("Logging out...");  // Check if the logout is triggered
    this.authService.logout().subscribe({
      next: () => {
        console.log("Logged out successfully!");
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Error logging out:', error);
      }
    });
  }
}
