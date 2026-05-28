import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchFormDialog } from './match-form-dialog';

describe('MatchFormDialog', () => {
  let component: MatchFormDialog;
  let fixture: ComponentFixture<MatchFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchFormDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(MatchFormDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
