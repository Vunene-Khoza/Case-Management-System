import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CaseService } from '../../services/case.service';
import { Case, CaseNote, CaseStatus, CaseType, UserRole, CaseEvidence, User } from '../../models/case.model';
import { 
  LucideArrowLeft, 
  LucideCalendar, 
  LucidePlus, 
  LucideTrash2, 
  LucideEdit2, 
  LucideLock, 
  LucideCheckSquare, 
  LucideX, 
  LucideMessageSquare, 
  LucideClock, 
  LucideUser,
  LucideChevronLeft,
  LucideChevronRight
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
    LucidePlus, 
    LucideTrash2, 
    LucideEdit2, 
    LucideLock, 
    LucideCheckSquare, 
    LucideX, 
    LucideMessageSquare, 
    LucideClock, 
    LucideUser,
    LucideChevronLeft,
    LucideChevronRight
  ],
  templateUrl: './case-details.component.html',
  styleUrl: './case-details.component.css'
})
export class CaseDetailsComponent implements OnInit {
  @ViewChild('carouselViewport')
  carouselViewport?: ElementRef<HTMLElement>;

  @ViewChild('noteEditor')
  noteEditor?: ElementRef<HTMLDivElement>;

  // Ledger of all cases for horizontal navigation
  cases: Case[] = [];
  currentCaseIndex = 0;
  activeCase?: Case;

  // Vertical information layer:
  // -1: Case History & Notes (drag UP from Main)
  //  0: Main Case Card (Center Anchor)
  // +1: Assigned Legal Officer (drag DOWN from Main)
  verticalLayer: -1 | 0 | 1 = 0;

  notes: CaseNote[] = [];
  loadingNotes = false;
  loading = true;
  isAdmin = false;
  CaseStatus = CaseStatus;
  CaseType = CaseType;

  // Attached evidence for active case
  evidenceList: CaseEvidence[] = [];

  // Legal officers list and matched profile for active case
  legalOfficers: User[] = [];
  officerDetails: User | null = null;

  // Modals
  showNoteModal = false;
  noteContent = '';
  showCloseModal = false;
  closeFormData = {
    date: '',
    cost: 0,
    summary: ''
  };

  /* ---------------------------------------------------------
     2D POINTER / DRAG STATE
  --------------------------------------------------------- */
  isDragging = false;
  didDrag = false;
  lockedAxis: 'horizontal' | 'vertical' | null = null;

  private pointerId: number | null = null;
  private dragStartX = 0;
  private dragStartY = 0;
  private lastPointerX = 0;
  private lastPointerY = 0;
  private lastPointerTime = 0;
  private dragVelocityX = 0;
  private dragVelocityY = 0;

  // Drag offsets (pixels)
  currentDragX = 0;
  currentDragY = 0;

