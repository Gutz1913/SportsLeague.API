import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import {
  MatTableModule, MatButtonModule, MatIconModule,
  MatChipsModule, MatTooltipModule, MatProgressSpinnerModule,
  MatSelectModule, MatFormFieldModule
} from '../../shared/material.imports';
import { FormsModule } from '@angular/forms';
import { MatchService } from '../../core/services/match.service';
import { TournamentService } from '../../core/services/tournament.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Match, MatchStatus } from '../../core/models/match.model';
import { Tournament } from '../../core/models/tournament.model';
import { MatchFormDialogComponent } from './match-form-dialog';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
 
@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [
    DatePipe, FormsModule, MatTableModule, MatButtonModule,
    MatIconModule, MatChipsModule, MatTooltipModule,
    MatProgressSpinnerModule, MatSelectModule, MatFormFieldModule,
    PageHeaderComponent
  ],
  template: `
    <app-page-header title="Partidos"
      [showAddButton]="authService.hasAnyRole(['Admin','Referee'])"
      addButtonText="Programar Partido" (add)="openForm()" />
 
    <mat-form-field appearance="outline" class="filter">
      <mat-label>Filtrar por Torneo</mat-label>
      <mat-select [(ngModel)]="selectedTournamentId"
                  (selectionChange)="loadMatches()">
        @for (t of tournaments; track t.id) {
          <mat-option [value]="t.id">{{ t.name }}</mat-option>
        }
      </mat-select>
    </mat-form-field>
 
    @if (loading) {
      <div class="center"><mat-spinner></mat-spinner></div>
    } @else {
      <table mat-table [dataSource]="matches" class="mat-elevation-z2 full-width">
        <ng-container matColumnDef="matchday">
          <th mat-header-cell *matHeaderCellDef>J</th>
          <td mat-cell *matCellDef="let m">{{ m.matchday }}</td>
        </ng-container>
        <ng-container matColumnDef="teams">
          <th mat-header-cell *matHeaderCellDef>Partido</th>
          <td mat-cell *matCellDef="let m">
            <strong>{{ m.homeTeamName }}</strong> vs {{ m.awayTeamName }}
          </td>
        </ng-container>
        <ng-container matColumnDef="date">
          <th mat-header-cell *matHeaderCellDef>Fecha</th>
          <td mat-cell *matCellDef="let m">{{ m.matchDate | date:'mediumDate' }}</td>
        </ng-container>
        <ng-container matColumnDef="venue">
          <th mat-header-cell *matHeaderCellDef>Sede</th>
          <td mat-cell *matCellDef="let m">{{ m.venue }}</td>
        </ng-container>
        <ng-container matColumnDef="referee">
          <th mat-header-cell *matHeaderCellDef>Árbitro</th>
          <td mat-cell *matCellDef="let m">{{ m.refereeFullName }}</td>
        </ng-container>
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Estado</th>
          <td mat-cell *matCellDef="let m">
            <mat-chip [class]="getStatusClass(m.status)">
              {{ getStatusLabel(m.status) }}
            </mat-chip>
          </td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let m">
            <button mat-icon-button color="primary"
                    matTooltip="Ver detalle" (click)="goToDetail(m)">
              <mat-icon>visibility</mat-icon>
            </button>
            @if (authService.isAdmin() && m.status === MatchStatus.Scheduled) {
              <button mat-icon-button color="warn"
                      matTooltip="Eliminar" (click)="confirmDelete(m)">
                <mat-icon>delete</mat-icon>
              </button>
            }
          </td>
        </ng-container>
 
        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns;"></tr>
      </table>
    }
  `,
  styles: [`
    .filter { min-width:300px; margin-bottom:16px; }
    .full-width { width:100%; }
    .center { display:flex; justify-content:center; padding:48px; }
    .status-scheduled { background:#FFF8E1 !important; color:#F57F17 !important; }
    .status-inprogress { background:#E8F5E9 !important; color:#2E7D32 !important; }
    .status-finished { background:#E3F2FD !important; color:#1565C0 !important; }
    .status-suspended { background:#FFEBEE !important; color:#C62828 !important; }
  `]
})
export class MatchListComponent implements OnInit {
  private matchService = inject(MatchService);
  private tournamentService = inject(TournamentService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private notification = inject(NotificationService);
  authService = inject(AuthService);
 
  matches: Match[] = [];
  tournaments: Tournament[] = [];
  selectedTournamentId: number | null = null;
  loading = false;
  MatchStatus = MatchStatus;
  columns = ['matchday','teams','date','venue','referee','status','actions'];
 
  ngOnInit(): void {
    this.tournamentService.getAll().subscribe(res => {
      this.tournaments = res.data ?? [];
      if (this.tournaments.length > 0) {
        this.selectedTournamentId = this.tournaments[0].id;
        this.loadMatches();
      }
    });
  }
 
  loadMatches(): void {
    if (!this.selectedTournamentId) return;
    this.loading = true;
    this.matchService.getByTournament(this.selectedTournamentId).subscribe({
      next: res => { this.matches = res.data ?? []; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
 
  getStatusLabel(s: MatchStatus): string {
    return {0:'Programado',1:'En Curso',2:'Finalizado',3:'Suspendido'}[s]??'';
  }
  getStatusClass(s: MatchStatus): string {
    return {0:'status-scheduled',1:'status-inprogress',
            2:'status-finished',3:'status-suspended'}[s]??'';
  }
 
  goToDetail(m: Match): void { this.router.navigate(['/matches', m.id]); }
 
  openForm(): void {
    const ref = this.dialog.open(MatchFormDialogComponent, {
      data: { tournamentId: this.selectedTournamentId }, width:'580px'
    });
    ref.afterClosed().subscribe(r => {
      if (r) this.matchService.create(r).subscribe({
        next: () => { this.notification.success('Partido programado'); this.loadMatches(); }
      });
    });
  }
 
  confirmDelete(m: Match): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data:{title:'Eliminar partido',
            message:`¿Eliminar ${m.homeTeamName} vs ${m.awayTeamName}?`}
    });
    ref.afterClosed().subscribe(ok => {
      if(ok) this.matchService.delete(m.id).subscribe({
        next:()=>{this.notification.success('Partido eliminado');this.loadMatches();}
      });
    });
  }
}

