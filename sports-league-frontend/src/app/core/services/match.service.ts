import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import { Match, MatchRequest, MatchStatus } from '../models/match.model';
 
@Injectable({ providedIn: 'root' })
export class MatchService {
  private api = inject(ApiService);
 
  getByTournament(tournamentId: number): Observable<ApiResponse<Match[]>> {
    return this.api.get<ApiResponse<Match[]>>(
      `Match/tournament/${tournamentId}`);
  }
 
  getById(id: number): Observable<ApiResponse<Match>> {
    return this.api.get<ApiResponse<Match>>(`Match/${id}`);
  }
 
  create(match: MatchRequest): Observable<ApiResponse<Match>> {
    return this.api.post<ApiResponse<Match>>('Match', match);
  }
 
  update(id: number, match: MatchRequest): Observable<any> {
    return this.api.put<any>(`Match/${id}`, match);
  }
 
  delete(id: number): Observable<any> {
    return this.api.delete<any>(`Match/${id}`);
  }
 
  updateStatus(id: number, status: MatchStatus): Observable<any> {
    return this.api.patch<any>(`Match/${id}/status`, { status });
  }
}
