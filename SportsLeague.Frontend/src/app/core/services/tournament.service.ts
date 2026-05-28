import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import { Tournament, TournamentRequest } from '../models/tournament.model';
import { Team } from '../models/team.model';
 
@Injectable({ providedIn: 'root' })
export class TournamentService {
  private api = inject(ApiService);
  private endpoint = 'Tournament';
 
  getAll(): Observable<ApiResponse<Tournament[]>> {
    return this.api.get<ApiResponse<Tournament[]>>(this.endpoint);
  }
 
  getById(id: number): Observable<ApiResponse<Tournament>> {
    return this.api.get<ApiResponse<Tournament>>(`${this.endpoint}/${id}`);
  }
 
  create(t: TournamentRequest): Observable<ApiResponse<Tournament>> {
    return this.api.post<ApiResponse<Tournament>>(this.endpoint, t);
  }
 
  update(id: number, t: TournamentRequest): Observable<any> {
    return this.api.put<any>(`${this.endpoint}/${id}`, t);
  }
 
  delete(id: number): Observable<any> {
    return this.api.delete<any>(`${this.endpoint}/${id}`);
  }
 
  updateStatus(id: number, status: number): Observable<any> {
    return this.api.patch<any>(`${this.endpoint}/${id}/status`, { status });
  }
 
  // Equipos inscritos
  getTeams(tournamentId: number): Observable<ApiResponse<Team[]>> {
    return this.api.get<ApiResponse<Team[]>>(
      `${this.endpoint}/${tournamentId}/teams`);
  }
 
  enrollTeam(tournamentId: number, teamId: number): Observable<any> {
    return this.api.post<any>(
      `${this.endpoint}/${tournamentId}/teams`, { teamId });
  }
 
  removeTeam(tournamentId: number, teamId: number): Observable<any> {
    return this.api.delete<any>(
      `${this.endpoint}/${tournamentId}/teams/${teamId}`);
  }
}
