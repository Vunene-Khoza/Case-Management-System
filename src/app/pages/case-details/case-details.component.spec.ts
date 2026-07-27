import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CaseDetailsComponent } from './case-details.component';
import { CaseService } from '../../services/case.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

describe('CaseDetailsComponent', () => {
  let component: CaseDetailsComponent;
  let fixture: ComponentFixture<CaseDetailsComponent>;
  let mockCaseService: any;
  let mockActivatedRoute: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockCaseService = jasmine.createSpyObj('CaseService', ['getCurrentUser', 'getCaseById', 'getNotesForCase', 'addNote', 'closeCase', 'deleteCase']);
    mockCaseService.getCurrentUser.and.returnValue({ name: 'Admin A', role: 'ADMIN' });
    mockCaseService.getCaseById.and.returnValue(of(null));
    mockCaseService.getNotesForCase.and.returnValue(of([]));

    mockActivatedRoute = {
      paramMap: of({
        get: (key: string) => 'C001'
      })
    };
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CaseDetailsComponent],
      providers: [
        { provide: CaseService, useValue: mockCaseService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaseDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
