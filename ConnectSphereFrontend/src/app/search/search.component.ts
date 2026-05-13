import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UserService, UserResponse } from '../services/user.service';
import { FollowService, FollowResponse } from '../services/follow.service';
import { PostService, PostResponse } from '../services/post.service';
import { LikeService } from '../services/like.service';
import { CommentService } from '../services/comment.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent {
  searchQuery: string = '';
  users: (UserResponse & { followStatus?: string })[] = [];
  posts: any[] = [];
  searchMode: 'users' | 'posts' = 'users';
  loading: boolean = false;

  constructor(
    private userService: UserService,
    private followService: FollowService,
    private postService: PostService,
    private likeService: LikeService,
    private commentService: CommentService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['hashtag']) {
        this.searchQuery = '#' + params['hashtag'];
        this.onHashtagSearch(params['hashtag']);
      }
    });
  }

  onSearch() {
    if (this.searchQuery.startsWith('#')) {
      this.onHashtagSearch(this.searchQuery.substring(1));
      return;
    }
    this.searchMode = 'users';
    this.posts = [];
    if (!this.searchQuery.trim()) {
      this.users = [];
      return;
    }

    this.loading = true;
    this.userService.searchUsers(this.searchQuery).subscribe({
      next: (results) => {
        this.users = results.map(u => ({ ...u, followStatus: 'NONE' }));
        this.checkFollowStatus();
        this.loading = false;
      },
      error: (err) => {
        console.error('Search error:', err);
        this.loading = false;
      }
    });
  }

  onHashtagSearch(tag: string) {
    this.searchMode = 'posts';
    this.users = [];
    this.loading = true;
    this.postService.getPostsByHashtag(tag).subscribe({
      next: (results) => {
        this.posts = results.map(p => ({ ...p, showComments: false, comments: [] }));
        this.checkLikes();
        this.loading = false;
      },
      error: (err) => {
        console.error('Hashtag search error:', err);
        this.loading = false;
      }
    });
  }

  checkLikes() {
    this.posts.forEach(post => {
      this.likeService.hasUserLiked(post.postId, 'Post').subscribe({
        next: (hasLiked) => post.hasLiked = hasLiked
      });
    });
  }

  toggleLike(post: any) {
    this.likeService.toggleLike(post.postId, 'Post').subscribe({
      next: () => {
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

  checkFollowStatus() {
    this.users.forEach(user => {
      this.followService.isFollowing(user.userId).subscribe({
        next: (resp) => {
          user.followStatus = resp ? resp.status : 'NONE';
        },
        error: () => user.followStatus = 'NONE'
      });
    });
  }

  toggleFollow(user: any) {
    if (user.followStatus === 'ACCEPTED' || user.followStatus === 'PENDING') {
      this.followService.unfollowUser(user.userId).subscribe({
        next: () => {
          const wasAccepted = user.followStatus === 'ACCEPTED';
          user.followStatus = 'NONE';
          if (wasAccepted) user.followerCount--;
        }
      });
    } else {
      this.followService.followUser(user.userId).subscribe({
        next: (resp: FollowResponse) => {
          user.followStatus = resp.status;
          if (resp.status === 'ACCEPTED') user.followerCount++;
        }
      });
    }
  }
}
