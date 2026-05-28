import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MatTabsModule, MatTableModule, MatSelectModule, MatFormFieldModule,
  MatIconModule, MatProgressSpinnerModule, MatChipsModule, MatCardModule
} from '../../shared/material.imports';
import { StandingsService } from '../../core/services/standings.service';
import { TournamentService } from '../../core/services/tournament.service';
import { Standing, TopScorer, CardStats } from '../../core/models/standings.model';
import { Tournament } from '../../core/models/tournament.model';
import { PageHeaderComponent } from '../../shared/components/page-header';
 
@Component({
  selector: 'app-standings-page',
  standalone: true,
  imports: [
    FormsModule, MatTabsModule, MatTableModule, MatSelectModule,
    MatFormFieldModule, MatIconModule, MatProgressSpinnerModule,
    MatChipsModule, MatCardModule, PageHeaderComponent
  ],
  template: `
    <app-page-header title="Tabla de Posiciones y Estadísticas" />
 
    <mat-form-field appearance="outline" class="tournament-select">
      <mat-label>Seleccionar Torneo</mat-label>
      <mat-select [(ngModel)]="selectedTournamentId"
                  (selectionChange)="loadAll()">
        @for (t of tournaments; track t.id) {
          <mat-option [value]="t.id">{{ t.name }} ({{ t.season }})</mat-option>
        }
      </mat-select>
    </mat-form-field>
 
    @if (selectedTournamentId) {
      <mat-tab-group animationDuration="200ms">
 
        <!-- Tab: Posiciones -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>leaderboard</mat-icon>&nbsp; Posiciones
          </ng-template>
 
          @if (loadingStandings) {
            <div class="center"><mat-spinner></mat-spinner></div>
          } @else {
            <table mat-table [dataSource]="standings"
                   class="mat-elevation-z2 standings-table">
 
              <ng-container matColumnDef="position">
                <th mat-header-cell *matHeaderCellDef>#</th>
                <td mat-cell *matCellDef="let s"
                    [class]="getPositionClass(s.position, standings.length)">
                  {{ s.position }}
                </td>
              </ng-container>
 
              <ng-container matColumnDef="teamName">
                <th mat-header-cell *matHeaderCellDef>Equipo</th>
                <td mat-cell *matCellDef="let s">
                  <strong>{{ s.teamName }}</strong>
                </td>
              </ng-container>
 
              <ng-container matColumnDef="matchesPlayed">
                <th mat-header-cell *matHeaderCellDef>PJ</th>
                <td mat-cell *matCellDef="let s">{{ s.matchesPlayed }}</td>
              </ng-container>
 
              <ng-container matColumnDef="wins">
                <th mat-header-cell *matHeaderCellDef>PG</th>
                <td mat-cell *matCellDef="let s">{{ s.wins }}</td>
              </ng-container>
 
              <ng-container matColumnDef="draws">
                <th mat-header-cell *matHeaderCellDef>PE</th>
                <td mat-cell *matCellDef="let s">{{ s.draws }}</td>
              </ng-container>
 
              <ng-container matColumnDef="losses">
                <th mat-header-cell *matHeaderCellDef>PP</th>
                <td mat-cell *matCellDef="let s">{{ s.losses }}</td>
              </ng-container>
 
              <ng-container matColumnDef="goalsFor">
                <th mat-header-cell *matHeaderCellDef>GF</th>
                <td mat-cell *matCellDef="let s">{{ s.goalsFor }}</td>
              </ng-container>
 
              <ng-container matColumnDef="goalsAgainst">
                <th mat-header-cell *matHeaderCellDef>GC</th>
                <td mat-cell *matCellDef="let s">{{ s.goalsAgainst }}</td>
              </ng-container>
 
              <ng-container matColumnDef="goalDifference">
                <th mat-header-cell *matHeaderCellDef>DG</th>
                <td mat-cell *matCellDef="let s"
                    [style.color]="s.goalDifference > 0 ? '#2E7D32' :
                                   s.goalDifference < 0 ? '#C62828' : '#757575'">
                  {{ s.goalDifference > 0 ? '+' : '' }}{{ s.goalDifference }}
                </td>
              </ng-container>
 
              <ng-container matColumnDef="points">
                <th mat-header-cell *matHeaderCellDef>Pts</th>
                <td mat-cell *matCellDef="let s" class="points-cell">
                  <strong>{{ s.points }}</strong>
                </td>
              </ng-container>
 
              <tr mat-header-row *matHeaderRowDef="standingsColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: standingsColumns;"></tr>
            </table>
 
            @if (standings.length === 0) {
              <p class="empty">No hay datos de posiciones aún. Se requieren partidos finalizados con resultado.</p>
            }
          }
        </mat-tab>
 
        <!-- Tab: Goleadores -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>sports_soccer</mat-icon>&nbsp; Goleadores
          </ng-template>
 
          @if (loadingScorers) {
            <div class="center"><mat-spinner></mat-spinner></div>
          } @else {
            <table mat-table [dataSource]="scorers"
                   class="mat-elevation-z2 full-width">
 
              <ng-container matColumnDef="rank">
                <th mat-header-cell *matHeaderCellDef>#</th>
                <td mat-cell *matCellDef="let s; let i = index">
                  @if (i === 0) { <mat-icon class="gold">emoji_events</mat-icon> }
                  @else if (i === 1) { <mat-icon class="silver">emoji_events</mat-icon> }
                  @else if (i === 2) { <mat-icon class="bronze">emoji_events</mat-icon> }
                  @else { {{ i + 1 }} }
                </td>
              </ng-container>
 
              <ng-container matColumnDef="playerName">
                <th mat-header-cell *matHeaderCellDef>Jugador</th>
                <td mat-cell *matCellDef="let s">
                  <strong>{{ s.playerName }}</strong>
                </td>
              </ng-container>
 
              <ng-container matColumnDef="teamName">
                <th mat-header-cell *matHeaderCellDef>Equipo</th>
                <td mat-cell *matCellDef="let s">{{ s.teamName }}</td>
              </ng-container>
 
              <ng-container matColumnDef="goals">
                <th mat-header-cell *matHeaderCellDef>Goles</th>
                <td mat-cell *matCellDef="let s" class="points-cell">
                  <strong>{{ s.goals }}</strong>
                </td>
              </ng-container>
 
              <ng-container matColumnDef="penalties">
                <th mat-header-cell *matHeaderCellDef>Penales</th>
                <td mat-cell *matCellDef="let s">{{ s.penalties }}</td>
              </ng-container>
 
              <ng-container matColumnDef="matchesWithGoals">
                <th mat-header-cell *matHeaderCellDef>PJ con gol</th>
                <td mat-cell *matCellDef="let s">{{ s.matchesWithGoals }}</td>
              </ng-container>
 
              <tr mat-header-row *matHeaderRowDef="scorerColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: scorerColumns;"></tr>
            </table>
 
            @if (scorers.length === 0) {
              <p class="empty">No hay goles registrados aún.</p>
            }
          }
        </mat-tab>
 
        <!-- Tab: Tarjetas -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>style</mat-icon>&nbsp; Tarjetas
          </ng-template>
 
          @if (loadingCards) {
            <div class="center"><mat-spinner></mat-spinner></div>
          } @else {
            <table mat-table [dataSource]="cardStats"
                   class="mat-elevation-z2 full-width">
 
              <ng-container matColumnDef="rank">
                <th mat-header-cell *matHeaderCellDef>#</th>
                <td mat-cell *matCellDef="let c; let i = index">{{ i + 1 }}</td>
              </ng-container>
 
              <ng-container matColumnDef="playerName">
                <th mat-header-cell *matHeaderCellDef>Jugador</th>
                <td mat-cell *matCellDef="let c">
                  <strong>{{ c.playerName }}</strong>
                </td>
              </ng-container>
 
              <ng-container matColumnDef="teamName">
                <th mat-header-cell *matHeaderCellDef>Equipo</th>
                <td mat-cell *matCellDef="let c">{{ c.teamName }}</td>
              </ng-container>
 
              <ng-container matColumnDef="yellowCards">
                <th mat-header-cell *matHeaderCellDef>🟨</th>
                <td mat-cell *matCellDef="let c">{{ c.yellowCards }}</td>
              </ng-container>
 
              <ng-container matColumnDef="redCards">
                <th mat-header-cell *matHeaderCellDef>🟥</th>
                <td mat-cell *matCellDef="let c">{{ c.redCards }}</td>
              </ng-container>
 
              <ng-container matColumnDef="totalCards">
                <th mat-header-cell *matHeaderCellDef>Total</th>
                <td mat-cell *matCellDef="let c" class="points-cell">
                  <strong>{{ c.totalCards }}</strong>
                </td>
              </ng-container>
 
              <tr mat-header-row *matHeaderRowDef="cardColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: cardColumns;"></tr>
            </table>
 
            @if (cardStats.length === 0) {
              <p class="empty">No hay tarjetas registradas aún.</p>
            }
          }
        </mat-tab>
      </mat-tab-group>
    } @else {
      <p class="empty">Selecciona un torneo para ver las estadísticas.</p>
    }
  `,
  styles: [`
    .tournament-select { min-width:320px; margin-bottom:16px; }
    .standings-table { width:100%; }
    .full-width { width:100%; }
    .center { display:flex; justify-content:center; padding:48px; }
    .empty { text-align:center; color:#757575; padding:32px; }
    .pos-top { background:#E8F5E9 !important; font-weight:700; color:#2E7D32; }
    .pos-bottom { background:#FFEBEE !important; color:#C62828; }
    .points-cell { font-size:16px !important; }
    .gold { color:#FFD600; }
    .silver { color:#90A4AE; }
    .bronze { color:#8D6E63; }
  `]
})
export class StandingsPageComponent implements OnInit {
  private standingsService = inject(StandingsService);
  private tournamentService = inject(TournamentService);
 
