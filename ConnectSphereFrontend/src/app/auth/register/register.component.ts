import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  username = '';
  fullName = '';
  email = '';
  password = '';
  errorMessage = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.errorMessage = '';
    
    if(!this.username || !this.fullName || !this.email || !this.password) {
      this.errorMessage = "Please fill out all fields.";
      return;
    }

    this.loading = true;
    
    this.authService.register({
      userName: this.username,
      fullName: this.fullName,
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response) => {
        if(response.token) {
          window.location.href = '/feed';
        } else {
            this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        this.loading = false;
        if (typeof err.error === 'string') {
          this.errorMessage = err.error;
        } else {
          this.errorMessage = err.error?.message || "Failed to create account. Please try again.";
        }
      }
    });
  }
}
