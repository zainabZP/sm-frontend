import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserResponse {
  userId: number;
  userName: string;
  fullName: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  followerCount: number;
  followingCount: number;
  isPrivate: boolean;
}

export interface UpdateProfileDto {
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface ChangePasswordDto {
  currentPassword?: string;
  newPassword?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/auth/users`;

  constructor(private http: HttpClient) { }

  searchUsers(query: string): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiUrl}/search-users?q=${query}`);
  }

  getUserById(userId: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/get-user-by-id/${userId}`);
  }

  getRecommendations(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiUrl}/recommendations`);
  }

  updateProfile(dto: UpdateProfileDto): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/update-profile`, dto);
  }

  changePassword(dto: ChangePasswordDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/change-password`, dto);
  }

  togglePrivacy(): Observable<any> {
    return this.http.put(`${this.apiUrl}/toggle-privacy`, {});
  }

  deactivateAccount(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deactivate`);
  }

  isUserPrivate(userId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/${userId}/is-private`);
  }
}
