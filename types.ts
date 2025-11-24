export enum AppView {
  HOME = 'HOME',
  SESSION = 'SESSION',
  SUPPORT = 'SUPPORT',
  RESOURCES = 'RESOURCES',
  CONTACTS = 'CONTACTS',
  ESCALATION = 'ESCALATION',
  HISTORY = 'HISTORY'
}

export enum SessionState {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  CHECK_IN = 'CHECK_IN', // Timer expired, asking user if they are okay
  EMERGENCY = 'EMERGENCY' // User failed to respond, alert triggered
}

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum EscalationAction {
  SMS = 'SMS',
  CALL = 'CALL'
}

export interface EscalationPlan {
  action: EscalationAction;
  includeLocation: boolean;
  contactIds: string[];
}

export type SessionStatus = 'SAFE' | 'ALERT';

export interface SessionRecord {
  id: string;
  timestamp: string; // ISO string
  durationSeconds: number;
  substance?: string;
  status: SessionStatus;
}