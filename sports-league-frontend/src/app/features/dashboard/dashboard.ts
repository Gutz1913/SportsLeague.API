import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  MatCardModule, MatButtonModule, MatIconModule, MatChipsModule,
  MatProgressSpinnerModule, MatListModule
} from '../../shared/material.imports';
import { TournamentService } from '../../core/services/tournament.service';
import { MatchService } from '../../core/services/match.service';
import { StandingsService } from '../../core/services/standings.service';
import { AuthService } from '../../core/services/auth.service';
import { Tournament, TournamentStatus } from '../../core/models/tournament.model';
import { Match } from '../../core/models/match.model';
import { Standing, TopScorer } from '../../core/models/standings.model';
 
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatCardModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatProgressSpinnerModule, MatListModule
  ],
  template: `
    <h1 class="welcome">
      Bienvenido, {{ authService.userName() }}
    </h1>
 
    @if (loading) {
      <div class="center"><mat-spinner></mat-spinner></div>
    } @else {
      <div class="dashboard-grid">
 
        <!-- Stats Cards -->
        <mat-card class="stat-card">
          <mat-icon class="stat-icon tournaments">emoji_events</mat-icon>
          <div class="stat-info">
            <span class="stat-number">{{ totalTournaments }}</span>
            <span class="stat-label">Torneos</span>
          </div>
        </mat-card>
 
        <mat-card class="stat-card" (click)="navigate('/matches')">
          <mat-icon class="stat-icon matches">stadium</mat-icon>
          <div class="stat-info">
            <span class="stat-number">{{ recentMatches.length }}</span>
            <span class="stat-label">Partidos recientes</span>
          </div>
        </mat-card>
 
        <mat-card class="stat-card" (click)="navigate('/standings')">
          <mat-icon class="stat-icon standings">leaderboard</mat-icon>
          <div class="stat-info">
            <span class="stat-number">{{ topStandings.length }}</span>
            <span class="stat-label">Equipos en tabla</span>
          </div>
        </mat-card>
 
        <mat-card class="stat-card">
          <mat-icon class="stat-icon scorers">sports_soccer</mat-icon>
          <div class="stat-info">
            <span class="stat-number">{{ topScorers.length }}</span>
            <span class="stat-label">Goleadores</span>
          </div>
        </mat-card>
 
        <!-- Torneo Activo -->
        @if (activeTournament) {
          <mat-card class="wide-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>emoji_events</mat-icon>
                Torneo Activo: {{ activeTournament.name }}
              </mat-card-title>
              <mat-card-subtitle>{{ activeTournament.season }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <button mat-raised-button color="primary"
                      (click)="navigate('/tournaments/' + activeTournament.id)">
                <mat-icon>visibility</mat-icon> Ver torneo
              </button>
              <button mat-raised-button
                      (click)="navigate('/standings')">
                <mat-icon>leaderboard</mat-icon> Ver posiciones
              </button>
            </mat-card-content>
          </mat-card>
        }
 
        <!-- Top 3 posiciones -->
        @if (topStandings.length > 0) {
          <mat-card class="wide-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>leaderboard</mat-icon> Líderes
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-list>
                @for (s of topStandings.slice(0,3); track s.teamId) {
                  <mat-list-item>
                    <span matListItemTitle>
                      {{ s.position }}. {{ s.teamName }}
                    </span>
                    <span matListItemLine>
                      {{ s.points }} pts | {{ s.wins }}G {{ s.draws }}E {{ s.losses }}P
                      | DG: {{ s.goalDifference > 0 ? '+' : '' }}{{ s.goalDifference }}
                    </span>
                  </mat-list-item>
                }
              </mat-list>
            </mat-card-content>
          </mat-card>
        }
 
        <!-- Top 3 goleadores -->
        @if (topScorers.length > 0) {
          <mat-card class="wide-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>sports_soccer</mat-icon> Goleadores
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-list>
                @for (s of topScorers.slice(0,3); track s.playerId; let i = $index) {
                  <mat-list-item>
                    <span matListItemTitle>
                      {{ i + 1 }}. {{ s.playerName }}
                    </span>
                    <span matListItemLine>
                      {{ s.goals }} goles | {{ s.teamName }}
                    </span>
                  </mat-list-item>
                }
              </mat-list>
            </mat-card-content>
          </mat-card>
        }
      </div>
    }
  `,
  styles: [`
    .welcome { color:#1565C0; margin-bottom:24px; }
    .dashboard-grid {
      display:grid; grid-template-columns:repeat(auto-fill, minmax(220px,1fr)); gap:20px;
    }
    .stat-card {
      display:flex; align-items:center; gap:16px; padding:20px;
      cursor:pointer; transition:box-shadow 0.2s;
    }
    .stat-card:hover { box-shadow:0 4px 20px rgba(0,0,0,0.12); }
    .stat-icon { font-size:40px; width:40px; height:40px; }
    .stat-icon.tournaments { color:#FF8F00; }
    .stat-icon.matches { color:#2E7D32; }
    .stat-icon.standings { color:#1565C0; }
    .stat-icon.scorers { color:#C62828; }
    .stat-number { font-size:28px; font-weight:700; display:block; }
    .stat-label { color:#757575; font-size:14px; }
    .wide-card { grid-column: span 2; }
    .wide-card mat-card-title { display:flex; align-items:center; gap:8px; }
    .wide-card mat-card-content { padding-top:12px; }
    .wide-card button { margin-right:12px; }
    .center { display:flex; justify-content:center; padding:48px; }
    @media (max-width:600px) { .wide-card { grid-column:span 1; } }
  `]
})
export class DashboardComponent implements OnInit {
  private tournamentService = inject(TournamentService);
  private matchService = inject(MatchService);
  private standingsService = inject(StandingsService);
  private router = inject(Router);
  authService = inject(AuthService);
 
  loading = false;
  totalTournaments = 0;
  activeTournament: Tournament | null = null;
  recentMatches: Match[] = [];
  topStandings: Standing[] = [];
  topScorers: TopScorer[] = [];
 
  ngOnInit(): void {
    this.loading = true;
    this.tournamentService.getAll().subscribe(res => {
      const tournaments = res.data ?? [];
      this.totalTournaments = tournaments.length;
      this.activeTournament = tournaments.find(
        t => t.status === TournamentStatus.InProgress) ?? null;
 
      if (this.activeTournament) {
        this.loadTournamentData(this.activeTournament.id);
      }
      this.loading = false;
    });
  }
 
  loadTournamentData(tournamentId: number): void {
    this.matchService.getByTournament(tournamentId).subscribe(
      res => this.recentMatches = (res.data ?? []).slice(0, 5));
    this.standingsService.getStandings(tournamentId).subscribe(
      res => this.topStandings = res.data ?? []);
    this.standingsService.getTopScorers(tournamentId).subscribe(
      res => this.topScorers = res.data ?? []);
  }
 
  navigate(path: string): void { this.router.navigate([path]); }
}
