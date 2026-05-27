import { Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  MatTableModule, MatButtonModule, MatIconModule,
  MatTooltipModule, MatProgressSpinnerModule
} from '../../shared/material.imports';
import { RefereeService } from '../../core/services/referee.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Referee } from '../../core/models/referee.model';
import { RefereeFormDialogComponent } from './referee-form-dialog';
import {
  ConfirmDialogComponent, ConfirmDialogData
} from '../../shared/components/confirm-dialog';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
 
@Component({
  selector: 'app-referee-list',
  standalone: true,
  imports: [
    MatTableModule, MatButtonModule, MatIconModule,
    MatTooltipModule, MatProgressSpinnerModule,
    PageHeaderComponent
  ],
  template: `
    <app-page-header
      title="Árbitros"
      subtitle="Gestión de árbitros de la liga"
      [showAddButton]="authService.isAdmin()"
      addButtonText="Nuevo Árbitro"
      (add)="openForm()"
    />
 
    @if (loading) {
      <div class="center"><mat-spinner></mat-spinner></div>
    } @else {
      <table mat-table [dataSource]="referees"
             class="mat-elevation-z2 full-width">
 
        <ng-container matColumnDef="fullName">
          <th mat-header-cell *matHeaderCellDef>Nombre Completo</th>
          <td mat-cell *matCellDef="let r">
            {{ r.firstName }} {{ r.lastName }}
          </td>
        </ng-container>
 
        <ng-container matColumnDef="nationality">
          <th mat-header-cell *matHeaderCellDef>Nacionalidad</th>
          <td mat-cell *matCellDef="let r">{{ r.nationality }}</td>
        </ng-container>
 
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Acciones</th>
          <td mat-cell *matCellDef="let r">
            @if (authService.isAdmin()) {
              <button mat-icon-button color="primary"
                      matTooltip="Editar" (click)="openForm(r)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn"
                      matTooltip="Eliminar" (click)="confirmDelete(r)">
                <mat-icon>delete</mat-icon>
              </button>
            }
          </td>
        </ng-container>
 
        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
 
      @if (referees.length === 0) {
        <p class="empty">No hay árbitros registrados.</p>
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
export class RefereeListComponent implements OnInit {
  private refereeService = inject(RefereeService);
  private dialog = inject(MatDialog);
  private notification = inject(NotificationService);
  authService = inject(AuthService);
 
  referees: Referee[] = [];
  loading = false;
  displayedColumns = ['fullName', 'nationality', 'actions'];
 
  ngOnInit(): void {
    this.loadReferees();
  }
 
  loadReferees(): void {
    this.loading = true;
    this.refereeService.getAll().subscribe({
      next: (res) => {
        this.referees = res.data ?? [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }
 
  openForm(referee?: Referee): void {
    const dialogRef = this.dialog.open(RefereeFormDialogComponent, {
      data: { referee },
      width: '500px'
    });
 
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
 
      if (referee) {
        this.refereeService.update(referee.id, result).subscribe({
          next: () => {
            this.notification.success('Árbitro actualizado');
            this.loadReferees();
          }
        });
      } else {
        this.refereeService.create(result).subscribe({
          next: () => {
            this.notification.success('Árbitro creado');
            this.loadReferees();
          }
        });
      }
    });
  }
 
  confirmDelete(referee: Referee): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar árbitro',
        message: `¿Estás seguro de eliminar a "${referee.firstName} ${referee.lastName}"?`
      } as ConfirmDialogData
    });
 
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.refereeService.delete(referee.id).subscribe({
          next: () => {
            this.notification.success('Árbitro eliminado');
            this.loadReferees();
          }
        });
      }
    });
  }
}
