import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import {
  MatCardModule, MatButtonModule, MatIconModule, MatChipsModule,
  MatProgressSpinnerModule, MatTooltipModule, MatBadgeModule
} from './../../shared/material.imports';
import { TournamentService } from '../../core/services/tournament.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Tournament, TournamentStatus } from '../../core/models/tournament.model';
import { TournamentFormDialogComponent } from './tournament-form-dialog';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
 
@Component({
  selector: 'app-tournament-list',
  standalone: true,
  imports: [
    DatePipe, MatCardModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatProgressSpinnerModule, MatTooltipModule,
    MatBadgeModule, PageHeaderComponent
  ],
  template: `
    <app-page-header title="Torneos"
      subtitle="Gestión de torneos de la liga"
      [showAddButton]="authService.isAdmin()"
      addButtonText="Nuevo Torneo" (add)="openForm()" />
 
    @if (loading) {
      <div class="center"><mat-spinner></mat-spinner></div>
    } @else {
      <div class="grid">
        @for (t of tournaments; track t.id) {
          <mat-card class="tournament-card" (click)="goToDetail(t)">
            <mat-card-header>
              <mat-card-title>{{ t.name }}</mat-card-title>
              <mat-card-subtitle>{{ t.season }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="card-info">
                <mat-chip [class]="getStatusClass(t.status)">
                  {{ getStatusLabel(t.status) }}
                </mat-chip>
                <span class="teams-count">
                  <mat-icon>groups</mat-icon> {{ t.teamsCount }} equipos
                </span>
              </div>
              <div class="dates">
                <small>{{ t.startDate | date:'mediumDate' }} — {{ t.endDate | date:'mediumDate' }}</small>
              </div>
            </mat-card-content>
            <mat-card-actions align="end">
              <button mat-button color="primary" (click)="goToDetail(t); $event.stopPropagation()">
                <mat-icon>visibility</mat-icon> Ver detalle
              </button>
              @if (authService.isAdmin() && t.status === TournamentStatus.Pending) {
                <button mat-icon-button matTooltip="Editar"
                        (click)="openForm(t); $event.stopPropagation()">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" matTooltip="Eliminar"
                        (click)="confirmDelete(t); $event.stopPropagation()">
                  <mat-icon>delete</mat-icon>
                </button>
              }
            </mat-card-actions>
          </mat-card>
        }
 
        @if (tournaments.length === 0) {
          <p class="empty">No hay torneos registrados.</p>
        }
      </div>
    }
  `,
  styles: [`
    .grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(340px,1fr)); gap:20px; }
    .tournament-card { cursor:pointer; transition:box-shadow 0.2s; }
    .tournament-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.12); }
    .card-info { display:flex; align-items:center; justify-content:space-between; margin:12px 0; }
    .teams-count { display:flex; align-items:center; gap:4px; color:#757575; }
    .dates { color:#9e9e9e; }
    .status-pending { background:#FFF8E1 !important; color:#F57F17 !important; }
    .status-inprogress { background:#E8F5E9 !important; color:#2E7D32 !important; }
    .status-finished { background:#E3F2FD !important; color:#1565C0 !important; }
    .center { display:flex; justify-content:center; padding:48px; }
    .empty { text-align:center; color:#757575; grid-column:1/-1; padding:32px; }
  `]
})
export class TournamentListComponent implements OnInit {
  private tournamentService = inject(TournamentService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private notification = inject(NotificationService);
  authService = inject(AuthService);
 
  tournaments: Tournament[] = [];
  loading = false;
  TournamentStatus = TournamentStatus;
 
  ngOnInit(): void { this.loadTournaments(); }
 
  loadTournaments(): void {
    this.loading = true;
    this.tournamentService.getAll().subscribe({
      next: res => { this.tournaments = res.data ?? []; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
 
  getStatusLabel(status: TournamentStatus): string {
    const labels: Record<number, string> = {
      [TournamentStatus.Pending]: 'Pendiente',
      [TournamentStatus.InProgress]: 'En Curso',
      [TournamentStatus.Finished]: 'Finalizado',
    };
    return labels[status] ?? '';
  }
 
  getStatusClass(status: TournamentStatus): string {
    const classes: Record<number, string> = {
      [TournamentStatus.Pending]: 'status-pending',
      [TournamentStatus.InProgress]: 'status-inprogress',
      [TournamentStatus.Finished]: 'status-finished',
    };
    return classes[status] ?? '';
  }
 
  goToDetail(t: Tournament): void {
    this.router.navigate(['/tournaments', t.id]);
  }
 
  openForm(t?: Tournament): void {
    const ref = this.dialog.open(TournamentFormDialogComponent, {
      data: { tournament: t }, width: '520px'
    });
    ref.afterClosed().subscribe(result => {
      if (!result) return;
      const obs = t
        ? this.tournamentService.update(t.id, result)
        : this.tournamentService.create(result);
      obs.subscribe({
        next: () => {
          this.notification.success(t ? 'Torneo actualizado' : 'Torneo creado');
          this.loadTournaments();
        }
      });
    });
  }
 
  confirmDelete(t: Tournament): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Eliminar torneo', message: `¿Eliminar "${t.name}"?` }
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.tournamentService.delete(t.id).subscribe({
        next: () => { this.notification.success('Torneo eliminado'); this.loadTournaments(); }
      });
    });
  }
}

