import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerFormDialog } from './player-form-dialog';

describe('PlayerFormDialog', () => {
  let component: PlayerFormDialog;
  let fixture: ComponentFixture<PlayerFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerFormDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerFormDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
