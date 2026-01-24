// API envelope wrapper
export interface ApiEnvelope<T> {
  data: T;
}

// Auth types
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: 'Bearer';
}

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

// User types
export type UserRole = 'admin' | 'operator' | 'viewer';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// Log types
export type LogLevel = 'debug' | 'info' | 'warning' | 'error' | 'fatal';

export interface Log {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  source?: string;
  type?: string;
  agent_id?: string;
  file_path?: string;
  line_number?: number;
  fields?: Record<string, unknown>;
  labels?: Record<string, string>;
  http_status?: number;
  http_method?: string;
  uri?: string;
}

export interface LogsResponse {
  items: Log[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface LogFilters {
  start: string; // RFC3339 - required
  end?: string;
  project_id?: string; // Filter by single project
  project_ids?: string; // Comma-separated project IDs for multi-project filter
  agent_id?: string;
  level?: LogLevel;
  levels?: string; // comma-separated
  type?: string;
  source?: string;
  file_path?: string;
  q?: string;
  search_mode?: 'token' | 'substring' | 'phrase';
  page?: number;
  per_page?: number;
  order?: 'timestamp' | 'level';
  order_dir?: 'asc' | 'desc';
}

export interface LogStatsParams {
  start: string;
  end?: string;
  project_id?: string; // Filter by single project
  agent_id?: string;
  type?: string;
  interval?: string;
}

// Backend StatsResponse structure
export interface LogStats {
  error_rates: {
    total_logs: number;
    error_count: number;
    warning_count: number;
    fatal_count: number;
    error_rate: number;
  };
  top_sources: Array<{
    source: string;
    count: number;
    error_count: number;
  }>;
  volume: Array<{
    timestamp: string;
    total_count: number;
    error_count: number;
  }>;
  http_stats?: {
    total_2xx: number;
    total_3xx: number;
    total_4xx: number;
    total_5xx: number;
    top_uris?: Array<{
      uri: string;
      count: number;
    }>;
  };
}

// Alert types
export type AlertType = 'error_rate' | 'log_match' | 'threshold';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface Alert {
  id: string;
  name: string;
  description?: string;
  type: AlertType;
  condition: string;
  severity: AlertSeverity;
  window: string;
  cooldown: string;
  notify: string[];
  enabled: boolean;
  project_id: string;
  created_at: string;
  updated_at: string;
}

export interface AlertCreate {
  name: string;
  description?: string;
  type: AlertType;
  condition: string;
  severity: AlertSeverity;
  window: string;
  cooldown: string;
  notify: string[];
  enabled: boolean;
  project_id: string;
}

export interface AlertUpdate {
  name?: string;
  description?: string;
  type?: AlertType;
  condition?: string;
  severity?: AlertSeverity;
  window?: string;
  cooldown?: string;
  notify?: string[];
  enabled?: boolean;
}

// Alert history types
export interface AlertHistoryEntry {
  id: string;
  alert_id: string;
  alert_name: string;
  project_id: string;
  project_name?: string;
  triggered_at: string;
  log_count: number;
  severity: AlertSeverity;
}

export interface AlertHistoryResponse {
  items: AlertHistoryEntry[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface AlertHistoryParams {
  alert_id?: string;
  project_id?: string;
  page?: number;
  per_page?: number;
}

// Project types
export interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  name: string;
  description?: string;
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
}

export interface ProjectUser {
  user_id: string;
  username: string;
  email: string;
  role: UserRole;
}

export interface AddProjectUserRequest {
  user_id: string;
  role?: UserRole;
}

// Connection types (SSH)
export interface Connection {
  id: string;
  name: string;
  host: string;
  user: string;
  project_id?: string;
  enabled: boolean;
  last_connected_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ConnectionCreate {
  name: string;
  host: string;
  user: string;
  key_file?: string;
  project_id?: string;
  sources?: Array<{
    path: string;
    type: string;
  }>;
}

export interface ConnectionUpdate {
  name?: string;
  host?: string;
  user?: string;
  key_file?: string;
  project_id?: string;
  enabled?: boolean;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
}

// User management types (admin)
export interface UserCreate {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UserUpdate {
  username?: string;
  email?: string;
  role?: UserRole;
}

// Push notification types
export interface PushTokenRequest {
  token: string;
  platform: 'ios' | 'android';
}

// Password change types
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ResetPasswordRequest {
  password: string;
}

// Error types
export interface ApiErrorResponse {
  error: {
    code:
      | 'BAD_REQUEST'
      | 'VALIDATION_FAILED'
      | 'UNAUTHORIZED'
      | 'FORBIDDEN'
      | 'NOT_FOUND'
      | 'CONFLICT'
      | 'ACCOUNT_LOCKED'
      | 'INTERNAL_ERROR';
    message: string;
  };
}
