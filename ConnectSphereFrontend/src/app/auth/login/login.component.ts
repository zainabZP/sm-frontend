import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.errorMessage = '';
    
    if(!this.email || !this.password) {
      this.errorMessage = "Please enter both fields.";
      return;
    }

    this.loading = true;
    
    this.authService.login({
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response) => {
        if(response.token) {
          window.location.href = '/feed'; // hard reload to trigger navbar state check
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || err.error || "Invalid credentials. Please try again.";
      }
    });
  }
}
