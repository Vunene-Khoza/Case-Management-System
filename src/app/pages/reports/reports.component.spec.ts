import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportsComponent } from './reports.component';
import { CaseService } from '../../services/case.service';
import { of } from 'rxjs';

describe('ReportsComponent', () => {
  let component: ReportsComponent;
  let fixture: ComponentFixture<ReportsComponent>;
  let mockCaseService: any;

  beforeEach(async () => {
    mockCaseService = jasmine.createSpyObj('CaseService', ['getReportData']);
    mockCaseService.getReportData.and.returnValue(of({
      totalCases: 0,
      openCases: 0,
      closedCases: 0,
      totalCost: 0,
      caseTypesChart: [],
      monthlyCasesChart: []
    }));

    await TestBed.configureTestingModule({
      imports: [ReportsComponent],
      providers: [
        { provide: CaseService, useValue: mockCaseService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
