import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import { Standing, TopScorer, CardStats } from '../models/standings.model';
 
@Injectable({ providedIn: 'root' })
export class StandingsService {
  private api = inject(ApiService);
 
  getStandings(tournamentId: number): Observable<ApiResponse<Standing[]>> {
    return this.api.get<ApiResponse<Standing[]>>(
      'standings', { tournamentId });
  }
 
  getTopScorers(tournamentId: number): Observable<ApiResponse<TopScorer[]>> {
    return this.api.get<ApiResponse<TopScorer[]>>(
      'stats/scorers', { tournamentId });
  }
 
  getCardStats(tournamentId: number): Observable<ApiResponse<CardStats[]>> {
    return this.api.get<ApiResponse<CardStats[]>>(
      'stats/cards', { tournamentId });
  }
}
