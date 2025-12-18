import { z } from 'zod';
import { compressionStatsSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  compression: {
    upload: {
      method: 'POST' as const,
      path: '/api/compress',
      // Input is FormData, handled specially in frontend/backend
      responses: {
        200: compressionStatsSchema,
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
    decompress: {
      method: 'POST' as const,
      path: '/api/decompress',
      // Input is FormData
      responses: {
        200: z.any(), // File download
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
