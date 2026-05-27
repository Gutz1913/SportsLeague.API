import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import {
  MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule,
  MatFormFieldModule, MatInputModule, MatSelectModule, MatTooltipModule,
  MatProgressSpinnerModule, MatChipsModule
} from '../../shared/material.imports';
import { FormsModule } from '@angular/forms';
import { PlayerService } from '../../core/services/player.service';
import { TeamService } from '../../core/services/team.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Player, PlayerPosition } from '../../core/models/player.model';
import { Team } from '../../core/models/team.model';
import { PlayerFormDialogComponent } from './player-form-dialog';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
 
@Component({
  selector: 'app-player-list',
  standalone: true,
  imports: [
    FormsModule, MatTableModule, MatPaginatorModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatTooltipModule, MatProgressSpinnerModule, MatChipsModule,
    PageHeaderComponent
  ],
  template: `
    <app-page-header title="Jugadores"
      [showAddButton]="authService.hasAnyRole(['Admin','Referee'])"
      addButtonText="Nuevo Jugador" (add)="openForm()" />
 
    <div class="filters">
      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>Buscar</mat-label>
        <input matInput [(ngModel)]="search" (keyup.enter)="applyFilters()"
               placeholder="Nombre o apellido">
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>
 
      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>Equipo</mat-label>
        <mat-select [(ngModel)]="selectedTeamId" (selectionChange)="applyFilters()">
          <mat-option [value]="null">Todos</mat-option>
          @for (team of teams; track team.id) {
            <mat-option [value]="team.id">{{ team.name }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
 
      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>Posición</mat-label>
        <mat-select [(ngModel)]="selectedPosition" (selectionChange)="applyFilters()">
          <mat-option [value]="null">Todas</mat-option>
          @for (pos of positions; track pos.value) {
            <mat-option [value]="pos.value">{{ pos.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </div>
 
    @if (loading) {
      <div class="center"><mat-spinner></mat-spinner></div>
    } @else {
      <table mat-table [dataSource]="players" class="mat-elevation-z2 full-width">
        <ng-container matColumnDef="fullName">
          <th mat-header-cell *matHeaderCellDef>Nombre</th>
          <td mat-cell *matCellDef="let p">{{ p.firstName }} {{ p.lastName }}</td>
        </ng-container>
        <ng-container matColumnDef="number">
          <th mat-header-cell *matHeaderCellDef>#</th>
          <td mat-cell *matCellDef="let p">{{ p.number }}</td>
        </ng-container>
        <ng-container matColumnDef="position">
          <th mat-header-cell *matHeaderCellDef>Posición</th>
          <td mat-cell *matCellDef="let p">
            <mat-chip>{{ getPositionLabel(p.position) }}</mat-chip>
          </td>
        </ng-container>
        <ng-container matColumnDef="teamName">
          <th mat-header-cell *matHeaderCellDef>Equipo</th>
          <td mat-cell *matCellDef="let p">{{ p.teamName }}</td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Acciones</th>
          <td mat-cell *matCellDef="let p">
            @if (authService.hasAnyRole(['Admin','Referee'])) {
              <button mat-icon-button color="primary"
                      matTooltip="Editar" (click)="openForm(p)">
                <mat-icon>edit</mat-icon>
              </button>
            }
            @if (authService.isAdmin()) {
              <button mat-icon-button color="warn"
                      matTooltip="Eliminar" (click)="confirmDelete(p)">
                <mat-icon>delete</mat-icon>
              </button>
            }
          </td>
        </ng-container>
 
        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
 
      <mat-paginator [length]="totalCount" [pageSize]="pageSize"
                     [pageSizeOptions]="[5, 10, 25]"
                     (page)="onPageChange($event)"
                     showFirstLastButtons>
      </mat-paginator>
    }
  `,
  styles: [`
    .filters { display:flex; gap:16px; flex-wrap:wrap; margin-bottom:16px; }
    .filter-field { min-width:180px; }
    .full-width { width:100%; }
    .center { display:flex; justify-content:center; padding:48px; }
  `]
})
export class PlayerListComponent implements OnInit {
  private playerService = inject(PlayerService);
  private teamService = inject(TeamService);
  private dialog = inject(MatDialog);
  private notification = inject(NotificationService);
  authService = inject(AuthService);
 
  players: Player[] = [];
  teams: Team[] = [];
  loading = false;
  totalCount = 0;
  pageSize = 10;
  currentPage = 1;
  search = '';
  selectedTeamId: number | null = null;
  selectedPosition: number | null = null;
  displayedColumns = ['fullName', 'number', 'position', 'teamName', 'actions'];
 
  positions = [
    { value: PlayerPosition.Goalkeeper, label: 'Portero' },
    { value: PlayerPosition.Defender, label: 'Defensa' },
    { value: PlayerPosition.Midfielder, label: 'Mediocampista' },
    { value: PlayerPosition.Forward, label: 'Delantero' },
  ];
 
  ngOnInit(): void {
    this.teamService.getAll().subscribe(res => this.teams = res.data ?? []);
    this.loadPlayers();
  }
 
  loadPlayers(): void {
    this.loading = true;
    this.playerService.getFiltered({
      teamId: this.selectedTeamId ?? undefined,
      position: this.selectedPosition ?? undefined,
      search: this.search || undefined,
      page: this.currentPage,
      pageSize: this.pageSize
    }).subscribe({
      next: (res) => {
        this.players = res.data?.items ?? [];
        this.totalCount = res.data?.totalCount ?? 0;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }
 
  applyFilters(): void { this.currentPage = 1; this.loadPlayers(); }
 
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadPlayers();
  }
 
  getPositionLabel(pos: PlayerPosition): string {
    return this.positions.find(p => p.value === pos)?.label ?? '';
  }
 
  openForm(player?: Player): void {
    const dialogRef = this.dialog.open(PlayerFormDialogComponent, {
      data: { player, teams: this.teams }, width: '560px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      const obs = player
        ? this.playerService.update(player.id, result)
        : this.playerService.create(result);
      obs.subscribe({
        next: () => {
          this.notification.success(player ? 'Jugador actualizado' : 'Jugador creado');
          this.loadPlayers();
        }
      });
    });
  }
 
  confirmDelete(player: Player): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Eliminar jugador',
              message: `¿Eliminar a ${player.firstName} ${player.lastName}?` }
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.playerService.delete(player.id).subscribe({
        next: () => { this.notification.success('Jugador eliminado'); this.loadPlayers(); }
      });
    });
  }
}
