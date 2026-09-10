export enum CaseType {
  LEGAL = "LEGAL",
  LABOUR = "LABOUR"
}

export enum CaseClassification {
  DISCIPLINARY = "DISCIPLINARY",
  DISPUTE = "DISPUTE",
  LITIGATION = "LITIGATION"
}

export enum CaseStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  CLOSED = "CLOSED"
}

export enum UserRole {
  ADMIN = "ADMIN",
  LEGAL_OFFICER = "LEGAL_OFFICER",
  VIEWER = "VIEWER",
  SUPER_ADMIN = "SUPER_ADMIN"
}

export interface Case {
  caseId: string;
  employeeNumber: string;
  employeeName: string;
  caseType: CaseType;
  classification: CaseClassification;
  description: string;
  dateOpened: string;
  trialDate?: string | null;
  reminderDates: string[];
  status: CaseStatus;
  closureDate?: string | null;
  finalNotes?: string | null;
  costing: number;
  assignedOfficer?: string;
  assignedRole?: string;
  evidence?: CaseEvidence[];
  createdAt: string;
  updatedAt: string;
}

export interface CaseEvidence {
  id: string;
  name: string;
  size: number;
  formattedSize: string;
  fileCategory: 'pdf' | 'word' | 'video' | 'image' | 'other';
  mimeType: string;
  uploadedAt: string;
  dataUrl?: string;
}

export interface CaseNote {
  noteId: string;
  caseId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface UniversityEmployee {
  employeeNumber: string;
  name: string;
  surname: string;
  email: string;
  phoneNumber: string;
  idNumber: string;
  department: string;
}

export interface User {
  userId: string;
  name: string;
  surname?: string;
  email: string;
  role: UserRole;
  status: "ACTIVE" | "INACTIVE";
  staffNumber?: string;
  phoneNumber?: string;
  idNumber?: string;
  department?: string;
  lastLogin?: string;
  mustChangePassword?: boolean;
  firstLoginCompleted?: boolean;
  temporaryPassword?: string;
  createdBy?: string;
  createdAt: string;
}
