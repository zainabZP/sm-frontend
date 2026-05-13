import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, UserResponse, UpdateProfileDto, ChangePasswordDto } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { PostService, PostResponse } from '../services/post.service';
import { LikeService } from '../services/like.service';
import { CommentService, CommentResponse } from '../services/comment.service';
import { FollowService, FollowResponse } from '../services/follow.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  user: UserResponse | null = null;
  posts: any[] = []; 
  isOwnProfile = true;
  
  showEditModal = false;
  showPasswordModal = false;
  showFollowersModal = false;
  showFollowingModal = false;

  followers: FollowResponse[] = [];
  following: FollowResponse[] = [];
  followStatus: 'NONE' | 'ACCEPTED' | 'PENDING' = 'NONE';
  activeTab: 'posts' | 'replies' | 'likes' = 'posts';
  replies: any[] = [];
  likedPosts: PostResponse[] = [];
  
  showPendingModal = false;
  pendingRequests: FollowResponse[] = [];

  editDto: UpdateProfileDto = {};
  passwordDto: ChangePasswordDto = {};
  
  message = '';
  error = '';

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private postService: PostService,
    private likeService: LikeService,
    private commentService: CommentService,
    private followService: FollowService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const userIdParam = params['id'];
      if (userIdParam) {
        const userId = parseInt(userIdParam, 10);
        this.isOwnProfile = userId === this.authService.getUserId();
        this.loadProfile(userId);
      } else {
        const userId = this.authService.getUserId();
        if (userId) {
          this.isOwnProfile = true;
          this.loadProfile(userId);
          this.loadPendingRequests();
        }
      }
    });
  }

  loadProfile(userId: number) {
    this.userService.getUserById(userId).subscribe({
      next: (data: UserResponse) => {
        this.user = data;
        this.editDto = {
          fullName: data.fullName,
          bio: data.bio,
          avatarUrl: data.avatarUrl
        };
        this.loadUserPosts(userId);
        this.refreshCounts(userId);
        if (!this.isOwnProfile) {
          this.checkFollowingStatus(userId);
        }
      },
      error: (err: any) => console.error('Failed to load profile', err)
    });
  }



  openFollowers() {
    if (!this.user) return;
    this.followService.getFollowers(this.user.userId).subscribe({
      next: (data) => {
        this.followers = data;
        this.showFollowersModal = true;
      }
    });
  }

  openFollowing() {
    if (!this.user) return;
    this.followService.getFollowing(this.user.userId).subscribe({
      next: (data) => {
        this.following = data;
        this.showFollowingModal = true;
      }
    });
  }

  loadPendingRequests() {
    this.followService.getPendingRequests().subscribe({
      next: (data) => this.pendingRequests = data
    });
  }

  acceptRequest(req: FollowResponse) {
    if (req.processing) return;
    req.processing = true;
    this.followService.acceptFollowRequest(req.followId).subscribe({
      next: () => {
        req.status = 'ACCEPTED';
        req.processing = false;
        if (this.user) {
          this.refreshCounts(this.user.userId);
        }
        // Remove from list after a short delay to let user see "Accepted"
        setTimeout(() => {
          this.pendingRequests = this.pendingRequests.filter(r => r.followId !== req.followId);
        }, 1500);
      },
      error: () => req.processing = false
    });
  }

  rejectRequest(req: FollowResponse) {
    if (req.processing) return;
    req.processing = true;
    this.followService.rejectFollowRequest(req.followId).subscribe({
      next: () => {
        req.status = 'REJECTED';
        req.processing = false;
        if (this.user) {
          this.refreshCounts(this.user.userId);
        }
        // Remove from list after a short delay
        setTimeout(() => {
          this.pendingRequests = this.pendingRequests.filter(r => r.followId !== req.followId);
        }, 1500);
      },
      error: () => req.processing = false
    });
  }



  toggleLike(post: any) {
    this.likeService.toggleLike(post.postId, 'Post').subscribe({
      next: (res) => {
        post.hasLiked = !post.hasLiked;
        post.likeCount += post.hasLiked ? 1 : -1;
      }
    });
  }

  toggleComments(post: any) {
    post.showComments = !post.showComments;
    if (post.showComments && post.comments.length === 0) {
      this.loadComments(post);
    }
  }

  loadComments(post: any) {
    this.commentService.getCommentsByPost(post.postId).subscribe({
      next: (comments) => post.comments = comments
    });
  }

  addComment(post: any) {
    if (!post.newComment?.trim()) return;

    this.commentService.addComment({
      postId: post.postId,
      content: post.newComment
    }).subscribe({
      next: (comment) => {
        post.comments.unshift(comment);
        post.commentCount++;
        post.newComment = '';
      }
    });
  }

  updateProfile() {
    this.userService.updateProfile(this.editDto).subscribe({
      next: (updatedUser: UserResponse) => {
        this.user = updatedUser;
        this.showEditModal = false;
        this.message = 'Profile updated successfully!';
        setTimeout(() => this.message = '', 3000);
      },
      error: (err: any) => this.error = 'Failed to update profile'
    });
  }

  changePassword() {
    this.error = '';
    this.userService.changePassword(this.passwordDto).subscribe({
      next: () => {
        this.showPasswordModal = false;
        this.passwordDto = {};
        this.message = 'Password changed successfully!';
        setTimeout(() => this.message = '', 3000);
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Failed to change password';
      }
    });
  }

  togglePrivacy() {
    if (!this.user) return;
    this.error = '';
    this.userService.togglePrivacy().subscribe({
      next: () => {
        if (this.user) {
          this.user.isPrivate = !this.user.isPrivate;
          this.message = `Profile is now ${this.user.isPrivate ? 'Private' : 'Public'}`;
          setTimeout(() => this.message = '', 3000);
        }
      },
      error: (err: any) => this.error = 'Failed to update privacy settings'
    });
  }

  checkFollowingStatus(userId: number) {
    this.followService.isFollowing(userId).subscribe({
      next: (res) => {
        if (res) {
          this.followStatus = res.status as any;
        } else {
          this.followStatus = 'NONE';
        }
      }
    });
  }

  follow() {
    if (!this.user) return;
    this.followService.followUser(this.user.userId).subscribe({
      next: (res) => {
        this.followStatus = res.status as any;
        if (this.followStatus === 'ACCEPTED') {
          if (this.user) this.user.followerCount++;
        }
      }
    });
  }

  unfollow() {
    if (!this.user) return;
    this.followService.unfollowUser(this.user.userId).subscribe({
      next: () => {
        const wasAccepted = this.followStatus === 'ACCEPTED';
        this.followStatus = 'NONE';
        if (this.user) {
          this.refreshCounts(this.user.userId);
        }
      }
    });
  }

  openPendingModal() {
    this.showPendingModal = true;
  }

  getActivePendingCount(): number {
    return this.pendingRequests.filter(r => r.status === 'PENDING').length;
  }

  refreshCounts(userId: number) {
    forkJoin({
      followers: this.followService.getFollowerCount(userId),
      following: this.followService.getFollowingCount(userId)
    }).subscribe({
      next: (counts) => {
        if (this.user) {
          this.user.followerCount = counts.followers;
          this.user.followingCount = counts.following;
        }
      }
    });
  }

  switchTab(tab: 'posts' | 'replies' | 'likes') {
    this.activeTab = tab;
    if (tab === 'posts') this.loadUserPosts(this.user!.userId);
    else if (tab === 'replies') this.loadReplies(this.user!.userId);
    else if (tab === 'likes') this.loadLikedPosts(this.user!.userId);
  }

  loadUserPosts(userId: number) {
    this.postService.getPostsByUserId(userId).subscribe({
      next: (data) => {
        this.posts = data.map(p => ({ ...p, showComments: false, comments: [] }));
        this.checkLikes(this.posts);
      }
    });
  }

  loadReplies(userId: number) {
    this.commentService.getPostsCommentedByUser(userId).subscribe({
      next: (commentedPosts) => {
        const postIds = commentedPosts.map(cp => cp.postId);
        if (postIds.length > 0) {
          this.postService.getPostsByIds(postIds).subscribe({
            next: (posts) => {
              this.replies = posts.map(p => ({ ...p, showComments: false, comments: [] }));
              this.checkLikes(this.replies);
            }
          });
        } else {
          this.replies = [];
        }
      }
    });
  }

  loadLikedPosts(userId: number) {
    this.likeService.getLikesByUser(userId).subscribe({
      next: (likes) => {
        const postIds = likes.filter(l => l.targetType === 'Post').map(l => l.targetId);
        if (postIds.length > 0) {
          this.postService.getPostsByIds(postIds).subscribe({
            next: (posts) => {
              this.likedPosts = posts.map(p => ({ ...p, showComments: false, comments: [] }));
              this.checkLikes(this.likedPosts);
            }
          });
        } else {
          this.likedPosts = [];
        }
      }
    });
  }

  checkLikes(posts: any[]) {
    posts.forEach(post => {
      this.likeService.hasUserLiked(post.postId, 'Post').subscribe({
        next: (hasLiked) => post.hasLiked = hasLiked
      });
    });
  }

  deletePost(postId: number) {
    if (!confirm('Are you sure you want to delete this post?')) return;

    this.postService.deletePost(postId).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.postId !== postId);
        this.replies = this.replies.filter(p => p.postId !== postId);
        this.likedPosts = this.likedPosts.filter(p => p.postId !== postId);
        this.message = 'Post deleted successfully';
        setTimeout(() => this.message = '', 3000);
      },
      error: (err) => console.error('Failed to delete post', err)
    });
  }


}
