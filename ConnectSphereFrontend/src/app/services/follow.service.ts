import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FollowResponse {
  followId: number;
  followerId: number;
  followeeId: number;
  userName?: string;
  fullName?: string;
  avatarUrl?: string;
  status: string;
  processing?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FollowService {
  private apiUrl = `${environment.apiUrl}/follows`;

  constructor(private http: HttpClient) { }

  followUser(followeeId: number): Observable<FollowResponse> {
    return this.http.post<FollowResponse>(`${this.apiUrl}`, { followeeId });
  }

  unfollowUser(followeeId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${followeeId}`);
  }

  isFollowing(followeeId: number): Observable<FollowResponse | null> {
    return this.http.get<FollowResponse | null>(`${this.apiUrl}/is-following/${followeeId}`);
  }

  getFollowers(userId: number): Observable<FollowResponse[]> {
    return this.http.get<FollowResponse[]>(`${this.apiUrl}/${userId}/followers`);
  }

  getFollowing(userId: number): Observable<FollowResponse[]> {
    return this.http.get<FollowResponse[]>(`${this.apiUrl}/${userId}/following`);
  }

  getPendingRequests(): Observable<FollowResponse[]> {
    return this.http.get<FollowResponse[]>(`${this.apiUrl}/pending`);
  }

  acceptFollowRequest(followId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${followId}/accept`, {});
  }

  rejectFollowRequest(followId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${followId}/reject`, {});
  }

  syncCounts(): Observable<any> {
    return this.http.post(`${this.apiUrl}/sync`, {});
  }

  getFollowerCount(userId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${userId}/follower-count`);
  }

  getFollowingCount(userId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${userId}/following-count`);
  }
}
