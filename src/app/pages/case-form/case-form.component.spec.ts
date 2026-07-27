import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CaseFormComponent } from './case-form.component';
import { CaseService } from '../../services/case.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

describe('CaseFormComponent', () => {
  let component: CaseFormComponent;
  let fixture: ComponentFixture<CaseFormComponent>;
  let mockCaseService: any;
  let mockActivatedRoute: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockCaseService = jasmine.createSpyObj('CaseService', ['getCaseById', 'createCase', 'updateCase']);
    mockActivatedRoute = {
      paramMap: of({
        get: (key: string) => null
      })
    };
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CaseFormComponent],
      providers: [
        { provide: CaseService, useValue: mockCaseService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaseFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
