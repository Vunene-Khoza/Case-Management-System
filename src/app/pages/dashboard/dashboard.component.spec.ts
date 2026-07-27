import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { CaseService } from '../../services/case.service';
import { RouterModule } from '@angular/router';
import { of } from 'rxjs';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockCaseService: any;

  beforeEach(async () => {
    mockCaseService = jasmine.createSpyObj('CaseService', ['getCurrentUser', 'getDashboardSummary']);
    mockCaseService.getCurrentUser.and.returnValue({ name: 'Admin A', role: 'ADMIN' });
    mockCaseService.getDashboardSummary.and.returnValue(of({
      totalCases: 0,
      openCases: 0,
      closedCases: 0,
      totalCost: 0,
      recentCases: [],
      notifications: []
    }));

    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        RouterModule.forRoot([])
      ],
      providers: [
        { provide: CaseService, useValue: mockCaseService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
