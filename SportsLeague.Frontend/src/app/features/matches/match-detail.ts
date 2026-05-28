import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MatCardModule, MatButtonModule, MatIconModule, MatChipsModule,
  MatProgressSpinnerModule, MatSelectModule, MatFormFieldModule,
  MatInputModule, MatListModule, MatTooltipModule, MatTabsModule
} from '../../shared/material.imports';
import { MatchService } from '../../core/services/match.service';
import { MatchEventService } from '../../core/services/match-event.service';
import { PlayerService } from '../../core/services/player.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import {
  Match, MatchStatus, Goal, Card, MatchResult,
  GoalType, CardType, GoalRequest, CardRequest, MatchResultRequest
} from '../../core/models/match.model';
import { Player } from '../../core/models/player.model';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog';
 
@Component({
  selector: 'app-match-detail',
  standalone: true,
  imports: [
    DatePipe, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatProgressSpinnerModule, MatSelectModule, MatFormFieldModule,
    MatInputModule, MatListModule, MatTooltipModule, MatTabsModule
  ],
  template: `
    @if (loading) {
      <div class="center"><mat-spinner></mat-spinner></div>
    } @else if (match) {
      <!-- Header -->
      <div class="match-header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="match-title">
          <h1>{{ match.homeTeamName }} vs {{ match.awayTeamName }}</h1>
          <p>{{ match.tournamentName }} | Jornada {{ match.matchday }} | 
             {{ match.matchDate | date:'fullDate' }}</p>
          <p>Sede: {{ match.venue }} | Árbitro: {{ match.refereeFullName }}</p>
        </div>
        <mat-chip [class]="getStatusClass(match.status)">
          {{ getStatusLabel(match.status) }}
        </mat-chip>
      </div>
 
      <!-- Resultado -->
      @if (result) {
        <mat-card class="score-card">
          <div class="score">
            <span class="team-name">{{ match.homeTeamName }}</span>
            <span class="score-number">{{ result.homeGoals }}</span>
            <span class="score-separator">-</span>
            <span class="score-number">{{ result.awayGoals }}</span>
            <span class="team-name">{{ match.awayTeamName }}</span>
          </div>
          @if (result.observations) {
            <p class="observations">{{ result.observations }}</p>
          }
        </mat-card>
      }
 
      <!-- Status Actions -->
      @if (authService.hasAnyRole(['Admin','Referee'])) {
        <div class="status-actions">
          @if (match.status === MatchStatus.Scheduled) {
            <button mat-raised-button color="primary"
                    (click)="changeStatus(MatchStatus.InProgress)">
              <mat-icon>play_arrow</mat-icon> Iniciar Partido
            </button>
          }
          @if (match.status === MatchStatus.InProgress) {
            <button mat-raised-button color="accent"
                    (click)="changeStatus(MatchStatus.Finished)">
              <mat-icon>flag</mat-icon> Finalizar Partido
            </button>
            <button mat-raised-button color="warn"
                    (click)="changeStatus(MatchStatus.Suspended)">
              <mat-icon>pause</mat-icon> Suspender
            </button>
          }
        </div>
      }
 
      <mat-tab-group>
        <!-- Tab: Eventos -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>timeline</mat-icon>&nbsp; Eventos
          </ng-template>
 
          <!-- Registrar Gol -->
          @if (canRegisterEvents()) {
            <mat-card class="event-form">
              <h3><mat-icon>sports_soccer</mat-icon> Registrar Gol</h3>
              <div class="event-row">
                <mat-form-field appearance="outline">
                  <mat-label>Jugador</mat-label>
                  <mat-select [(ngModel)]="newGoal.playerId">
                    <optgroup label="{{ match.homeTeamName }}">
                      @for (pl of homePlayers; track pl.id) {
                        <mat-option [value]="pl.id">
                          #{{ pl.number }} {{ pl.firstName }} {{ pl.lastName }}
                        </mat-option>
                      }
                    </optgroup>
                    <optgroup label="{{ match.awayTeamName }}">
                      @for (pl of awayPlayers; track pl.id) {
                        <mat-option [value]="pl.id">
                          #{{ pl.number }} {{ pl.firstName }} {{ pl.lastName }}
                        </mat-option>
                      }
                    </optgroup>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" class="minute-field">
                  <mat-label>Min</mat-label>
                  <input matInput type="number" [(ngModel)]="newGoal.minute"
                         min="1" max="120">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Tipo</mat-label>
                  <mat-select [(ngModel)]="newGoal.type">
                    <mat-option [value]="0">Normal</mat-option>
                    <mat-option [value]="1">Penal</mat-option>
                    <mat-option [value]="2">Autogol</mat-option>
                  </mat-select>
                </mat-form-field>
                <button mat-raised-button color="primary" (click)="registerGoal()">
                  <mat-icon>add</mat-icon>
                </button>
              </div>
            </mat-card>
 
            <!-- Registrar Tarjeta -->
            <mat-card class="event-form">
              <h3><mat-icon>style</mat-icon> Registrar Tarjeta</h3>
              <div class="event-row">
                <mat-form-field appearance="outline">
                  <mat-label>Jugador</mat-label>
                  <mat-select [(ngModel)]="newCard.playerId">
                    <optgroup label="{{ match.homeTeamName }}">
                      @for (pl of homePlayers; track pl.id) {
                        <mat-option [value]="pl.id">
                          #{{ pl.number }} {{ pl.firstName }} {{ pl.lastName }}
                        </mat-option>
                      }
                    </optgroup>
                    <optgroup label="{{ match.awayTeamName }}">
                      @for (pl of awayPlayers; track pl.id) {
                        <mat-option [value]="pl.id">
                          #{{ pl.number }} {{ pl.firstName }} {{ pl.lastName }}
                        </mat-option>
                      }
                    </optgroup>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" class="minute-field">
                  <mat-label>Min</mat-label>
                  <input matInput type="number" [(ngModel)]="newCard.minute"
                         min="1" max="120">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Tipo</mat-label>
                  <mat-select [(ngModel)]="newCard.type">
                    <mat-option [value]="0">🟨 Amarilla</mat-option>
                    <mat-option [value]="1">🟥 Roja</mat-option>
                  </mat-select>
                </mat-form-field>
                <button mat-raised-button color="warn" (click)="registerCard()">
                  <mat-icon>add</mat-icon>
                </button>
              </div>
            </mat-card>
          }
 
          <!-- Registrar Resultado -->
          @if (match.status === MatchStatus.Finished && !result &&
               authService.hasAnyRole(['Admin','Referee'])) {
            <mat-card class="event-form">
              <h3><mat-icon>scoreboard</mat-icon> Registrar Resultado</h3>
              <div class="event-row">
                <mat-form-field appearance="outline" class="minute-field">
                  <mat-label>{{ match.homeTeamName }}</mat-label>
                  <input matInput type="number" [(ngModel)]="newResult.homeGoals" min="0">
                </mat-form-field>
                <span class="score-separator">-</span>
                <mat-form-field appearance="outline" class="minute-field">
                  <mat-label>{{ match.awayTeamName }}</mat-label>
                  <input matInput type="number" [(ngModel)]="newResult.awayGoals" min="0">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Observaciones</mat-label>
                  <input matInput [(ngModel)]="newResult.observations">
                </mat-form-field>
                <button mat-raised-button color="primary" (click)="registerResult()">
                  Registrar
                </button>
              </div>
            </mat-card>
          }
 
          <!-- Timeline -->
          <div class="timeline">
            @for (event of timeline; track event.id) {
              <div class="timeline-item" [class]="event.cssClass">
                <span class="minute">{{ event.minute }}'</span>
                <mat-icon>{{ event.icon }}</mat-icon>
                <span>{{ event.description }}</span>
                @if (canRegisterEvents() && authService.isAdmin()) {
                  <button mat-icon-button class="delete-btn"
                          (click)="deleteEvent(event)">
                    <mat-icon>close</mat-icon>
                  </button>
                }
              </div>
            }
            @if (timeline.length === 0) {
              <p class="empty">No hay eventos registrados.</p>
            }
          </div>
        </mat-tab>
 
        <!-- Tab: Info -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>info</mat-icon>&nbsp; Info
          </ng-template>
          <div class="info-section">
            <p><strong>Torneo:</strong> {{ match.tournamentName }}</p>
            <p><strong>Jornada:</strong> {{ match.matchday }}</p>
            <p><strong>Fecha:</strong> {{ match.matchDate | date:'fullDate' }}</p>
            <p><strong>Sede:</strong> {{ match.venue }}</p>
            <p><strong>Árbitro:</strong> {{ match.refereeFullName }}</p>
          </div>
        </mat-tab>
      </mat-tab-group>
    }
  `,
  styles: [`
    .match-header { display:flex; align-items:flex-start; gap:16px; margin-bottom:20px; }
    .match-title h1 { margin:0; color:#1565C0; }
    .match-title p { margin:4px 0; color:#757575; font-size:14px; }
    .score-card { margin-bottom:20px; }
    .score { display:flex; align-items:center; justify-content:center; gap:16px; padding:16px; }
    .team-name { font-size:18px; font-weight:500; min-width:120px; text-align:center; }
    .score-number { font-size:48px; font-weight:700; color:#1565C0; }
    .score-separator { font-size:32px; color:#9e9e9e; }
    .observations { text-align:center; color:#757575; }
    .status-actions { display:flex; gap:12px; margin-bottom:20px; }
    .event-form { margin:16px 0; padding:16px; }
    .event-form h3 { display:flex; align-items:center; gap:8px; margin:0 0 12px; }
    .event-row { display:flex; gap:12px; align-items:center; flex-wrap:wrap; }
    .event-row mat-form-field { flex:1; min-width:140px; }
    .minute-field { max-width:80px !important; flex:0 !important; }
    .timeline { padding:16px 0; }
    .timeline-item {
      display:flex; align-items:center; gap:12px; padding:10px 16px;
      border-left:3px solid #e0e0e0; margin-left:20px; position:relative;
    }
    .timeline-item .minute {
      font-weight:700; min-width:36px; color:#1565C0;
    }
    .timeline-item.goal { border-left-color:#2E7D32; }
    .timeline-item.goal mat-icon { color:#2E7D32; }
    .timeline-item.yellow-card { border-left-color:#F9A825; }
    .timeline-item.yellow-card mat-icon { color:#F9A825; }
    .timeline-item.red-card { border-left-color:#C62828; }
    .timeline-item.red-card mat-icon { color:#C62828; }
    .delete-btn { margin-left:auto; }
    .center { display:flex; justify-content:center; padding:48px; }
    .empty { color:#757575; padding:16px 0; }
    .info-section { padding:16px 0; }
    .status-scheduled { background:#FFF8E1 !important; color:#F57F17 !important; }
    .status-inprogress { background:#E8F5E9 !important; color:#2E7D32 !important; }
    .status-finished { background:#E3F2FD !important; color:#1565C0 !important; }
    .status-suspended { background:#FFEBEE !important; color:#C62828 !important; }
  `]
})
export class MatchDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private matchService = inject(MatchService);
  private eventService = inject(MatchEventService);
  private playerService = inject(PlayerService);
  private dialog = inject(MatDialog);
  private notification = inject(NotificationService);
  authService = inject(AuthService);
 
  match: Match | null = null;
  result: MatchResult | null = null;
  goals: Goal[] = [];
  cards: Card[] = [];
  homePlayers: Player[] = [];
  awayPlayers: Player[] = [];
  loading = false;
  MatchStatus = MatchStatus;
 
  newGoal: GoalRequest = { playerId: 0, minute: 1, type: 0 };
  newCard: CardRequest = { playerId: 0, minute: 1, type: 0 };
  newResult: MatchResultRequest = { homeGoals: 0, awayGoals: 0, observations: null };
 
  timeline: {id:number; minute:number; icon:string;
             description:string; cssClass:string; eventType:string}[] = [];
 
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadMatch(id);
  }
 
  loadMatch(id: number): void {
    this.loading = true;
    this.matchService.getById(id).subscribe({
      next: res => {
        this.match = res.data;
        this.loading = false;
        this.loadPlayers();
        this.loadEvents();
        this.loadResult();
      },
      error: () => { this.loading = false; this.router.navigate(['/matches']); }
    });
  }
 
  loadPlayers(): void {
    if (!this.match) return;
    this.playerService.getFiltered({ teamId: this.match.homeTeamId, pageSize: 50 })
      .subscribe(res => this.homePlayers = res.data?.items ?? []);
    this.playerService.getFiltered({ teamId: this.match.awayTeamId, pageSize: 50 })
      .subscribe(res => this.awayPlayers = res.data?.items ?? []);
  }
 
  loadEvents(): void {
    if (!this.match) return;
    this.eventService.getGoals(this.match.id).subscribe(
      res => { this.goals = res.data ?? []; this.buildTimeline(); });
    this.eventService.getCards(this.match.id).subscribe(
      res => { this.cards = res.data ?? []; this.buildTimeline(); });
  }
 
  loadResult(): void {
    if (!this.match) return;
    this.eventService.getResult(this.match.id).subscribe({
      next: res => { this.result = res.data; },
      error: () => { this.result = null; }
    });
  }
 
  buildTimeline(): void {
    const goalTypeLabels: Record<number,string> = {0:'Gol',1:'Gol (penal)',2:'Autogol'};
    const events = [
      ...this.goals.map(g => ({
        id: g.id, minute: g.minute, icon: 'sports_soccer',
        description: `${goalTypeLabels[g.type]} - ${g.playerName}`,
        cssClass: 'goal', eventType: 'goal'
      })),
      ...this.cards.map(c => ({
        id: c.id, minute: c.minute,
        icon: 'style',
        description: `${c.type===0?'Amarilla':'Roja'} - ${c.playerName}`,
        cssClass: c.type===0 ? 'yellow-card' : 'red-card',
        eventType: 'card'
      }))
    ];
    this.timeline = events.sort((a,b) => a.minute - b.minute);
  }
 
  canRegisterEvents(): boolean {
    return !!this.match &&
      (this.match.status === MatchStatus.InProgress ||
       this.match.status === MatchStatus.Finished) &&
      this.authService.hasAnyRole(['Admin','Referee']);
  }
 
  registerGoal(): void {
    if (!this.match || !this.newGoal.playerId) return;
    this.eventService.registerGoal(this.match.id, this.newGoal).subscribe({
      next: () => {
        this.notification.success('Gol registrado');
        this.newGoal = { playerId:0, minute:1, type:0 };
        this.loadEvents();
      }
    });
  }
 
  registerCard(): void {
    if (!this.match || !this.newCard.playerId) return;
    this.eventService.registerCard(this.match.id, this.newCard).subscribe({
      next: () => {
        this.notification.success('Tarjeta registrada');
        this.newCard = { playerId:0, minute:1, type:0 };
        this.loadEvents();
      }
    });
  }
 
  registerResult(): void {
    if (!this.match) return;
    this.eventService.registerResult(this.match.id, this.newResult).subscribe({
      next: () => {
        this.notification.success('Resultado registrado');
        this.loadResult();
      }
    });
  }
 
  deleteEvent(event: {id:number; eventType:string}): void {
    if (!this.match) return;
    const obs = event.eventType === 'goal'
      ? this.eventService.deleteGoal(this.match.id, event.id)
      : this.eventService.deleteCard(this.match.id, event.id);
    obs.subscribe({ next: () => {
      this.notification.success('Evento eliminado');
      this.loadEvents();
    }});
  }
 
  changeStatus(newStatus: MatchStatus): void {
    if (!this.match) return;
    const labels:Record<number,string> = {1:'iniciar',2:'finalizar',3:'suspender'};
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: `${labels[newStatus]} partido`,
              message: `¿Confirmas ${labels[newStatus]} este partido?`,
              confirmText: labels[newStatus] }
    });
    ref.afterClosed().subscribe(ok => {
      if(ok) this.matchService.updateStatus(this.match!.id, newStatus).subscribe({
        next: () => {
          this.notification.success('Estado actualizado');
          this.loadMatch(this.match!.id);
        }
      });
    });
  }
 
  getStatusLabel(s:MatchStatus):string{return{0:'Programado',1:'En Curso',2:'Finalizado',3:'Suspendido'}[s]??'';}
  getStatusClass(s:MatchStatus):string{return{0:'status-scheduled',1:'status-inprogress',2:'status-finished',3:'status-suspended'}[s]??'';}
  goBack():void{this.router.navigate(['/matches']);}
}


