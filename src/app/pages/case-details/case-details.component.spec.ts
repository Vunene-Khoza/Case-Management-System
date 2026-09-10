import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CaseDetailsComponent } from './case-details.component';
import { CaseService } from '../../services/case.service';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';

describe('CaseDetailsComponent', () => {
  let component: CaseDetailsComponent;
  let fixture: ComponentFixture<CaseDetailsComponent>;
  let mockCaseService: any;
  let mockActivatedRoute: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockCaseService = jasmine.createSpyObj('CaseService', [
      'getCurrentUser', 
      'getCaseById', 
      'getCases', 
      'getNotesForCase', 
      'addNote', 
      'closeCase', 
      'deleteCase',
      'getLegalOfficersForAdmin',
      'getCaseEvidence'
    ]);
    mockCaseService.getCurrentUser.and.returnValue({ name: 'Admin A', role: 'ADMIN' });
    mockCaseService.getCaseById.and.returnValue(of(null));
    mockCaseService.getCases.and.returnValue(of({ items: [], totalItems: 0, totalPages: 1 }));
    mockCaseService.getNotesForCase.and.returnValue(of([]));
    mockCaseService.getLegalOfficersForAdmin.and.returnValue(of([]));
    mockCaseService.getCaseEvidence.and.returnValue([]);

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: (key: string) => 'C001'
        }
      },
      paramMap: of({
        get: (key: string) => 'C001'
      })
    };
    await TestBed.configureTestingModule({
      imports: [CaseDetailsComponent],
      providers: [
        provideRouter([]),
        { provide: CaseService, useValue: mockCaseService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
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

  it('should open note modal when openNoteModal is called', () => {
    expect(component.showNoteModal).toBeFalse();
    component.openNoteModal();
    expect(component.showNoteModal).toBeTrue();
    expect(component.noteContent).toBe('');
  });

  it('should close note modal when closeNoteModal is called', () => {
    component.openNoteModal();
    expect(component.showNoteModal).toBeTrue();
    component.closeNoteModal();
    expect(component.showNoteModal).toBeFalse();
  });

  it('should not start drag when target is a button or interactive element', () => {
    const button = document.createElement('button');
    const mockPointerEvent = {
      pointerType: 'mouse',
      button: 0,
      target: button
    } as unknown as PointerEvent;

    component.onDragStart(mockPointerEvent);
    expect(component.isDragging).toBeFalse();
  });
});
