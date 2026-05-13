import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PostResponse {
  postId: number;
  content: string;
  userId: number;
  userName: string;
  fullName: string;
  avatarUrl?: string;
  mediaUrl?: string;
  mediaType?: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  hashtags?: string;
  visibility: string;
}

export interface CreatePostDto {
  content: string;
  mediaUrl?: string;
  mediaType?: string;
  hashtags?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = `${environment.apiUrl}/posts`;

  constructor(private http: HttpClient) { }

  getPublicPosts(): Observable<PostResponse[]> {
    return this.http.get<PostResponse[]>(`${this.apiUrl}/public`);
  }

  getTrendingPosts(): Observable<PostResponse[]> {
    return this.http.get<PostResponse[]>(`${this.apiUrl}/trending`);
  }

  getPostsByHashtag(hashtag: string): Observable<PostResponse[]> {
    return this.http.get<PostResponse[]>(`${this.apiUrl}/hashtag/${hashtag}`);
  }

  getPostById(postId: number): Observable<PostResponse> {
    return this.http.get<PostResponse>(`${this.apiUrl}/${postId}`);
  }

  getPostsByUserId(userId: number): Observable<PostResponse[]> {
    return this.http.get<PostResponse[]>(`${this.apiUrl}/user/${userId}`);
  }

  createPost(dto: CreatePostDto): Observable<PostResponse> {
    return this.http.post<PostResponse>(this.apiUrl, dto);
  }

  getPostsByIds(postIds: number[]): Observable<PostResponse[]> {
    return this.http.post<PostResponse[]>(`${this.apiUrl}/batch`, postIds);
  }

  updatePost(postId: number, content: string): Observable<PostResponse> {
    return this.http.put<PostResponse>(`${this.apiUrl}/${postId}`, { content });
  }

  deletePost(postId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${postId}`);
  }

  sharePost(postId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${postId}/share`, {});
  }
}
