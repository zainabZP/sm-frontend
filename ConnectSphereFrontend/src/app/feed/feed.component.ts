import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeedService } from '../services/feed.service';
import { PostService, PostResponse } from '../services/post.service';
import { LikeService } from '../services/like.service';
import { CommentService, CommentResponse } from '../services/comment.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.css'
})
export class FeedComponent implements OnInit {
  posts: (PostResponse & { hasLiked?: boolean, showComments?: boolean, comments?: CommentResponse[], newComment?: string })[] = [];
  newPostContent: string = '';
  newPostMediaUrl: string = '';
  newPostHashtags: string = '';
  loading: boolean = false;
  activeTab: 'explore' | 'following' = 'explore';

  constructor(
    private feedService: FeedService,
    private postService: PostService,
    private likeService: LikeService,
    private commentService: CommentService
  ) {}

  ngOnInit(): void {
    this.loadFeed();
  }

  switchTab(tab: 'explore' | 'following') {
    this.activeTab = tab;
    this.loadFeed();
  }

  loadFeed() {
    this.loading = true;
    const feedObs = this.activeTab === 'explore' 
      ? this.feedService.getExploreFeed() 
      : this.feedService.getFollowingFeed();
    
    feedObs.subscribe({
      next: (data) => {
        this.posts = (data || []).map(p => ({ ...p, showComments: false, comments: [] }));
        this.checkLikes();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load feed', err);
        this.loading = false;
        this.mockFeedData();
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

  createPost() {
    if (!this.newPostContent.trim()) return;

    this.postService.createPost({
      content: this.newPostContent,
      mediaUrl: this.newPostMediaUrl,
      hashtags: this.newPostHashtags
    }).subscribe({
      next: (post) => {
        this.posts.unshift({ ...post, hasLiked: false, showComments: false, comments: [], newComment: '' });
        this.newPostContent = '';
        this.newPostMediaUrl = '';
        this.newPostHashtags = '';
      }
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

  mockFeedData() {
      this.posts = [
          { postId: 1, content: "Just set up my new microservices cluster! 🚀", userId: 1, userName: "DevMaster", fullName: "Dev Master", likeCount: 42, commentCount: 5, shareCount: 2, createdAt: new Date().toISOString(), showComments: false, comments: [], visibility: 'PUBLIC' },
          { postId: 2, content: "Looking forward to trying out Angular 17. The new control flow syntax looks amazing.", userId: 2, userName: "FrontendNinja", fullName: "Frontend Ninja", likeCount: 15, commentCount: 2, shareCount: 1, createdAt: new Date(Date.now() - 3600000).toISOString(), showComments: false, comments: [], visibility: 'PUBLIC' },
          { postId: 3, content: "What's everyone's favorite color palette for modern apps? I'm team Twitter Blue all the way.", userId: 3, userName: "DesignPro", fullName: "Design Pro", likeCount: 89, commentCount: 14, shareCount: 5, createdAt: new Date(Date.now() - 7200000).toISOString(), showComments: false, comments: [], visibility: 'PUBLIC' }
      ];
  }
}
