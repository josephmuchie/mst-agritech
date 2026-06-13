import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

type ApiErrorBody = {
  message?: string;
  errors?: string[];
};

export function getApiErrorMessage(error: unknown, fallback = 'Request failed'): string {
  if (!error || typeof error !== 'object') return fallback;

  if ('status' in error) {
    const fetchError = error as FetchBaseQueryError;
    const data = fetchError.data;
    if (data && typeof data === 'object') {
      const body = data as ApiErrorBody;
      if (body.message) return body.message;
      if (body.errors?.length) return body.errors.join('; ');
    }
    if (fetchError.status === 403) return 'You do not have permission to perform this action';
    if (fetchError.status === 404) return 'API endpoint not found — redeploy the backend with CRUD support';
    if (fetchError.status === 409) return 'A record with this value already exists';
    if (typeof fetchError.status === 'number' && fetchError.status >= 500) {
      return 'Server error — please try again';
    }
  }

  const serialized = error as SerializedError;
  if (serialized.message) return serialized.message;

  return fallback;
}
