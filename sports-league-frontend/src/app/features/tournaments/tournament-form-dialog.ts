import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  MatDialogModule, MatFormFieldModule, MatInputModule,
  MatButtonModule, MatDatepickerModule, MatNativeDateModule
} from './../../shared/material.imports';
import { Tournament, TournamentRequest } from '../../core/models/tournament.model';
 
export interface TournamentFormData { tournament?: Tournament; }
 
@Component({
  selector: 'app-tournament-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatDatepickerModule, MatNativeDateModule
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.tournament ? 'Editar' : 'Crear' }} Torneo
    </h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre del Torneo</mat-label>
          <input matInput formControlName="name">
          @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
            <mat-error>Requerido</mat-error>
          }
        </mat-form-field>
 
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Temporada</mat-label>
          <input matInput formControlName="season" placeholder="Ej: 2025-I">
          @if (form.get('season')?.hasError('required') && form.get('season')?.touched) {
            <mat-error>Requerido</mat-error>
          }
        </mat-form-field>
 
        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Fecha Inicio</mat-label>
            <input matInput [matDatepicker]="startPicker" formControlName="startDate">
            <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Fecha Fin</mat-label>
            <input matInput [matDatepicker]="endPicker" formControlName="endDate">
            <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancelar</button>
      <button mat-raised-button color="primary"
              [disabled]="form.invalid" (click)="onSave()">
        {{ data.tournament ? 'Actualizar' : 'Crear' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-grid { display:flex; flex-direction:column; min-width:450px; }
    .row { display:flex; gap:16px; }
    .row mat-form-field { flex:1; }
    .full-width { width:100%; }
  `]
})
export class TournamentFormDialogComponent implements OnInit {
  data = inject<TournamentFormData>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<TournamentFormDialogComponent>);
  private fb = inject(FormBuilder);
 
  form = this.fb.group({
    name: ['', [Validators.required]],
    season: ['', [Validators.required]],
    startDate: ['', [Validators.required]],
    endDate: ['', [Validators.required]]
  });
 
  ngOnInit(): void {
    if (this.data.tournament) {
      const t = this.data.tournament;
      this.form.patchValue({
        name: t.name, season: t.season,
        startDate: t.startDate, endDate: t.endDate
      });
    }
  }
 
  onSave(): void {
    if (this.form.valid) this.dialogRef.close(this.form.getRawValue());
  }
}
