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
  VIEWER = "VIEWER"
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
  createdAt: string;
  updatedAt: string;
}

export interface CaseNote {
  noteId: string;
  caseId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface User {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}
