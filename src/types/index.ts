// User roles
export enum UserRole {
  PLATFORM_ADMIN = 'platform_admin',
  CLIENT_SUPERVISOR = 'client_supervisor',
  CLIENT_AGENT = 'client_agent',
  CLIENT_EXECUTIVE = 'client_executive',
  EXTERNAL_CLIENT = 'external_client',
}

// Client interface
export interface Client {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'suspended';
  plan: 'basic' | 'professional' | 'enterprise';
}

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: UserRole;
  clientId?: string;
  client?: Client;
  language?: 'en' | 'es';
  lastLogin?: string;
  user_metadata?: {
    name?: string;
    role_id?: string;
  };
}

// Ticket types
export enum TicketType {
  INCIDENT = 'incident',
  REQUEST = 'request',
  QUESTION = 'question',
  FEEDBACK = 'feedback'
}

// Ticket priorities
export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Ticket status
export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  REOPENED = 'reopened',
  ESCALATED = 'escalated'
}

// SLA status
export enum SLAStatus {
  ON_TIME = 'on_time',
  NEAR_DEADLINE = 'near_deadline',
  OVERDUE = 'overdue',
}

// Ticket interface
export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  type: TicketType;
  category?: string;
  subcategory?: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  firstResponseAt?: string;
  clientId: string;
  clientName?: string;
  userId: string;
  assignedTo?: string;
  slaStatus?: 'compliant' | 'breached' | 'warning';
  user?: User;
  assignee?: User;
}

// Escalation record
export interface EscalationRecord {
  id: string;
  ticketId: string;
  fromLevel: number;
  toLevel: number;
  fromUserId?: string;
  toUserId: string;
  reason: string;
  timestamp: string;
}

// Comment interface
export interface Comment {
  id: string;
  ticketId: string;
  content: string;
  isInternal: boolean;
  createdBy: string;
  createdAt: string;
}

// Dashboard stats
export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  escalatedTickets: number;
  slaCompliance: number;
  averageResponseTime: number;
  ticketsByPriority: Record<TicketPriority, number>;
  ticketsByStatus: Record<TicketStatus, number>;
  recentTickets: Ticket[];
}

export type ProfileStatus = 'active' | 'inactive' | 'suspended';

export interface UserRoleType {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface UserRoleAssignment {
  id: string;
  user_id: string;
  role_id: string;
  created_at: string;
  updated_at: string;
}