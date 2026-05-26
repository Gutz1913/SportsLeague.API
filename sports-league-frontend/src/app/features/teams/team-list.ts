import { Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  MatTableModule, MatButtonModule, MatIconModule,
  MatTooltipModule, MatProgressSpinnerModule
} from '../../shared/material.imports';
import { TeamService } from '../../core/services/team.service';
//import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Team } from '../../core/models/team.model';
import { TeamFormDialogComponent } from './team-form-dialog';
import {
  ConfirmDialogComponent, ConfirmDialogData
} from '../../shared/components/confirm-dialog';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
 
@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [
    MatTableModule, MatButtonModule, MatIconModule,
    MatTooltipModule, MatProgressSpinnerModule,
    PageHeaderComponent
  ],
  template: `
    <app-page-header
      title="Equipos"
      subtitle="Gestión de equipos de la liga"
      [showAddButton]="authService.hasAnyRole(['Admin', 'Referee'])"
      addButtonText="Nuevo Equipo"
      (add)="openForm()"
    />
 
    @if (loading) {
      <div class="center"><mat-spinner></mat-spinner></div>
    } @else {
      <table mat-table [dataSource]="teams" class="mat-elevation-z2 full-width">
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Nombre</th>
          <td mat-cell *matCellDef="let t">{{ t.name }}</td>
        </ng-container>
 
        <ng-container matColumnDef="city">
          <th mat-header-cell *matHeaderCellDef>Ciudad</th>
          <td mat-cell *matCellDef="let t">{{ t.city }}</td>
        </ng-container>
 
        <ng-container matColumnDef="stadium">
          <th mat-header-cell *matHeaderCellDef>Estadio</th>
          <td mat-cell *matCellDef="let t">{{ t.stadium }}</td>
        </ng-container>
 
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Acciones</th>
          <td mat-cell *matCellDef="let t">
            @if (authService.hasAnyRole(['Admin', 'Referee'])) {
              <button mat-icon-button color="primary"
                      matTooltip="Editar" (click)="openForm(t)">
                <mat-icon>edit</mat-icon>
              </button>
            }
            @if (authService.isAdmin()) {
              <button mat-icon-button color="warn"
                      matTooltip="Eliminar" (click)="confirmDelete(t)">
                <mat-icon>delete</mat-icon>
              </button>
            }
          </td>
        </ng-container>
 
        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
 
      @if (teams.length === 0) {
        <p class="empty">No hay equipos registrados.</p>
      }
    }
  `,
  styles: [`
    .full-width { width: 100%; }
    .center { display: flex; justify-content: center; padding: 48px; }
    .empty { text-align: center; color: #757575; padding: 32px; }
    table { border-radius: 8px; overflow: hidden; }
  `]
})
export class TeamListComponent implements OnInit {
  private teamService = inject(TeamService);
  private dialog = inject(MatDialog);
  private notification = inject(NotificationService);
  //authService = inject(AuthService);
 
  teams: Team[] = [];
  loading = false;
  displayedColumns = ['name', 'city', 'stadium', 'actions'];
 
  ngOnInit(): void { this.loadTeams(); }
 
  loadTeams(): void {
    this.loading = true;
    this.teamService.getAll().subscribe({
      next: (res) => { this.teams = res.data ?? []; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
 
  openForm(team?: Team): void {
    const dialogRef = this.dialog.open(TeamFormDialogComponent, {
      data: { team },
      width: '500px'
    });
 
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      if (team) {
        this.teamService.update(team.id, result).subscribe({
          next: () => {
            this.notification.success('Equipo actualizado');
            this.loadTeams();
          }
        });
      } else {
        this.teamService.create(result).subscribe({
          next: () => {
            this.notification.success('Equipo creado');
            this.loadTeams();
          }
        });
      }
    });
  }
 
  confirmDelete(team: Team): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar equipo',
        message: `¿Estás seguro de eliminar "${team.name}"?`
      } as ConfirmDialogData
    });
 
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.teamService.delete(team.id).subscribe({
          next: () => {
            this.notification.success('Equipo eliminado');
            this.loadTeams();
          }
        });
      }
    });
  }
}
