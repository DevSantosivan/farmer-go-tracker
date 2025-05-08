import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { User } from '../../model/auth.model';
import { Observable } from 'rxjs';
import { NavbarComponent } from '../navbar/navbar.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [RouterModule, NavbarComponent,CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  currentUser: User | null = null;
  isSidebarOpen: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Get current user data on component init
    this.authService.getCurrentUser().subscribe((user) => {
      this.currentUser = user;
    });
  }

  // Function to toggle the sidebar state
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  // Optional: Close the sidebar if needed, for example, on clicking outside the sidebar.
  closeSidebar() {
    this.isSidebarOpen = false;
  }
}
