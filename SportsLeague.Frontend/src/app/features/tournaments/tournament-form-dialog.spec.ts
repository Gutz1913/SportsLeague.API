import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentFormDialog } from './tournament-form-dialog';

describe('TournamentFormDialog', () => {
  let component: TournamentFormDialog;
  let fixture: ComponentFixture<TournamentFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TournamentFormDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(TournamentFormDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
