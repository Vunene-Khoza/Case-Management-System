import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CasesListComponent } from './cases-list.component';
import { CaseService } from '../../services/case.service';
import { RouterModule } from '@angular/router';
import { of } from 'rxjs';

describe('CasesListComponent', () => {
  let component: CasesListComponent;
  let fixture: ComponentFixture<CasesListComponent>;
  let mockCaseService: any;

  beforeEach(async () => {
    mockCaseService = jasmine.createSpyObj('CaseService', ['getCases']);
    mockCaseService.getCases.and.returnValue(of({
      items: [],
      totalItems: 0,
      totalPages: 1
    }));

    await TestBed.configureTestingModule({
      imports: [
        CasesListComponent,
        RouterModule.forRoot([])
      ],
      providers: [
        { provide: CaseService, useValue: mockCaseService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CasesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
