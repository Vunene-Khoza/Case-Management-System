import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CaseService } from '../../services/case.service';
import { CaseClassification, CaseType } from '../../models/case.model';
import { 
  LucideArrowLeft, 
  LucidePlus, 
  LucideTrash2, 
  LucideSave, 
  LucideX, 
  LucideCalendar 
} from '@lucide/angular';

@Component({
  selector: 'app-case-form',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    LucideArrowLeft, 
    LucidePlus, 
    LucideTrash2, 
    LucideSave, 
    LucideX, 
    LucideCalendar
  ],
  templateUrl: './case-form.component.html',
  styleUrl: './case-form.component.css'
})
export class CaseFormComponent implements OnInit {
  isEditMode = false;
  caseId: string | null = null;
  CaseType = CaseType;

  // Form Model
  formData = {
    employeeNumber: '',
    employeeName: '',
    caseType: CaseType.LEGAL,
    classification: CaseClassification.DISCIPLINARY,
    description: '',
    dateOpened: '',
    trialDate: '',
    reminderDates: [] as string[],
    costing: 0
  };

  newReminderDate = '';
  initialNote = '';

  // Dropdown list
  classifications = Object.values(CaseClassification);

  constructor(
    private caseService: CaseService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Set default open date to today
    this.formData.dateOpened = new Date().toISOString().split('T')[0];

    // Determine if Edit or Create mode
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.caseId = id;
        this.loadCaseData(id);
      }
    });
  }

  loadCaseData(id: string) {
    this.caseService.getCaseById(id).subscribe(c => {
      if (c) {
        this.formData = {
          employeeNumber: c.employeeNumber,
          employeeName: c.employeeName,
          caseType: c.caseType,
          classification: c.classification,
          description: c.description,
          dateOpened: c.dateOpened,
          trialDate: c.trialDate || '',
          reminderDates: [...c.reminderDates],
          costing: c.costing
        };
      } else {
        // Redirection if not found
        alert('Case not found.');
        this.router.navigate(['/cases']);
      }
    });
  }

  onEmployeeNumberChange() {
    // Auto-populate employee name for specific test staff IDs
    const num = this.formData.employeeNumber;
    if (num === '12345') {
      this.formData.employeeName = 'John Doe';
    } else if (num === '67890') {
      this.formData.employeeName = 'Mary Khumalo';
    } else if (num === '11223') {
      this.formData.employeeName = 'David Baloyi';
    } else if (num === '44556') {
      this.formData.employeeName = 'Sarah Mokoena';
    } else if (num === '77889') {
      this.formData.employeeName = 'Peter Netshiluvhi';
    } else if (num && num.length >= 4 && !isNaN(Number(num))) {
      // General fallbacks
      this.formData.employeeName = `Employee Univen-${num}`;
    }
  }

  formatClassificationLabel(classification: string): string {
    return classification.replace('_', ' ');
  }

  addReminder() {
    if (this.newReminderDate && !this.formData.reminderDates.includes(this.newReminderDate)) {
      this.formData.reminderDates.push(this.newReminderDate);
      this.formData.reminderDates.sort(); // Keep sorted chronologically
      this.newReminderDate = '';
    }
  }

  removeReminder(index: number) {
    this.formData.reminderDates.splice(index, 1);
  }

  saveCase() {
    // Validate inputs
    if (!this.formData.employeeNumber || !this.formData.employeeName || !this.formData.description) {
      alert('Please fill in all required fields.');
      return;
    }

    if (this.isEditMode && this.caseId) {
      // Save Updates
      this.caseService.updateCase(this.caseId, {
        employeeNumber: this.formData.employeeNumber,
        employeeName: this.formData.employeeName,
        caseType: this.formData.caseType,
        classification: this.formData.classification,
        description: this.formData.description,
        dateOpened: this.formData.dateOpened,
        trialDate: this.formData.trialDate || null,
        reminderDates: this.formData.reminderDates,
        costing: this.formData.costing
      }).subscribe(() => {
        alert('Case saved successfully!');
        this.router.navigate(['/cases', this.caseId]);
      });
    } else {
      // Save New Case
      this.caseService.createCase({
        employeeNumber: this.formData.employeeNumber,
        employeeName: this.formData.employeeName,
        caseType: this.formData.caseType,
        classification: this.formData.classification,
        description: this.formData.description,
        dateOpened: this.formData.dateOpened,
        trialDate: this.formData.trialDate || null,
        reminderDates: this.formData.reminderDates,
        costing: this.formData.costing,
        initialNote: this.initialNote
      }).subscribe(newCase => {
        alert(`Case created successfully! Assigned Case ID: ${newCase.caseId}`);
        this.router.navigate(['/cases', newCase.caseId]);
      });
    }
  }

  goBack() {
    if (this.isEditMode && this.caseId) {
      this.router.navigate(['/cases', this.caseId]);
    } else {
      this.router.navigate(['/cases']);
    }
  }
}
