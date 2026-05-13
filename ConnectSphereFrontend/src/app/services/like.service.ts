import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ToggleLikeDto {
  targetId: number;
  targetType: 'Post' | 'Comment';
}

export interface LikeResponse {
  id: number;
  userId: number;
  userName: string;
  targetId: number;
  targetType: string;
}

@Injectable({
  providedIn: 'root'
})
export class LikeService {
  private apiUrl = `${environment.apiUrl}/likes`;

  constructor(private http: HttpClient) { }

  toggleLike(targetId: number, targetType: 'Post' | 'Comment'): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/toggle`, { targetId, targetType });
  }

  getLikesByTarget(targetId: number, targetType: string): Observable<LikeResponse[]> {
    return this.http.get<LikeResponse[]>(`${this.apiUrl}/target/${targetId}?targetType=${targetType}`);
  }

  getLikeCount(targetId: number, targetType: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count/${targetId}?targetType=${targetType}`);
  }

  hasUserLiked(targetId: number, targetType: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/has-liked/${targetId}?targetType=${targetType}`);
  }

  getLikesByUser(userId: number): Observable<LikeResponse[]> {
    return this.http.get<LikeResponse[]>(`${this.apiUrl}/user/${userId}`);
  }
}
