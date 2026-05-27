import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  MatDialogModule, MatFormFieldModule, MatInputModule,
  MatButtonModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule
} from './../../shared/material.imports';
import { Player, PlayerRequest, PlayerPosition } from '../../core/models/player.model';
import { Team } from '../../core/models/team.model';
 
export interface PlayerFormData { player?: Player; teams: Team[]; }
 
@Component({
  selector: 'app-player-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.player ? 'Editar' : 'Crear' }} Jugador</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Nombre</mat-label>
            <input matInput formControlName="firstName">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Apellido</mat-label>
            <input matInput formControlName="lastName">
          </mat-form-field>
        </div>
 
        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Número</mat-label>
            <input matInput type="number" formControlName="number">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Posición</mat-label>
            <mat-select formControlName="position">
              @for (pos of positions; track pos.value) {
                <mat-option [value]="pos.value">{{ pos.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
 
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Equipo</mat-label>
          <mat-select formControlName="teamId">
            @for (team of data.teams; track team.id) {
              <mat-option [value]="team.id">{{ team.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
 
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Fecha de nacimiento</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="birthDate">
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancelar</button>
      <button mat-raised-button color="primary"
              [disabled]="form.invalid" (click)="onSave()">
        {{ data.player ? 'Actualizar' : 'Crear' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-grid { display:flex; flex-direction:column; min-width:480px; }
    .row { display:flex; gap:16px; }
    .row mat-form-field { flex:1; }
    .full-width { width:100%; }
  `]
})
export class PlayerFormDialogComponent implements OnInit {
  data = inject<PlayerFormData>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<PlayerFormDialogComponent>);
  private fb = inject(FormBuilder);
 
  positions = [
    { value: PlayerPosition.Goalkeeper, label: 'Portero' },
    { value: PlayerPosition.Defender, label: 'Defensa' },
    { value: PlayerPosition.Midfielder, label: 'Mediocampista' },
    { value: PlayerPosition.Forward, label: 'Delantero' },
  ];
 
  form = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    number: [null as number | null, [Validators.required, Validators.min(1)]],
    position: [null as number | null, [Validators.required]],
    teamId: [null as number | null, [Validators.required]],
    birthDate: ['', [Validators.required]]
  });
 
  ngOnInit(): void {
    if (this.data.player) {
      const pl = this.data.player;
      this.form.patchValue({
        firstName: pl.firstName, lastName: pl.lastName,
        number: pl.number, position: pl.position,
        teamId: pl.teamId, birthDate: pl.birthDate
      });
    }
  }
 
  onSave(): void {
    if (this.form.valid) this.dialogRef.close(this.form.getRawValue());
  }
}
