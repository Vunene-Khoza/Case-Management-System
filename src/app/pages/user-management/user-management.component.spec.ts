import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserManagementComponent } from './user-management.component';
import { CaseService } from '../../services/case.service';
import { of } from 'rxjs';

describe('UserManagementComponent', () => {
  let component: UserManagementComponent;
  let fixture: ComponentFixture<UserManagementComponent>;
  let mockCaseService: any;

  beforeEach(async () => {
    mockCaseService = jasmine.createSpyObj('CaseService', ['getCurrentUser', 'getAllUsers', 'createUser', 'deleteUser']);
    mockCaseService.getCurrentUser.and.returnValue({ userId: 'U001', name: 'Admin A', role: 'ADMIN' });
    mockCaseService.getAllUsers.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [UserManagementComponent],
      providers: [
        { provide: CaseService, useValue: mockCaseService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
