import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CaseService } from '../../services/case.service';
import { CaseType, CaseStatus } from '../../models/case.model';
import { 
  LucideCalendar, 
  LucideFilter, 
  LucideDownload, 
  LucideFileText, 
  LucideBarChart3, 
  LucidePieChart 
} from '@lucide/angular';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    LucideCalendar, 
    LucideFilter, 
    LucideDownload, 
    LucideFileText, 
    LucideBarChart3, 
    LucidePieChart
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {
  startDate = '';
  endDate = '';
  caseType: CaseType | 'ALL' = 'ALL';
  status: CaseStatus | 'ALL' = 'ALL';

  summaryData: any = null;
  Math = Math;

  constructor(private caseService: CaseService) {}

  ngOnInit() {
    // Default: start/end of current year
    const yr = new Date().getFullYear();
    this.startDate = `${yr}-01-01`;
    this.endDate = `${yr}-12-31`;
    this.generateReport();
  }

  generateReport() {
    this.caseService.getReportsSummary({
      startDate: this.startDate || undefined,
      endDate: this.endDate || undefined,
      caseType: this.caseType === 'ALL' ? undefined : (this.caseType as CaseType),
      status: this.status === 'ALL' ? undefined : (this.status as CaseStatus)
    }).subscribe((data: any) => {
      this.summaryData = data;
    });
  }

  formatCost(val: number): string {
    return val.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // SVG Donut helpers
  getPieCircumference(): number {
    return 2 * Math.PI * 70; // radius is 70 => 439.82
  }

  getPercentage(val: number): number {
    if (!this.summaryData || this.summaryData.totalCases === 0) return 0;
    return Math.round((val / this.summaryData.totalCases) * 100);
  }

  getPieOffset(index: number): number {
    if (!this.summaryData || this.summaryData.totalCases === 0) return 0;
    const circ = this.getPieCircumference();
    
    // First sector (Legal) starts at 0 offset
    if (index === 0) {
      const val = this.summaryData.caseTypesChart[0]?.value || 0;
      const pct = val / this.summaryData.totalCases;
      return circ * (1 - pct);
    }
    
    // Second sector (Labour) offset starts where Legal ends
    const val0 = this.summaryData.caseTypesChart[0]?.value || 0;
    const val1 = this.summaryData.caseTypesChart[1]?.value || 0;
    const pct0 = val0 / this.summaryData.totalCases;
    const pct1 = val1 / this.summaryData.totalCases;
    
    return circ * (1 - (pct0 + pct1));
  }

  // SVG Bar helpers
  getMaxCount(): number {
    if (!this.summaryData || this.summaryData.monthlyCasesChart.length === 0) return 10;
    const max = Math.max(...this.summaryData.monthlyCasesChart.map((b: any) => b.count));
    return max > 0 ? max : 10;
  }

  getBarHeightPercentage(count: number): number {
    const max = this.getMaxCount();
    return (count / max) * 100;
  }

  formatMonthLabel(m: string): string {
    // '2026-01' -> 'Jan'
    const parts = m.split('-');
    if (parts.length < 2) return m;
    const monthNo = parseInt(parts[1], 10);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthNo - 1] || m;
  }

  // Export handlers
  exportPDF() {
    alert('Simulating PDF Generation...\nFormatted Case Ledger Report downloaded to local downloads directory.');
  }

  exportExcel() {
    alert('Simulating Excel Export...\nCompleted compiling rows and financial cost analysis into spreadsheet format.');
  }
}
