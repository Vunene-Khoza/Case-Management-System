import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CaseService } from '../../services/case.service';
import { Case, CaseNote, CaseStatus, CaseType, UserRole, CaseEvidence } from '../../models/case.model';
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
  LucideChevronRight,
  LucideGripHorizontal
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
    LucideChevronRight,
    LucideGripHorizontal
  ],
  templateUrl: './case-details.component.html',
  styleUrl: './case-details.component.css'
})
export class CaseDetailsComponent implements OnInit {
  @ViewChild('carouselViewport')
  carouselViewport?: ElementRef<HTMLElement>;

  activeCase?: Case;
  notes: CaseNote[] = [];
  loading = true;
  isAdmin = false;
  CaseStatus = CaseStatus;
  CaseType = CaseType;

  // Add Note Modal controls
  showNoteModal = false;
  noteContent = '';

  evidenceList: CaseEvidence[] = [];

  // Close Case Modal controls
  showCloseModal = false;
  closeFormData = {
    date: '',
    cost: 0,
    summary: ''
  };

  /* ---------------------------------------------------------
     CAROUSEL
  --------------------------------------------------------- */
  readonly carouselCardCount = 3;
  carouselPosition = 0;
  private animationFrameId: number | null = null;

  /* Drag state */
  isDragging = false;
  didDrag = false;

