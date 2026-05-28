import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import { Referee, RefereeRequest } from '../models/referee.model';
 
@Injectable({ providedIn: 'root' })
export class RefereeService {
  private api = inject(ApiService);
  private endpoint = 'Referee';
 
  getAll(): Observable<ApiResponse<Referee[]>> {
    return this.api.get<ApiResponse<Referee[]>>(this.endpoint);
  }
 
  create(referee: RefereeRequest): Observable<ApiResponse<Referee>> {
    return this.api.post<ApiResponse<Referee>>(this.endpoint, referee);
  }
 
  update(id: number, referee: RefereeRequest): Observable<any> {
    return this.api.put<any>(`${this.endpoint}/${id}`, referee);
  }
 
  delete(id: number): Observable<any> {
    return this.api.delete<any>(`${this.endpoint}/${id}`);
  }
}
