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
  agent_id?: string;
  type?: string;
  interval?: string;
}

export interface LogStats {
  total: number;
  by_level: Record<LogLevel, number>;
  buckets: Array<{
    timestamp: string;
    count: number;
  }>;
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

// Project types
export interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
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
