import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  MatDialogModule, MatFormFieldModule, MatInputModule,
  MatButtonModule, MatDatepickerModule, MatNativeDateModule
} from '../../shared/material.imports';
import { Team, TeamRequest } from '../../core/models/team.model';
 
export interface TeamFormData {
  team?: Team;  // null = crear, con datos = editar
}
 
@Component({
  selector: 'app-team-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatDatepickerModule, MatNativeDateModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.team ? 'Editar' : 'Crear' }} Equipo</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="name">
          @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
            <mat-error>Requerido</mat-error>
          }
        </mat-form-field>
 
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Ciudad</mat-label>
          <input matInput formControlName="city">
          @if (form.get('city')?.hasError('required') && form.get('city')?.touched) {
            <mat-error>Requerido</mat-error>
          }
        </mat-form-field>
 
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Estadio</mat-label>
          <input matInput formControlName="stadium">
        </mat-form-field>
 
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Fecha de Fundación</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="foundedDate">
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>
 
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>URL del Logo</mat-label>
          <input matInput formControlName="logoUrl">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancelar</button>
      <button mat-raised-button color="primary"
              [disabled]="form.invalid"
              (click)="onSave()">
        {{ data.team ? 'Actualizar' : 'Crear' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-grid { display: flex; flex-direction: column; min-width: 400px; }
    .full-width { width: 100%; }
  `]
})
export class TeamFormDialogComponent implements OnInit {
  data = inject<TeamFormData>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<TeamFormDialogComponent>);
  private fb = inject(FormBuilder);
 
  form = this.fb.group({
    name: ['', [Validators.required]],
    city: ['', [Validators.required]],
    stadium: [''],
    foundedDate: [''],
    logoUrl: ['']
  });
 
  ngOnInit(): void {
    if (this.data.team) {
      this.form.patchValue({
        name: this.data.team.name,
        city: this.data.team.city,
        stadium: this.data.team.stadium,
        foundedDate: this.data.team.foundedDate,
        logoUrl: this.data.team.logoUrl ?? ''
      });
    }
  }
 
  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.getRawValue() as TeamRequest);
    }
  }
}
