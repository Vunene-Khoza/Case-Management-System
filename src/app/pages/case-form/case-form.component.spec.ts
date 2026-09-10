import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CaseFormComponent } from './case-form.component';
import { CaseService } from '../../services/case.service';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

describe('CaseFormComponent', () => {
  let component: CaseFormComponent;
  let fixture: ComponentFixture<CaseFormComponent>;
  let mockCaseService: any;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockCaseService = jasmine.createSpyObj('CaseService', [
      'getCaseById', 
      'createCase', 
      'updateCase', 
      'getLegalOfficersForAdmin', 
      'getCaseEvidence',
      'searchEmployeeByNumber'
    ]);
    mockCaseService.getLegalOfficersForAdmin.and.returnValue(of([]));
    mockCaseService.getCaseEvidence.and.returnValue([]);
    mockCaseService.searchEmployeeByNumber.and.returnValue(of(null));
    mockCaseService.getCaseById.and.returnValue(of(null));

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: () => null
        }
      },
      paramMap: of({
        get: () => null
      })
    };

    await TestBed.configureTestingModule({
      imports: [CaseFormComponent],
      providers: [
        provideRouter([]),
        { provide: CaseService, useValue: mockCaseService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
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

  it('should call showPicker or focus when openDatePicker is invoked', () => {
    const input = document.createElement('input');
    input.type = 'date';
    const showPickerSpy = jasmine.createSpy('showPicker');
    input.showPicker = showPickerSpy;

    component.openDatePicker(input);
    expect(showPickerSpy).toHaveBeenCalled();
  });
});
