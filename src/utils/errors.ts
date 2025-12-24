import { AxiosError } from 'axios';
import { Alert } from 'react-native';

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

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(error: AxiosError<ApiErrorResponse>) {
    super(error.response?.data?.error?.message ?? 'An error occurred');
    this.name = 'ApiError';
    this.code = error.response?.data?.error?.code ?? 'INTERNAL_ERROR';
    this.status = error.response?.status ?? 500;
  }
}

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }
  if (error instanceof AxiosError) {
    return new ApiError(error);
  }
  // Unknown error - wrap in ApiError-like structure
  const message = error instanceof Error ? error.message : String(error);
  return new ApiError({
    response: {
      data: { error: { code: 'INTERNAL_ERROR', message } },
      status: 500,
    },
  } as AxiosError<ApiErrorResponse>);
};

const ERROR_MESSAGES: Record<string, string> = {
  BAD_REQUEST: 'Invalid request',
  VALIDATION_FAILED: 'Please check the form fields',
  UNAUTHORIZED: 'Please sign in again',
  FORBIDDEN: 'You do not have access',
  NOT_FOUND: 'Requested resource was not found',
  CONFLICT: 'Request conflict. Please retry',
  ACCOUNT_LOCKED: 'Account locked. Try again later',
  INTERNAL_ERROR: 'Something went wrong. Please try again.',
};

export const showErrorAlert = (error: ApiError, title = 'Error') => {
  const message = ERROR_MESSAGES[error.code] ?? error.message;
  Alert.alert(title, message);
};

export const getErrorMessage = (error: unknown): string => {
  const apiError = handleApiError(error);
  return ERROR_MESSAGES[apiError.code] ?? apiError.message;
};
