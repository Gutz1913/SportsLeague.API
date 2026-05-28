import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import { Team, TeamRequest } from '../models/team.model';
 
@Injectable({ providedIn: 'root' })
export class TeamService {
  private api = inject(ApiService);
  private endpoint = 'Team';
 
  getAll(): Observable<ApiResponse<Team[]>> {
    return this.api.get<ApiResponse<Team[]>>(this.endpoint);
  }
 
  getById(id: number): Observable<ApiResponse<Team>> {
    return this.api.get<ApiResponse<Team>>(`${this.endpoint}/${id}`);
  }
 
  create(team: TeamRequest): Observable<ApiResponse<Team>> {
    return this.api.post<ApiResponse<Team>>(this.endpoint, team);
  }
 
  update(id: number, team: TeamRequest): Observable<any> {
    return this.api.put<any>(`${this.endpoint}/${id}`, team);
  }
 
  delete(id: number): Observable<any> {
    return this.api.delete<any>(`${this.endpoint}/${id}`);
  }
}
