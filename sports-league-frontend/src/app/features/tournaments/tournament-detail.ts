
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import {
  MatCardModule, MatButtonModule, MatIconModule, MatChipsModule,
  MatProgressSpinnerModule, MatSelectModule, MatFormFieldModule,
  MatListModule, MatTooltipModule, MatTabsModule
} from '../../shared/material.imports';
import { FormsModule } from '@angular/forms';
import { TournamentService } from '../../core/services/tournament.service';
import { TeamService } from '../../core/services/team.service';
//import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Tournament, TournamentStatus } from '../../core/models/tournament.model';
import { Team } from '../../core/models/team.model';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog';
 
@Component({
  selector: 'app-tournament-detail',
  standalone: true,
  imports: [
    DatePipe, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatProgressSpinnerModule, MatSelectModule, MatFormFieldModule,
    MatListModule, MatTooltipModule, MatTabsModule
  ],
  template: `
    @if (loading) {
      <div class="center"><mat-spinner></mat-spinner></div>
    } @else if (tournament) {
      <div class="detail-header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div>
          <h1>{{ tournament.name }}</h1>
          <p class="season">{{ tournament.season }} | 
            {{ tournament.startDate | date:'mediumDate' }} — 
            {{ tournament.endDate | date:'mediumDate' }}
          </p>
        </div>
        <mat-chip [class]="getStatusClass(tournament.status)">
          {{ getStatusLabel(tournament.status) }}
        </mat-chip>
      </div>
 
      <!-- Acciones de estado -->
      @if (authService.isAdmin()) {
        <div class="status-actions">
          @if (tournament.status === TournamentStatus.Pending) {
            <button mat-raised-button color="primary"
                    (click)="changeStatus(TournamentStatus.InProgress)">
              <mat-icon>play_arrow</mat-icon> Iniciar Torneo
            </button>
          }
          @if (tournament.status === TournamentStatus.InProgress) {
            <button mat-raised-button color="accent"
                    (click)="changeStatus(TournamentStatus.Finished)">
              <mat-icon>flag</mat-icon> Finalizar Torneo
            </button>
          }
          @if (tournament.status === TournamentStatus.Finished) {
            <mat-chip class="status-finished">
              <mat-icon>check_circle</mat-icon> Torneo Finalizado
            </mat-chip>
          }
        </div>
      }
 
      <mat-tab-group>
        <!-- Tab: Equipos Inscritos -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>groups</mat-icon>&nbsp;
            Equipos ({{ enrolledTeams.length }})
          </ng-template>
 
          <!-- Inscribir equipo -->
          @if (authService.isAdmin() &&
               tournament.status === TournamentStatus.Pending) {
            <div class="enroll-section">
              <mat-form-field appearance="outline" class="enroll-select">
                <mat-label>Inscribir equipo</mat-label>
                <mat-select [(ngModel)]="selectedTeamId">
                  @for (team of availableTeams; track team.id) {
                    <mat-option [value]="team.id">{{ team.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <button mat-raised-button color="primary"
                      [disabled]="!selectedTeamId"
                      (click)="enrollTeam()">
                <mat-icon>person_add</mat-icon> Inscribir
              </button>
            </div>
          }
 
          <!-- Lista de equipos inscritos -->
          <div class="enrolled-list">
            @for (team of enrolledTeams; track team.id) {
              <mat-chip class="team-chip">
                <mat-icon matChipAvatar>groups</mat-icon>
                {{ team.name }} — {{ team.city }}
                @if (authService.isAdmin() &&
                     tournament.status === TournamentStatus.Pending) {
                  <button matChipRemove (click)="removeTeam(team)">
                    <mat-icon>cancel</mat-icon>
                  </button>
                }
              </mat-chip>
            }
 
            @if (enrolledTeams.length === 0) {
              <p class="empty">No hay equipos inscritos aún.</p>
            }
          </div>
        </mat-tab>
 
        <!-- Tab: Info (placeholder para Matches en F5) -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>info</mat-icon>&nbsp; Información
          </ng-template>
          <div class="info-section">
            <p><strong>Creado:</strong> {{ tournament.createdAt | date:'medium' }}</p>
            <p><strong>Equipos inscritos:</strong> {{ enrolledTeams.length }}</p>
            <p><strong>Estado:</strong> {{ getStatusLabel(tournament.status) }}</p>
          </div>
        </mat-tab>
      </mat-tab-group>
    }
  `,
  styles: [`
    .detail-header {
      display:flex; align-items:center; gap:16px; margin-bottom:24px;
    }
    .detail-header h1 { margin:0; color:#1565C0; }
    .season { margin:4px 0 0; color:#757575; }
    .status-actions { margin-bottom:24px; }
    .enroll-section {
      display:flex; align-items:center; gap:16px;
      padding:16px 0; border-bottom:1px solid #eee;
    }
    .enroll-select { min-width:280px; }
    .enrolled-list {
      display:flex; flex-wrap:wrap; gap:8px; padding:16px 0;
    }
    .team-chip { font-size:14px !important; padding:8px 12px !important; }
    .info-section { padding:16px 0; }
    .center { display:flex; justify-content:center; padding:48px; }
    .empty { color:#757575; padding:16px 0; }
    .status-pending { background:#FFF8E1 !important; color:#F57F17 !important; }
    .status-inprogress { background:#E8F5E9 !important; color:#2E7D32 !important; }
    .status-finished { background:#E3F2FD !important; color:#1565C0 !important; }
  `]
})
export class TournamentDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tournamentService = inject(TournamentService);
  private teamService = inject(TeamService);
  private dialog = inject(MatDialog);
  private notification = inject(NotificationService);
  //authService = inject(AuthService);
 
  tournament: Tournament | null = null;
  enrolledTeams: Team[] = [];
  allTeams: Team[] = [];
  availableTeams: Team[] = [];
  selectedTeamId: number | null = null;
  loading = false;
  TournamentStatus = TournamentStatus;
 
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadTournament(id);
    this.teamService.getAll().subscribe(res => {
      this.allTeams = res.data ?? [];
      this.updateAvailableTeams();
    });
  }
 
  loadTournament(id: number): void {
    this.loading = true;
    this.tournamentService.getById(id).subscribe({
      next: res => {
        this.tournament = res.data;
        this.loadEnrolledTeams(id);
        this.loading = false;
      },
      error: () => { this.loading = false; this.router.navigate(['/tournaments']); }
    });
  }
 
  loadEnrolledTeams(tournamentId: number): void {
    this.tournamentService.getTeams(tournamentId).subscribe({
      next: res => {
        this.enrolledTeams = res.data ?? [];
        this.updateAvailableTeams();
      }
    });
  }
 
  updateAvailableTeams(): void {
    const enrolledIds = new Set(this.enrolledTeams.map(t => t.id));
    this.availableTeams = this.allTeams.filter(t => !enrolledIds.has(t.id));
  }
 
  enrollTeam(): void {
    if (!this.tournament || !this.selectedTeamId) return;
    this.tournamentService.enrollTeam(this.tournament.id, this.selectedTeamId)
      .subscribe({
        next: () => {
          this.notification.success('Equipo inscrito');
          this.selectedTeamId = null;
          this.loadEnrolledTeams(this.tournament!.id);
        }
      });
  }
 
  removeTeam(team: Team): void {
    if (!this.tournament) return;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Desinscribir equipo',
        message: `¿Remover "${team.name}" del torneo?`,
        confirmText: 'Remover'
      }
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.tournamentService.removeTeam(this.tournament!.id, team.id)
        .subscribe({
          next: () => {
            this.notification.success('Equipo removido');
            this.loadEnrolledTeams(this.tournament!.id);
          }
        });
    });
  }
 
  changeStatus(newStatus: TournamentStatus): void {
    if (!this.tournament) return;
    const labels: Record<number, string> = {
      [TournamentStatus.InProgress]: 'iniciar',
      [TournamentStatus.Finished]: 'finalizar',
    };
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `${labels[newStatus]?.charAt(0).toUpperCase()}${labels[newStatus]?.slice(1)} torneo`,
        message: `¿Estás seguro de ${labels[newStatus]} "${this.tournament.name}"?`,
        confirmText: labels[newStatus]?.charAt(0).toUpperCase() + labels[newStatus]?.slice(1)
      }
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.tournamentService.updateStatus(this.tournament!.id, newStatus)
        .subscribe({
          next: () => {
            this.notification.success(`Torneo ${labels[newStatus]}do exitosamente`);
            this.loadTournament(this.tournament!.id);
          }
        });
    });
  }
 
  getStatusLabel(status: TournamentStatus): string {
    return { 0:'Pendiente', 1:'En Curso', 2:'Finalizado' }[status] ?? '';
  }
 
  getStatusClass(status: TournamentStatus): string {
    return { 0:'status-pending', 1:'status-inprogress', 2:'status-finished' }[status] ?? '';
  }
 
  goBack(): void { this.router.navigate(['/tournaments']); }
}