  tournaments: Tournament[] = [];
  selectedTournamentId: number | null = null;
 
  standings: Standing[] = [];
  scorers: TopScorer[] = [];
  cardStats: CardStats[] = [];
 
  loadingStandings = false;
  loadingScorers = false;
  loadingCards = false;
 
  standingsColumns = [
    'position','teamName','matchesPlayed','wins','draws','losses',
    'goalsFor','goalsAgainst','goalDifference','points'
  ];
  scorerColumns = ['rank','playerName','teamName','goals','penalties','matchesWithGoals'];
  cardColumns = ['rank','playerName','teamName','yellowCards','redCards','totalCards'];
 
  ngOnInit(): void {
    this.tournamentService.getAll().subscribe(res => {
      this.tournaments = res.data ?? [];
      const active = this.tournaments.find(t => t.status === 1)
        || this.tournaments[0];
      if (active) {
        this.selectedTournamentId = active.id;
        this.loadAll();
      }
    });
  }
 
  loadAll(): void {
    if (!this.selectedTournamentId) return;
    this.loadStandings();
    this.loadScorers();
    this.loadCardStats();
  }
 
  loadStandings(): void {
    this.loadingStandings = true;
    this.standingsService.getStandings(this.selectedTournamentId!).subscribe({
      next: res => { this.standings = res.data ?? []; this.loadingStandings = false; },
      error: () => { this.loadingStandings = false; }
    });
  }
 
  loadScorers(): void {
    this.loadingScorers = true;
    this.standingsService.getTopScorers(this.selectedTournamentId!).subscribe({
      next: res => { this.scorers = res.data ?? []; this.loadingScorers = false; },
      error: () => { this.loadingScorers = false; }
    });
  }
 
  loadCardStats(): void {
    this.loadingCards = true;
    this.standingsService.getCardStats(this.selectedTournamentId!).subscribe({
      next: res => { this.cardStats = res.data ?? []; this.loadingCards = false; },
      error: () => { this.loadingCards = false; }
    });
  }
 
  getPositionClass(position: number, total: number): string {
    if (position <= 2) return 'pos-top';
    if (position >= total - 1 && total > 4) return 'pos-bottom';
    return '';
  }
}

