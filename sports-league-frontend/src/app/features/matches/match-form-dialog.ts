import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  MatDialogModule, MatFormFieldModule, MatInputModule,
  MatButtonModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule
} from '../../shared/material.imports';
import { TournamentService } from '../../core/services/tournament.service';
import { RefereeService } from '../../core/services/referee.service';
import { Tournament, TournamentStatus } from '../../core/models/tournament.model';
import { Team } from '../../core/models/team.model';
import { Referee } from '../../core/models/referee.model';
 
export interface MatchFormData { tournamentId?: number; }
 
@Component({
  selector: 'app-match-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule
  ],
  template: `
    <h2 mat-dialog-title>Programar Partido</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Torneo</mat-label>
          <mat-select formControlName="tournamentId"
                      (selectionChange)="onTournamentChange()">
            @for (t of tournaments; track t.id) {
              <mat-option [value]="t.id">{{ t.name }} ({{ t.season }})</mat-option>
            }
          </mat-select>
        </mat-form-field>
 
        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Equipo Local</mat-label>
            <mat-select formControlName="homeTeamId">
              @for (team of enrolledTeams; track team.id) {
                <mat-option [value]="team.id"
                  [disabled]="team.id === form.get('awayTeamId')?.value">
                  {{ team.name }}
                </mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Equipo Visitante</mat-label>
            <mat-select formControlName="awayTeamId">
              @for (team of enrolledTeams; track team.id) {
                <mat-option [value]="team.id"
                  [disabled]="team.id === form.get('homeTeamId')?.value">
                  {{ team.name }}
                </mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
 
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Árbitro</mat-label>
          <mat-select formControlName="refereeId">
            @for (ref of referees; track ref.id) {
              <mat-option [value]="ref.id">
                {{ ref.firstName }} {{ ref.lastName }}
              </mat-option>
            }
          </mat-select>
        </mat-form-field>
 
        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Fecha del Partido</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="matchDate">
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Jornada</mat-label>
            <input matInput type="number" formControlName="matchday">
          </mat-form-field>
        </div>
 
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Sede / Estadio</mat-label>
          <input matInput formControlName="venue">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancelar</button>
      <button mat-raised-button color="primary"
              [disabled]="form.invalid" (click)="onSave()">Programar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-grid { display:flex; flex-direction:column; min-width:500px; }
    .row { display:flex; gap:16px; }
    .row mat-form-field { flex:1; }
    .full-width { width:100%; }
  `]
})
export class MatchFormDialogComponent implements OnInit {
  data = inject<MatchFormData>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<MatchFormDialogComponent>);
  private fb = inject(FormBuilder);
  private tournamentService = inject(TournamentService);
  private refereeService = inject(RefereeService);
 
  tournaments: Tournament[] = [];
  enrolledTeams: Team[] = [];
  referees: Referee[] = [];
 
  form = this.fb.group({
    tournamentId: [null as number|null, [Validators.required]],
    homeTeamId: [null as number|null, [Validators.required]],
    awayTeamId: [null as number|null, [Validators.required]],
    refereeId: [null as number|null, [Validators.required]],
    matchDate: ['', [Validators.required]],
    matchday: [1, [Validators.required, Validators.min(1)]],
    venue: ['', [Validators.required]]
  });
 
  ngOnInit(): void {
    this.tournamentService.getAll().subscribe(res => {
      this.tournaments = (res.data ?? [])
        .filter(t => t.status === TournamentStatus.InProgress);
      if (this.data.tournamentId) {
        this.form.patchValue({ tournamentId: this.data.tournamentId });
        this.onTournamentChange();
      }
    });
    this.refereeService.getAll().subscribe(res =>
      this.referees = res.data ?? []);
  }
 
  onTournamentChange(): void {
    const tId = this.form.get('tournamentId')?.value;
    if (tId) {
      this.tournamentService.getTeams(tId).subscribe(res =>
        this.enrolledTeams = res.data ?? []);
      this.form.patchValue({ homeTeamId: null, awayTeamId: null });
    }
  }
 
  onSave(): void {
    if (this.form.valid) this.dialogRef.close(this.form.getRawValue());
  }
}
