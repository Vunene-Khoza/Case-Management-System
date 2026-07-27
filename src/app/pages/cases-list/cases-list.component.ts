import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CaseService } from '../../services/case.service';
import { Case, CaseStatus, CaseType } from '../../models/case.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { 
  LucideSearch, 
  LucideFilter, 
  LucideCalendar, 
  LucideChevronLeft, 
  LucideChevronRight, 
  LucideEye, 
  LucideEdit2, 
  LucidePlus 
} from '@lucide/angular';

@Component({
  selector: 'app-cases-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule, 
    LucideSearch, 
    LucideFilter, 
    LucideCalendar, 
    LucideChevronLeft, 
    LucideChevronRight, 
    LucideEye, 
    LucideEdit2, 
    LucidePlus
  ],
  templateUrl: './cases-list.component.html',
  styleUrl: './cases-list.component.css'
})
export class CasesListComponent implements OnInit {
  cases: Case[] = [];
  totalCases = 0;
  totalPages = 1;
  currentPage = 1;
  pageSize = 5;
  loading = true;

  searchQuery = '';
  selectedType = '';
  selectedStatus = '';

  CaseType = CaseType;
  CaseStatus = CaseStatus;

  private searchSubject = new Subject<string>();

  constructor(private caseService: CaseService) {}

  ngOnInit() {
    this.loadCases();

    this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadCases();
    });
  }

  loadCases() {
    this.loading = true;
    this.caseService.getCases({
      page: this.currentPage,
      limit: this.pageSize,
      search: this.searchQuery,
      caseType: this.selectedType as CaseType || undefined,
      status: this.selectedStatus as CaseStatus || undefined
    }).subscribe({
      next: (response) => {
        this.cases = response.items;
        this.totalCases = response.totalItems;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onSearchChange(val: string) {
    this.searchSubject.next(val);
  }

  applyFilters() {
    this.currentPage = 1;
    this.loadCases();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadCases();
    }
  }

  getPagesArray(): number[] {
    const arr = [];
    for (let i = 1; i <= this.totalPages; i++) {
      arr.push(i);
    }
    return arr;
  }

  getMathMin(a: number, b: number): number {
    return Math.min(a, b);
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
}