  private readonly dragThreshold = 8;
  private readonly flickVelocityThreshold = 0.22;
  private animationFrameId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private caseService: CaseService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.isAdmin = this.caseService.getCurrentUser().role === UserRole.ADMIN;
    this.loadAllCasesAndSelect();
  }

  /**
   * Loads the ledger of cases and selects the active case based on route param.
   */
  loadAllCasesAndSelect() {
    this.loading = true;
    const targetId = this.route.snapshot.paramMap.get('id');

    // Pre-load legal officers list for rich profile lookup
    this.caseService.getLegalOfficersForAdmin().subscribe({
      next: (officers) => {
        this.legalOfficers = officers;
        this.updateOfficerDetails();
      },
      error: () => {}
    });

    this.caseService.getCases({ page: 1, limit: 100, search: '' }).subscribe({
      next: (res) => {
        this.cases = res.items || [];

        if (this.cases.length === 0 && targetId) {
          // Fallback single case load
          this.loadSingleFallback(targetId);
          return;
        }

        if (targetId) {
          const foundIndex = this.cases.findIndex(
            c => c.caseId.toLowerCase() === targetId.toLowerCase()
          );
          this.currentCaseIndex = foundIndex >= 0 ? foundIndex : 0;
        } else {
          this.currentCaseIndex = 0;
        }

        this.selectActiveCase();
        this.loading = false;
      },
      error: () => {
        if (targetId) {
          this.loadSingleFallback(targetId);
        } else {
          this.loading = false;
        }
      }
    });
  }

  private loadSingleFallback(id: string) {
    this.caseService.getCaseById(id).subscribe({
      next: (singleCase) => {
        if (singleCase) {
          this.cases = [singleCase];
          this.currentCaseIndex = 0;
          this.selectActiveCase();
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  /**
   * Synchronizes active case data, notes, officer details, and evidence.
   * Resets vertical layer to Main Case (Y = 0).
   */
  selectActiveCase() {
    if (!this.cases || this.cases.length === 0) {
      this.activeCase = undefined;
      return;
    }

    // Clamp index
    if (this.currentCaseIndex < 0) this.currentCaseIndex = 0;
    if (this.currentCaseIndex >= this.cases.length) this.currentCaseIndex = this.cases.length - 1;

    this.activeCase = this.cases[this.currentCaseIndex];
    if (!this.activeCase) return;

    // Reset vertical layer to Main Case Card anchor
    this.verticalLayer = 0;
    this.currentDragX = 0;
    this.currentDragY = 0;

    // Sync route URL in browser without full reload
    if (window.history && window.history.replaceState) {
      window.history.replaceState({}, '', `/cases/${this.activeCase.caseId}`);
    }

    // Load notes for this specific case
    this.loadingNotes = true;
    this.caseService.getNotesForCase(this.activeCase.caseId).subscribe({
      next: (notesList) => {
        this.notes = notesList;
        this.loadingNotes = false;
      },
      error: () => {
        this.notes = [];
        this.loadingNotes = false;
      }
    });

    // Load evidence for this specific case
    this.evidenceList = this.caseService.getCaseEvidence(this.activeCase.caseId);

    // Update officer profile details
    this.updateOfficerDetails();
  }

  updateOfficerDetails() {
    if (!this.activeCase?.assignedOfficer) {
      this.officerDetails = null;
      return;
    }
    const name = this.activeCase.assignedOfficer.trim().toLowerCase();
    this.officerDetails = this.legalOfficers.find(o => 
      o.name.trim().toLowerCase() === name || 
      o.email.trim().toLowerCase() === name
    ) || null;
  }

  /* =========================================================
     HORIZONTAL NAVIGATION (Left <-> Right: Change Cases)
  ========================================================= */

  previousCase() {
    if (this.currentCaseIndex > 0) {
      this.currentCaseIndex--;
      this.selectActiveCase();
    }
  }

  nextCase() {
    if (this.currentCaseIndex < this.cases.length - 1) {
      this.currentCaseIndex++;
      this.selectActiveCase();
    }
  }

  goToCase(index: number) {
    if (index >= 0 && index < this.cases.length && index !== this.currentCaseIndex) {
      this.currentCaseIndex = index;
      this.selectActiveCase();
    }
  }

  /* =========================================================
     VERTICAL NAVIGATION (Up <-> Down: Information Layers)
  ========================================================= */

  goToVerticalLayer(layer: -1 | 0 | 1) {
    this.verticalLayer = layer;
    this.currentDragY = 0;
  }

  showHistoryNotes() {
    this.goToVerticalLayer(-1);
  }

  showMainCase() {
    this.goToVerticalLayer(0);
  }

  showAssignedOfficer() {
    this.goToVerticalLayer(1);
  }

  /* =========================================================
     2D POINTER / DRAG GESTURE DETECTION
  ========================================================= */

  onDragStart(event: PointerEvent): void {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    if (this.showCloseModal || this.showNoteModal) {
      return;
    }

    const target = event.target as HTMLElement | null;
    if (target && target.closest('button, a, input, textarea, select, .btn, .toolbar-btn, .close-btn, .v-pill, .carousel-arrow, .modal-card, .notes-header-actions, .empty-notes button, [role="button"]')) {
      return;
    }

    // Cancel ongoing animations
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.isDragging = true;
    this.didDrag = false;
    this.lockedAxis = null;

    this.pointerId = event.pointerId;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.lastPointerX = event.clientX;
    this.lastPointerY = event.clientY;
    this.lastPointerTime = performance.now();
    this.dragVelocityX = 0;
    this.dragVelocityY = 0;
    this.currentDragX = 0;
    this.currentDragY = 0;

    const viewport = this.carouselViewport?.nativeElement;
    if (viewport) {
      try {
        viewport.setPointerCapture(event.pointerId);
      } catch {}
    }
  }

  onDragMove(event: PointerEvent): void {
    if (!this.isDragging || event.pointerId !== this.pointerId) {
      return;
    }

    const currentX = event.clientX;
    const currentY = event.clientY;
    const now = performance.now();

    const deltaX = currentX - this.dragStartX;
    const deltaY = currentY - this.dragStartY;
    const stepX = currentX - this.lastPointerX;
    const stepY = currentY - this.lastPointerY;
    const deltaTime = Math.max(now - this.lastPointerTime, 16);

    this.dragVelocityX = stepX / deltaTime;
    this.dragVelocityY = stepY / deltaTime;
    this.lastPointerX = currentX;
    this.lastPointerY = currentY;
    this.lastPointerTime = now;

    // Disambiguate Axis Priority once threshold exceeded
    if (this.lockedAxis === null) {
      const dist = Math.hypot(deltaX, deltaY);
      if (dist >= this.dragThreshold) {
        this.didDrag = true;
        // Priority: Greater displacement wins
        if (Math.abs(deltaX) >= Math.abs(deltaY)) {
          this.lockedAxis = 'horizontal';
        } else {
          this.lockedAxis = 'vertical';
        }
      }
    }

    if (this.lockedAxis === 'horizontal') {
      // Horizontal Case Navigation (Drag Left/Right)
      let dragX = deltaX;
      // Resistance at edges
      if (this.currentCaseIndex === 0 && dragX > 0) {
        dragX = dragX * 0.28;
      } else if (this.currentCaseIndex === this.cases.length - 1 && dragX < 0) {
        dragX = dragX * 0.28;
      }
      this.currentDragX = dragX;
      this.currentDragY = 0;
      event.preventDefault();
    } else if (this.lockedAxis === 'vertical') {
      // Vertical Information Layer Navigation
      let dragY = deltaY;
      // Resistance at vertical boundaries
      if (this.verticalLayer === -1 && dragY < 0) {
        // Already at top (Notes), resistance dragging further up
        dragY = dragY * 0.25;
      } else if (this.verticalLayer === 1 && dragY > 0) {
        // Already at bottom (Officer), resistance dragging further down
        dragY = dragY * 0.25;
      }
      this.currentDragY = dragY;
      this.currentDragX = 0;
      event.preventDefault();
    }
  }

  onDragEnd(event?: PointerEvent): void {
    if (!this.isDragging) {
      return;
    }

    if (event && this.pointerId !== null && event.pointerId !== this.pointerId) {
      return;
    }

    const viewport = this.carouselViewport?.nativeElement;
    if (viewport && this.pointerId !== null) {
      try {
        viewport.releasePointerCapture(this.pointerId);
      } catch {}
    }

    const axis = this.lockedAxis;
    const finalDragX = this.currentDragX;
    const finalDragY = this.currentDragY;
    const velX = this.dragVelocityX;
    const velY = this.dragVelocityY;

    this.isDragging = false;
    this.lockedAxis = null;
    this.pointerId = null;

    if (axis === 'horizontal') {
      const thresholdX = 100;
      const isFlickLeft = velX < -this.flickVelocityThreshold || finalDragX < -thresholdX;
      const isFlickRight = velX > this.flickVelocityThreshold || finalDragX > thresholdX;

      if (isFlickLeft && this.currentCaseIndex < this.cases.length - 1) {
        this.nextCase();
      } else if (isFlickRight && this.currentCaseIndex > 0) {
        this.previousCase();
      } else {
        // Snap back
        this.currentDragX = 0;
      }
    } else if (axis === 'vertical') {
      const thresholdY = 80;
      const isFlickUp = velY < -this.flickVelocityThreshold || finalDragY < -thresholdY;
      const isFlickDown = velY > this.flickVelocityThreshold || finalDragY > thresholdY;

      if (this.verticalLayer === 0) {
        if (isFlickUp) {
          // Drag UP -> Case History & Notes Card
          this.goToVerticalLayer(-1);
        } else if (isFlickDown) {
          // Drag DOWN -> Assigned Legal Officer Card
          this.goToVerticalLayer(1);
        } else {
          this.currentDragY = 0;
        }
      } else if (this.verticalLayer === -1) {
        if (isFlickDown) {
          // Drag DOWN from Notes -> Return to Main Case Card
          this.goToVerticalLayer(0);
        } else {
          this.currentDragY = 0;
        }
      } else if (this.verticalLayer === 1) {
        if (isFlickUp) {
          // Drag UP from Officer -> Return to Main Case Card
          this.goToVerticalLayer(0);
        } else {
          this.currentDragY = 0;
        }
      }
    } else {
      this.currentDragX = 0;
      this.currentDragY = 0;
    }

    window.setTimeout(() => {
      this.didDrag = false;
    }, 100);
  }

  onDragCancel(): void {
    if (this.isDragging) {
      this.onDragEnd();
    }
  }

  /* =========================================================
     KEYBOARD NAVIGATION
  ========================================================= */

  @HostListener('window:keydown', ['$event'])
  onKeyboardNavigation(event: KeyboardEvent): void {
    if (this.showCloseModal || this.showNoteModal) {
      return;
    }

    const target = event.target as HTMLElement | null;
    if (
      target &&
      (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')
    ) {
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.previousCase();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.nextCase();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (this.verticalLayer === 0) {
        this.goToVerticalLayer(-1);
      } else if (this.verticalLayer === 1) {
        this.goToVerticalLayer(0);
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (this.verticalLayer === 0) {
        this.goToVerticalLayer(1);
      } else if (this.verticalLayer === -1) {
        this.goToVerticalLayer(0);
      }
    }
  }

  /* =========================================================
     HELPERS & FORMATTERS
  ========================================================= */

  formatCost(val: number): string {
    return (val || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  getCaseTypeClass(type?: CaseType): string {
    return type === CaseType.LEGAL ? 'badge-legal' : 'badge-labour';
  }

  getStatusClass(status?: CaseStatus): string {
    switch (status) {
      case CaseStatus.OPEN: return 'badge-open';
      case CaseStatus.IN_PROGRESS: return 'badge-in-progress';
      case CaseStatus.CLOSED: return 'badge-closed';
      default: return '';
    }
  }

  formatStatusLabel(status?: CaseStatus): string {
    switch (status) {
      case CaseStatus.OPEN: return 'Open';
      case CaseStatus.IN_PROGRESS: return 'In Progress';
      case CaseStatus.CLOSED: return 'Closed';
      default: return status || 'Open';
    }
  }

  getInitials(name?: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  }

  // Modals & WYSIWYG Note Actions
  openNoteModal(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.showNoteModal = true;
    this.noteContent = '';
    this.cdr.detectChanges();
    window.setTimeout(() => {
      if (this.noteEditor) {
        this.noteEditor.nativeElement.innerHTML = '';
        this.noteEditor.nativeElement.focus();
      }
    }, 50);
  }

  closeNoteModal(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.showNoteModal = false;
    this.noteContent = '';
    this.cdr.detectChanges();
  }

  onEditorInput() {
    if (this.noteEditor) {
      this.noteContent = this.noteEditor.nativeElement.innerHTML;
    }
  }

  hasNoteContent(): boolean {
    if (!this.noteContent) return false;
    const cleanText = this.noteContent.replace(/<[^>]*>/g, '').trim();
    return cleanText.length > 0;
  }

  execCmd(command: string, value: string | undefined = undefined) {
    document.execCommand(command, false, value);
    if (this.noteEditor) {
      this.noteEditor.nativeElement.focus();
    }
    this.onEditorInput();
  }

  formatBlock(event: Event) {
    const select = event.target as HTMLSelectElement;
    const val = select.value;
    if (val) {
      document.execCommand('formatBlock', false, `<${val}>`);
      if (this.noteEditor) {
        this.noteEditor.nativeElement.focus();
      }
      this.onEditorInput();
    }
  }

  insertLink() {
    const url = prompt('Enter link URL (e.g. https://...):');
    if (url && url.trim()) {
      let formattedUrl = url.trim();
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = 'https://' + formattedUrl;
      }
      document.execCommand('createLink', false, formattedUrl);
      if (this.noteEditor) {
        this.noteEditor.nativeElement.focus();
      }
      this.onEditorInput();
    }
  }

  submitNote() {
    if (!this.hasNoteContent() || !this.activeCase) return;
    this.caseService.addNote(this.activeCase.caseId, this.noteContent).subscribe(newNote => {
      this.notes.unshift(newNote);
      this.closeNoteModal();
    });
  }

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
      if (updatedCase) {
        this.activeCase = updatedCase;
        const idx = this.cases.findIndex(c => c.caseId === updatedCase.caseId);
        if (idx >= 0) {
          this.cases[idx] = updatedCase;
        }
      }
      this.closeCloseModal();
      this.goToVerticalLayer(0);
    });
  }

  deleteCase() {
    if (!this.activeCase) return;
    const confirmDelete = confirm(`Are you sure you want to permanently delete Case ${this.activeCase.caseId}? This action cannot be undone.`);
    if (confirmDelete) {
      this.caseService.deleteCase(this.activeCase.caseId).subscribe(() => {
        alert('Case deleted successfully.');
        // Remove from local list
        this.cases = this.cases.filter(c => c.caseId !== this.activeCase?.caseId);
        if (this.cases.length > 0) {
          if (this.currentCaseIndex >= this.cases.length) {
            this.currentCaseIndex = this.cases.length - 1;
          }
          this.selectActiveCase();
        } else {
          this.router.navigate(['/cases']);
        }
      });
    }
  }
}
