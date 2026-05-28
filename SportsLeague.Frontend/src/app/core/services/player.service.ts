import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, PagedResult } from '../models/api-response.model';
import { Player, PlayerRequest } from '../models/player.model';
 
@Injectable({ providedIn: 'root' })
export class PlayerService {
  private api = inject(ApiService);
  private endpoint = 'Player';
 
  getFiltered(params: {
    teamId?: number; position?: number;
    search?: string; page?: number; pageSize?: number;
  }): Observable<ApiResponse<PagedResult<Player>>> {
    return this.api.get<ApiResponse<PagedResult<Player>>>(this.endpoint, params);
  }
 
  getById(id: number): Observable<ApiResponse<Player>> {
    return this.api.get<ApiResponse<Player>>(`${this.endpoint}/${id}`);
  }
 
  create(player: PlayerRequest): Observable<ApiResponse<Player>> {
    return this.api.post<ApiResponse<Player>>(this.endpoint, player);
  }
 
  update(id: number, player: PlayerRequest): Observable<any> {
    return this.api.put<any>(`${this.endpoint}/${id}`, player);
  }
 
  delete(id: number): Observable<any> {
    return this.api.delete<any>(`${this.endpoint}/${id}`);
  }
}
