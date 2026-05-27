import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  MatDialogModule, MatFormFieldModule, MatInputModule,
  MatButtonModule
} from './../../shared/material.imports';
import { Referee, RefereeRequest } from '../../core/models/referee.model';
 
export interface RefereeFormData {
  referee?: Referee;
}
 
@Component({
  selector: 'app-referee-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.referee ? 'Editar' : 'Crear' }} Árbitro</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Nombre</mat-label>
            <input matInput formControlName="firstName">
            @if (form.get('firstName')?.hasError('required') &&
                 form.get('firstName')?.touched) {
              <mat-error>Requerido</mat-error>
            }
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Apellido</mat-label>
            <input matInput formControlName="lastName">
            @if (form.get('lastName')?.hasError('required') &&
                 form.get('lastName')?.touched) {
              <mat-error>Requerido</mat-error>
            }
          </mat-form-field>
        </div>
 
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nacionalidad</mat-label>
          <input matInput formControlName="nationality">
          @if (form.get('nationality')?.hasError('required') &&
               form.get('nationality')?.touched) {
            <mat-error>Requerido</mat-error>
          }
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancelar</button>
      <button mat-raised-button color="primary"
              [disabled]="form.invalid" (click)="onSave()">
        {{ data.referee ? 'Actualizar' : 'Crear' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-grid { display: flex; flex-direction: column; min-width: 420px; }
    .row { display: flex; gap: 16px; }
    .row mat-form-field { flex: 1; }
    .full-width { width: 100%; }
  `]
})
export class RefereeFormDialogComponent implements OnInit {
  data = inject<RefereeFormData>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<RefereeFormDialogComponent>);
  private fb = inject(FormBuilder);
 
  form = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    nationality: ['', [Validators.required]]
  });
 
  ngOnInit(): void {
    if (this.data.referee) {
      this.form.patchValue({
        firstName: this.data.referee.firstName,
        lastName: this.data.referee.lastName,
        nationality: this.data.referee.nationality
      });
    }
  }
 
  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.getRawValue() as RefereeRequest);
    }
  }
}

