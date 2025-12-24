import { AxiosError } from 'axios';
import { ApiError, handleApiError, getErrorMessage, ApiErrorResponse } from '@/utils/errors';

describe('ApiError', () => {
  it('should extract code and message from AxiosError response', () => {
    const axiosError = {
      response: {
        data: {
          error: {
            code: 'UNAUTHORIZED' as const,
            message: 'Invalid credentials',
          },
        },
        status: 401,
      },
    } as AxiosError<ApiErrorResponse>;

    const apiError = new ApiError(axiosError);

    expect(apiError.code).toBe('UNAUTHORIZED');
    expect(apiError.message).toBe('Invalid credentials');
    expect(apiError.status).toBe(401);
    expect(apiError.name).toBe('ApiError');
  });

  it('should use defaults when response is missing', () => {
    const axiosError = {} as AxiosError<ApiErrorResponse>;

    const apiError = new ApiError(axiosError);

    expect(apiError.code).toBe('INTERNAL_ERROR');
    expect(apiError.message).toBe('An error occurred');
    expect(apiError.status).toBe(500);
  });
});

describe('handleApiError', () => {
  it('should return ApiError unchanged', () => {
    const existingError = new ApiError({
      response: {
        data: { error: { code: 'NOT_FOUND' as const, message: 'Not found' } },
        status: 404,
      },
    } as AxiosError<ApiErrorResponse>);

    const result = handleApiError(existingError);

    expect(result).toBe(existingError);
  });

  it('should convert AxiosError to ApiError', () => {
    const axiosError = new AxiosError('Request failed');
    axiosError.response = {
      data: { error: { code: 'BAD_REQUEST', message: 'Invalid input' } },
      status: 400,
    } as AxiosError['response'];

    const result = handleApiError(axiosError);

    expect(result).toBeInstanceOf(ApiError);
    expect(result.code).toBe('BAD_REQUEST');
    expect(result.message).toBe('Invalid input');
  });

  it('should wrap unknown error in ApiError', () => {
    const unknownError = new Error('Something went wrong');

    const result = handleApiError(unknownError);

    expect(result).toBeInstanceOf(ApiError);
    expect(result.code).toBe('INTERNAL_ERROR');
    expect(result.message).toBe('Something went wrong');
    expect(result.status).toBe(500);
  });

  it('should handle string errors', () => {
    const result = handleApiError('String error message');

    expect(result).toBeInstanceOf(ApiError);
    expect(result.code).toBe('INTERNAL_ERROR');
    expect(result.message).toBe('String error message');
  });
});

describe('getErrorMessage', () => {
  it('should return mapped message for known error codes', () => {
    const axiosError = new AxiosError('Unauthorized');
    axiosError.response = {
      data: { error: { code: 'UNAUTHORIZED', message: 'Auth failed' } },
      status: 401,
    } as AxiosError['response'];

    const message = getErrorMessage(axiosError);

    expect(message).toBe('Please sign in again');
  });

  it('should return original message for unknown codes', () => {
    const axiosError = new AxiosError('Unknown error');
    axiosError.response = {
      data: { error: { code: 'UNKNOWN_CODE', message: 'Custom error' } },
      status: 500,
    } as AxiosError['response'];

    const message = getErrorMessage(axiosError);

    expect(message).toBe('Custom error');
  });
});
