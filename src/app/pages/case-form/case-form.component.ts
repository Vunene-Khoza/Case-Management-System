import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CaseService } from '../../services/case.service';
import { CaseClassification, CaseType, User, CaseEvidence } from '../../models/case.model';

@Component({
  selector: 'app-case-form',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule
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
    caseType: '' as any,
    classification: '' as any,
    description: '',
    dateOpened: '',
    trialDate: '',
    reminderDates: [] as string[],
    costing: null as any,
    assignedOfficer: '',
    assignedRole: 'Legal Officer'
  };

  legalOfficers: User[] = [];
  selectedOfficerDetails: User | null = null;
  isLoadingOfficers = false;

  // Evidence state
  evidenceList: CaseEvidence[] = [];
  isDraggingFile = false;
  uploadErrorMessage = '';

  newReminderDate = '';
  initialNote = '';

  // Dropdown list
  classifications = Object.values(CaseClassification);

  isFormValid(): boolean {
    const f = this.formData;
    const hasEmpNum = !!f.employeeNumber && f.employeeNumber.trim().length > 0;
    const hasEmpName = !!f.employeeName && f.employeeName.trim().length > 0;
    const hasType = !!f.caseType && f.caseType.toString().trim().length > 0;
    const hasClass = !!f.classification && f.classification.toString().trim().length > 0;
    const hasDesc = !!f.description && f.description.trim().length > 0;
    const hasDateOpened = !!f.dateOpened && f.dateOpened.trim().length > 0;
    const hasTrialDate = !!f.trialDate && f.trialDate.trim().length > 0;
    const hasCosting = f.costing !== null && f.costing !== undefined && (f.costing as any) !== '' && !isNaN(Number(f.costing)) && Number(f.costing) >= 0;
    const hasOfficer = !!f.assignedOfficer && f.assignedOfficer.trim().length > 0;
    const hasInitialNote = this.isEditMode ? true : (!!this.initialNote && this.initialNote.trim().length > 0);

    return hasEmpNum && hasEmpName && hasType && hasClass && hasDesc && hasDateOpened && hasTrialDate && hasCosting && hasOfficer && hasInitialNote;
  }

  getMissingFields(): string[] {
    const missing: string[] = [];
    const f = this.formData;
    if (!f.employeeNumber || !f.employeeNumber.trim()) missing.push('Employee Number');
    if (!f.employeeName || !f.employeeName.trim()) missing.push('Employee Name');
    if (!f.caseType) missing.push('Case Type');
    if (!f.classification) missing.push('Classification');
    if (!f.description || !f.description.trim()) missing.push('Case Description');
    if (!f.dateOpened || !f.dateOpened.trim()) missing.push('Date Opened');
    if (!f.trialDate || !f.trialDate.trim()) missing.push('Trial Date');
    if (f.costing === null || f.costing === undefined || (f.costing as any) === '' || isNaN(Number(f.costing))) missing.push('Estimated Cost');
    if (!f.assignedOfficer || !f.assignedOfficer.trim()) missing.push('Legal Officer');
    if (!this.isEditMode && (!this.initialNote || !this.initialNote.trim())) missing.push('Initial Note / Observations');
    return missing;
  }

  constructor(
    private caseService: CaseService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Set default open date to today
    this.formData.dateOpened = new Date().toISOString().split('T')[0];

    // Load legal officers available to assign
    this.loadLegalOfficers();

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

  loadLegalOfficers() {
    this.isLoadingOfficers = true;
    this.caseService.getLegalOfficersForAdmin().subscribe({
      next: (officers) => {
        this.legalOfficers = officers;
        this.isLoadingOfficers = false;
        this.updateSelectedOfficerDetails();
      },
      error: (err) => {
        console.warn('Failed to load legal officers for admin:', err);
        this.isLoadingOfficers = false;
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
          costing: c.costing,
          assignedOfficer: c.assignedOfficer || '',
          assignedRole: c.assignedRole || 'Legal Officer'
        };
        this.updateSelectedOfficerDetails();
        this.evidenceList = this.caseService.getCaseEvidence(id);
      } else {
        // Redirection if not found
        alert('Case not found.');
        this.router.navigate(['/cases']);
      }
    });
  }

  onEmployeeNumberChange() {
    // Auto-populate employee name for specific test staff IDs
    const num = this.formData.employeeNumber ? this.formData.employeeNumber.trim() : '';
    if (!num) {
      this.formData.employeeName = '';
      return;
    }

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
    } else {
      // General fallback for any staff ID entered
      this.formData.employeeName = `Staff Member (${num})`;
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

  onOfficerChange() {
    this.updateSelectedOfficerDetails();
  }

  updateSelectedOfficerDetails() {
    if (!this.formData.assignedOfficer) {
      this.selectedOfficerDetails = null;
      return;
    }
    const found = this.legalOfficers.find(o => 
      o.name.trim().toLowerCase() === this.formData.assignedOfficer.trim().toLowerCase() ||
      o.email.trim().toLowerCase() === this.formData.assignedOfficer.trim().toLowerCase()
    );
    this.selectedOfficerDetails = found || null;
  }

  openDatePicker(input: HTMLInputElement): void {
    if (input && typeof input.showPicker === 'function') {
      try {
        input.showPicker();
      } catch {
        input.focus();
      }
    } else if (input) {
      input.focus();
    }
  }

  saveCase() {
    // If a reminder date was typed in the input, auto-commit it
    if (this.newReminderDate) {
      this.addReminder();
    }

    // Validate inputs
    if (!this.isFormValid()) {
      const missing = this.getMissingFields();
      alert('Please fill in all required fields before saving:\n\n• ' + missing.join('\n• '));
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
        costing: this.formData.costing,
        assignedOfficer: this.formData.assignedOfficer || undefined,
        assignedRole: this.formData.assignedOfficer ? (this.formData.assignedRole || 'Legal Officer') : undefined
      }).subscribe(() => {
        this.caseService.saveCaseEvidence(this.caseId!, this.evidenceList);
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
        assignedOfficer: this.formData.assignedOfficer || undefined,
        assignedRole: this.formData.assignedOfficer ? (this.formData.assignedRole || 'Legal Officer') : undefined,
        initialNote: this.initialNote
      }).subscribe(newCase => {
        this.caseService.saveCaseEvidence(newCase.caseId, this.evidenceList);
        alert(`Case created successfully! Assigned Case ID: ${newCase.caseId}`);
        this.router.navigate(['/cases', newCase.caseId]);
      });
    }
  }

  // ================= EVIDENCE FILE HANDLING =================

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingFile = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingFile = false;
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingFile = false;
    if (event.dataTransfer && event.dataTransfer.files) {
      this.processFiles(event.dataTransfer.files);
    }
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFiles(input.files);
      input.value = '';
    }
  }

  processFiles(files: FileList | File[]) {
    this.uploadErrorMessage = '';
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.mp4', '.mov', '.avi', '.mkv', '.webm', '.jpg', '.jpeg', '.png', '.webp'];

    Array.from(files).forEach(file => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        this.uploadErrorMessage = `File "${file.name}" is not supported. Please upload PDF, Word document, video, or image (JPEG/PNG).`;
        return;
      }

      // Max size limit: 50MB
      if (file.size > 50 * 1024 * 1024) {
        this.uploadErrorMessage = `File "${file.name}" exceeds the 50MB size limit.`;
        return;
      }

      const fileCategory = this.getFileCategory(file.name, file.type);
      const newEvidence: CaseEvidence = {
        id: 'ev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        name: file.name,
        size: file.size,
        formattedSize: this.formatFileSize(file.size),
        fileCategory,
        mimeType: file.type || 'application/octet-stream',
        uploadedAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
      };

      // Generate preview dataUrl for images
      if (fileCategory === 'image') {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          newEvidence.dataUrl = e.target.result;
        };
        reader.readAsDataURL(file);
      }

      this.evidenceList.push(newEvidence);
    });
  }

  getFileCategory(fileName: string, mimeType: string): 'pdf' | 'word' | 'video' | 'image' | 'other' {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf' || mimeType.includes('pdf')) return 'pdf';
    if (['doc', 'docx'].includes(ext) || mimeType.includes('word') || mimeType.includes('officedocument')) return 'word';
    if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext) || mimeType.includes('video')) return 'video';
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) || mimeType.includes('image')) return 'image';
    return 'other';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  getTotalEvidenceSize(): string {
    const totalBytes = this.evidenceList.reduce((acc, item) => acc + (item.size || 0), 0);
    return this.formatFileSize(totalBytes);
  }

  removeEvidence(index: number) {
    this.evidenceList.splice(index, 1);
  }

  goBack() {
    if (this.isEditMode && this.caseId) {
      this.router.navigate(['/cases', this.caseId]);
    } else {
      this.router.navigate(['/cases']);
    }
  }
}