  private pointerId: number | null = null;
  private dragStartX = 0;
  private lastPointerX = 0;
  private lastPointerTime = 0;
  private dragVelocity = 0;
  private readonly dragThreshold = 6;
  private readonly flickVelocityThreshold = 0.18;

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
          this.evidenceList = this.caseService.getCaseEvidence(id);
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
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  }

  /* =========================================================
     CAROUSEL
  ========================================================= */

  /**
   * Returns the shortest circular distance from the current
   * carousel position to a card.
   *
   * -1 = left
   *  0 = center
   * +1 = right
   */
  getCardDistance(index: number): number {
    let distance = index - this.carouselPosition;
    const half = this.carouselCardCount / 2;

    while (distance > half) {
      distance -= this.carouselCardCount;
    }

    while (distance < -half) {
      distance += this.carouselCardCount;
    }

    return distance;
  }

  /**
   * Gets the transform for each card.
   *
   * The center card is large and close.
   * The side cards are smaller and pushed backwards.
   */
  getCardTransform(index: number): string {
    const distance = this.getCardDistance(index);
    const x = distance * 57;
    const rotateY = distance * -18;
    const absDistance = Math.min(Math.abs(distance), 1.25);

    const scale =
      distance === 0
        ? 1
        : 0.82 - (Math.max(absDistance - 1, 0) * 0.04);

    const translateZ =
      distance === 0
        ? 0
        : -120 * absDistance;

    return `
      translateX(${x}%)
      translateZ(${translateZ}px)
      rotateY(${rotateY}deg)
      scale(${scale})
    `;
  }

  /**
   * Controls blur for the side cards.
   */
  getCardBlur(index: number): string {
    const distance = Math.abs(this.getCardDistance(index));
    if (distance < 0.15) {
      return 'blur(0px)';
    }
    if (distance < 0.85) {
      return 'blur(0.8px)';
    }
    return 'blur(2px)';
  }

  /**
   * Controls opacity.
   */
  getCardOpacity(index: number): number {
    const distance = Math.abs(this.getCardDistance(index));
    if (distance < 0.15) {
      return 1;
    }
    if (distance < 0.9) {
      return 0.72;
    }
    return 0.45;
  }

  /**
   * Controls z-index.
   */
  getCardZIndex(index: number): number {
    const distance = Math.abs(this.getCardDistance(index));
    if (distance < 0.15) {
      return 30;
    }
    if (distance < 0.9) {
      return 20;
    }
    return 10;
  }

  /**
   * Used by the template to determine which card is currently
   * the focused card.
   */
  isFocusedCard(index: number): boolean {
    return Math.abs(this.getCardDistance(index)) < 0.15;
  }

  /**
   * Returns the logical active card index.
   */
  getActiveCardIndex(): number {
    return this.normalizeIndex(Math.round(this.carouselPosition));
  }

  /**
   * Navigate directly to a card.
   */
  goToCard(index: number): void {
    const target = this.normalizeIndex(index);

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    const current = this.carouselPosition;
    let difference = target - current;

    /*
     * Always take the shortest path around the 3-card loop.
     */
    if (difference > this.carouselCardCount / 2) {
      difference -= this.carouselCardCount;
    }

    if (difference < -this.carouselCardCount / 2) {
      difference += this.carouselCardCount;
    }

    if (Math.abs(difference) < 0.001) {
      this.carouselPosition = target;
      return;
    }

    const start = performance.now();
    const duration = 420;

    const animate = (time: number) => {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);

      /*
       * Ease-out quartic.
       * Starts quickly and gently settles into place.
       */
      const eased = 1 - Math.pow(1 - progress, 4);

      this.carouselPosition = current + difference * eased;

      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(animate);
      } else {
        this.carouselPosition = this.normalizeIndex(target);
        this.animationFrameId = null;
      }
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  /**
   * Click a side card to bring it to the center.
   */
  onCardClick(index: number): void {
    if (this.didDrag) {
      return;
    }
    this.goToCard(index);
  }

  /**
   * Previous card.
   */
  previousCard(): void {
    this.goToCard(this.getActiveCardIndex() - 1);
  }

  /**
   * Next card.
   */
  nextCard(): void {
    this.goToCard(this.getActiveCardIndex() + 1);
  }

  /* =========================================================
     POINTER / DRAG HANDLING
  ========================================================= */

  onDragStart(event: PointerEvent): void {
    /*
     * Only respond to the primary mouse button.
     */
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    if (this.showCloseModal || this.showNoteModal) {
      return;
    }

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.isDragging = true;
    this.didDrag = false;

    this.pointerId = event.pointerId;
    this.dragStartX = event.clientX;
    this.lastPointerX = event.clientX;
    this.lastPointerTime = performance.now();
    this.dragVelocity = 0;

    const viewport = this.carouselViewport?.nativeElement;
    if (viewport) {
      try {
        viewport.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture may fail in some browsers.
      }
    }

    event.preventDefault();
  }

  onDragMove(event: PointerEvent): void {
    if (!this.isDragging || event.pointerId !== this.pointerId) {
      return;
    }

    const currentX = event.clientX;
    const now = performance.now();
    const totalDelta = currentX - this.dragStartX;
    const delta = currentX - this.lastPointerX;
    const deltaTime = Math.max(now - this.lastPointerTime, 16);

    this.dragVelocity = delta / deltaTime;
    this.lastPointerX = currentX;
    this.lastPointerTime = now;

    if (Math.abs(totalDelta) > this.dragThreshold) {
      this.didDrag = true;
    }

    /*
     * Determine how many card positions the pointer has travelled.
     * Around 55% of the viewport represents one card.
     */
    const viewport = this.carouselViewport?.nativeElement;
    const width = viewport?.clientWidth || 900;
    const slideSpan = Math.max(width * 0.55, 280);

    this.carouselPosition = this.getDragStartPosition() - totalDelta / slideSpan;

    event.preventDefault();
  }

  onDragEnd(event?: PointerEvent): void {
    if (!this.isDragging) {
      return;
    }

    if (event && this.pointerId !== null && event.pointerId !== this.pointerId) {
      return;
    }

    const velocity = this.dragVelocity;
    this.isDragging = false;

    const viewport = this.carouselViewport?.nativeElement;
    if (viewport && this.pointerId !== null) {
      try {
        viewport.releasePointerCapture(this.pointerId);
      } catch {
        // Pointer capture may already be released.
      }
    }

    this.pointerId = null;

    /*
     * Work out which card should become centered.
     */
    let target = Math.round(this.carouselPosition);

    /*
     * If the user performed a fast flick,
     * move one additional card in the direction of the gesture.
     */
    if (Math.abs(velocity) > this.flickVelocityThreshold) {
      target = Math.round(this.carouselPosition - Math.sign(velocity) * 0.5);
    }

    target = this.normalizeIndex(target);
    this.goToCard(target);

    /*
     * Keep didDrag true long enough to prevent the browser's
     * subsequent click event from activating the card.
     */
    window.setTimeout(() => {
      this.didDrag = false;
    }, 80);
  }

  private getDragStartPosition(): number {
    return this.carouselPosition +
      (this.lastPointerX - this.dragStartX) /
      Math.max((this.carouselViewport?.nativeElement.clientWidth || 900) * 0.55, 280);
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
      this.previousCard();
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.nextCard();
    }
  }

  private normalizeIndex(index: number): number {
    return ((index % this.carouselCardCount) + this.carouselCardCount) % this.carouselCardCount;
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
      this.goToCard(0);
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
