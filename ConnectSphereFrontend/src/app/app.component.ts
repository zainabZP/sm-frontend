import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { UserService, UserResponse } from './services/user.service';
import { FollowService } from './services/follow.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule, FormsModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ConnectSphereFrontend';
  recommendations: UserResponse[] = [];
  hashtagQuery: string = '';

  constructor(
    private userService: UserService,
    private followService: FollowService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadRecommendations();
  }

  loadRecommendations() {
    this.userService.getRecommendations().subscribe({
      next: (users) => {
        // Only show users we aren't already following
        users.forEach(user => {
          this.followService.isFollowing(user.userId).subscribe(resp => {
            if (!resp) {
              this.recommendations.push(user);
              // Limit to 5
              if (this.recommendations.length > 5) {
                this.recommendations = this.recommendations.slice(0, 5);
              }
            }
          });
        });
      }
    });
  }

  searchHashtag() {
    if (!this.hashtagQuery.trim()) return;
    let tag = this.hashtagQuery.replace('#', '').trim();
    this.router.navigate(['/search'], { queryParams: { hashtag: tag } });
    this.hashtagQuery = '';
  }

  followUser(userId: number) {
    this.followService.followUser(userId).subscribe({
      next: () => {
        this.recommendations = this.recommendations.filter(u => u.userId !== userId);
      }
    });
  }
}
