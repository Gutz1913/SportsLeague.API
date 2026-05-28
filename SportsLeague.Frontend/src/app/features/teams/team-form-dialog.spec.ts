import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamFormDialog } from './team-form-dialog';

describe('TeamFormDialog', () => {
  let component: TeamFormDialog;
  let fixture: ComponentFixture<TeamFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamFormDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(TeamFormDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
