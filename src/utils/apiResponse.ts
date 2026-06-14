export type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PaginatedData<T> = {
  data: T[];
  pagination?: Pagination;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const unwrapApiData = <T>(payload: unknown): T => {
  if (isRecord(payload) && typeof payload.success === 'boolean' && 'data' in payload) {
    return payload.data as T;
  }

  return payload as T;
};

export const getApiCollection = <T>(payload: unknown): T[] => {
  const data = unwrapApiData<unknown>(payload);

  if (Array.isArray(data)) {
    return data as T[];
  }

  if (isRecord(data) && Array.isArray(data.data)) {
    return data.data as T[];
  }

  return [];
};

export const getPaginatedData = <T>(payload: unknown): PaginatedData<T> => {
  const data = unwrapApiData<unknown>(payload);

  if (Array.isArray(data)) {
    return { data: data as T[] };
  }

  if (isRecord(data) && Array.isArray(data.data)) {
    return {
      data: data.data as T[],
      pagination: data.pagination as Pagination | undefined,
    };
  }

  return { data: [] };
};
