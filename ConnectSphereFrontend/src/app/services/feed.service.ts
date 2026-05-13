import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PostResponse } from './post.service';

@Injectable({
  providedIn: 'root'
})
export class FeedService {
  private apiUrl = `${environment.apiUrl}/feed`; // Gateway uses /api/feed

  constructor(private http: HttpClient) { }

  getFollowingFeed(): Observable<PostResponse[]> {
    return this.http.get<PostResponse[]>(`${this.apiUrl}/following`);
  }

  getExploreFeed(): Observable<PostResponse[]> {
    return this.http.get<PostResponse[]>(`${this.apiUrl}/explore`);
  }
}
