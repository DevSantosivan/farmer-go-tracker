import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyreportComponent } from './monthlyreport.component';

describe('MonthlyreportComponent', () => {
  let component: MonthlyreportComponent;
  let fixture: ComponentFixture<MonthlyreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyreportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlyreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
