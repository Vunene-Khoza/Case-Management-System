import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CaseService } from '../../services/case.service';
import { Case, CaseNote, CaseStatus, CaseType, UserRole } from '../../models/case.model';
import { 
  LucideArrowLeft, 
  LucideCalendar, 
  LucideDollarSign, 
  LucidePlus, 
  LucideTrash2, 
  LucideEdit2, 
  LucideLock, 
  LucideCheckSquare, 
  LucideX, 
  LucideMessageSquare, 
  LucideClock, 
  LucideUser 
} from '@lucide/angular';

@Component({
  selector: 'app-case-details',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    LucideArrowLeft, 
    LucideCalendar, 
    LucideDollarSign, 
    LucidePlus, 
    LucideTrash2, 
    LucideEdit2, 
    LucideLock, 
    LucideCheckSquare, 
    LucideX, 
    LucideMessageSquare, 
    LucideClock, 
    LucideUser
  ],
  templateUrl: './case-details.component.html',
  styleUrl: './case-details.component.css'
})
export class CaseDetailsComponent implements OnInit {
  activeCase?: Case;
  notes: CaseNote[] = [];
  loading = true;
  isAdmin = false;
  CaseStatus = CaseStatus;
  CaseType = CaseType;

  // Add Note Modal controls
  showNoteModal = false;
  noteContent = '';

  // Close Case Modal controls
  showCloseModal = false;
  closeFormData = {
    date: '',
    cost: 0,
    summary: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private caseService: CaseService
  ) {}

  ngOnInit() {
    this.isAdmin = this.caseService.getCurrentUser().role === UserRole.ADMIN;
    
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadCase(id);
      }
    });
  }

  loadCase(id: string) {
    this.loading = true;
    this.caseService.getCaseById(id).subscribe({
      next: (data) => {
        this.activeCase = data;
        if (data) {
          this.caseService.getNotesForCase(id).subscribe({
            next: (notesList) => {
              this.notes = notesList;
              this.loading = false;
            },
            error: () => {
              this.loading = false;
            }
          });
        } else {
          this.loading = false;
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  formatCost(val: number): string {
    return val.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  getCaseTypeClass(type: CaseType): string {
    return type === CaseType.LEGAL ? 'badge-legal' : 'badge-labour';
  }

  getStatusClass(status: CaseStatus): string {
    switch (status) {
      case CaseStatus.OPEN: return 'badge-open';
      case CaseStatus.IN_PROGRESS: return 'badge-in-progress';
      case CaseStatus.CLOSED: return 'badge-closed';
      default: return '';
    }
  }

  formatStatusLabel(status: CaseStatus): string {
    switch (status) {
      case CaseStatus.OPEN: return 'Open';
      case CaseStatus.IN_PROGRESS: return 'In Progress';
      case CaseStatus.CLOSED: return 'Closed';
      default: return status;
    }
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  }

  // Note Modal Actions
  openNoteModal() {
    this.showNoteModal = true;
    this.noteContent = '';
  }

  closeNoteModal() {
    this.showNoteModal = false;
    this.noteContent = '';
  }

  submitNote() {
    if (!this.noteContent.trim() || !this.activeCase) return;
    this.caseService.addNote(this.activeCase.caseId, this.noteContent).subscribe(newNote => {
      this.notes.unshift(newNote); // prepend
      this.closeNoteModal();
    });
  }

  // Close Case Modal Actions
  openCloseModal() {
    this.showCloseModal = true;
    this.closeFormData = {
      date: new Date().toISOString().split('T')[0],
      cost: this.activeCase?.costing || 0,
      summary: ''
    };
  }

  closeCloseModal() {
    this.showCloseModal = false;
  }

  submitCloseCase() {
    if (!this.activeCase) return;
    this.caseService.closeCase(this.activeCase.caseId, {
      closureDate: this.closeFormData.date,
      finalNotes: this.closeFormData.summary,
      finalCosting: this.closeFormData.cost
    }).subscribe(updatedCase => {
      this.activeCase = updatedCase;
      this.closeCloseModal();
    });
  }

  deleteCase() {
    if (!this.activeCase) return;
    const confirmDelete = confirm(`Are you absolutely sure you want to permanently delete Case ${this.activeCase.caseId}? This action is irreversible.`);
    if (confirmDelete) {
      this.caseService.deleteCase(this.activeCase.caseId).subscribe(() => {
        alert('Case deleted successfully.');
        this.router.navigate(['/cases']);
      });
    }
  }
}
