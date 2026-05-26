import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefereeFormDialog } from './referee-form-dialog';

describe('RefereeFormDialog', () => {
  let component: RefereeFormDialog;
  let fixture: ComponentFixture<RefereeFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RefereeFormDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(RefereeFormDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
