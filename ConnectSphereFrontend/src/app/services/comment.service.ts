import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CommentResponse {
  commentId: number;
  content: string;
  userId: number;
  userName: string;
  fullName: string;
  avatarUrl?: string;
  postId: number;
  parentCommentId?: number;
  createdAt: string;
  replies?: CommentResponse[];
}

export interface CreateCommentDto {
  postId: number;
  content: string;
  parentCommentId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = `${environment.apiUrl}/comments`;

  constructor(private http: HttpClient) { }

  addComment(dto: CreateCommentDto): Observable<CommentResponse> {
    return this.http.post<CommentResponse>(this.apiUrl, dto);
  }

  getCommentsByPost(postId: number): Observable<CommentResponse[]> {
    return this.http.get<CommentResponse[]>(`${this.apiUrl}/post/${postId}`);
  }

  getPostsCommentedByUser(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }

  deleteComment(commentId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${commentId}`);
  }
}
