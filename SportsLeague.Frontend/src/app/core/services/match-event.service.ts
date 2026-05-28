import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import {
  MatchResult, MatchResultRequest,
  Goal, GoalRequest, Card, CardRequest
} from '../models/match.model';
 
@Injectable({ providedIn: 'root' })
export class MatchEventService {
  private api = inject(ApiService);
 
  // Result
  getResult(matchId: number): Observable<ApiResponse<MatchResult>> {
    return this.api.get<ApiResponse<MatchResult>>(`match/${matchId}/result`);
  }
 
  registerResult(matchId: number, result: MatchResultRequest)
    : Observable<ApiResponse<MatchResult>> {
    return this.api.post<ApiResponse<MatchResult>>(
      `match/${matchId}/result`, result);
  }
 
  // Goals
  getGoals(matchId: number): Observable<ApiResponse<Goal[]>> {
    return this.api.get<ApiResponse<Goal[]>>(`match/${matchId}/goals`);
  }
 
  registerGoal(matchId: number, goal: GoalRequest)
    : Observable<ApiResponse<Goal>> {
    return this.api.post<ApiResponse<Goal>>(
      `match/${matchId}/goals`, goal);
  }
 
  deleteGoal(matchId: number, goalId: number): Observable<any> {
    return this.api.delete<any>(`match/${matchId}/goals/${goalId}`);
  }
 
  // Cards
  getCards(matchId: number): Observable<ApiResponse<Card[]>> {
    return this.api.get<ApiResponse<Card[]>>(`match/${matchId}/cards`);
  }
 
  registerCard(matchId: number, card: CardRequest)
    : Observable<ApiResponse<Card>> {
    return this.api.post<ApiResponse<Card>>(
      `match/${matchId}/cards`, card);
  }
 
  deleteCard(matchId: number, cardId: number): Observable<any> {
    return this.api.delete<any>(`match/${matchId}/cards/${cardId}`);
  }
}
