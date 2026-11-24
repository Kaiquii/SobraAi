export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;
export const USERS_PAGE_LIMIT = 8;
export const APP_VERSIONS_PAGE_LIMIT = 5;
export const ADMIN_TABLE_ROW_HEIGHT = 48;

export type Pagination = {
  has_next: boolean;
  has_previous: boolean;
  limit: number;
  page: number;
  total: number;
  total_pages: number;
};

export type PaginationParams = {
  limit: number;
  page: number;
};

type ParsedPagination =
  | { error: string; params?: never }
  | { error?: never; params?: PaginationParams };

function parseInteger(value: string | null) {
  if (value === null || !/^\d+$/.test(value)) return null;
  const parsedValue = Number(value);
  return Number.isSafeInteger(parsedValue) ? parsedValue : null;
}

export function parsePaginationParams(
  searchParams: URLSearchParams,
): ParsedPagination {
  const pageValue = searchParams.get("page");
  const limitValue = searchParams.get("limit");

  if (pageValue === null && limitValue === null) return {};

  const page = pageValue === null ? DEFAULT_PAGE : parseInteger(pageValue);
  const limit =
    limitValue === null ? DEFAULT_PAGE_LIMIT : parseInteger(limitValue);

  if (page === null || page < 1) {
    return { error: "page deve ser maior ou igual a 1" };
  }

  if (limit === null || limit < 1 || limit > MAX_PAGE_LIMIT) {
    return { error: "limit deve estar entre 1 e 100" };
  }

  return { params: { limit, page } };
}
