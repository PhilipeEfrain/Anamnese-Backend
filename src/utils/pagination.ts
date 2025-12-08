import { Request } from "express";

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface SortParams {
  field: string;
  order: "asc" | "desc";
}

export function getPaginationParams(req: Request): PaginationParams {
  const pageNum = parseInt(req.query.page as string);
  const limitNum = parseInt(req.query.limit as string);

  const page = Math.max(1, isNaN(pageNum) ? 1 : pageNum);
  const limit = Math.min(100, Math.max(1, isNaN(limitNum) ? 10 : limitNum));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function createPaginationResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginationResult<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

export interface SortParams {
  field: string;
  order: "asc" | "desc";
}

export function getSortParams(
  req: Request,
  defaultField = "createdAt",
  defaultOrder: "asc" | "desc" = "desc"
): SortParams {
  const sortBy = (req.query.sortBy as string) || defaultField;
  const sortOrder =
    (req.query.sortOrder as string) === "asc"
      ? "asc"
      : (req.query.sortOrder as string) === "desc"
      ? "desc"
      : defaultOrder;

  return {
    field: sortBy,
    order: sortOrder,
  };
}

export function buildSortObject(sort: SortParams): Record<string, 1 | -1> {
  return {
    [sort.field]: sort.order === "asc" ? 1 : -1,
  };
}

export function buildSearchFilter(
  searchTerm: string | undefined,
  searchFields: string[]
): any {
  if (!searchTerm || searchTerm.trim() === "") {
    return null;
  }

  const regex = new RegExp(searchTerm.trim(), "i");
  return {
    $or: searchFields.map((field) => ({ [field]: regex })),
  };
}

export function buildDateRangeFilter(
  dateField: string,
  startDate: string | undefined,
  endDate: string | undefined
): any {
  if (
    (!startDate || startDate.trim() === "") &&
    (!endDate || endDate.trim() === "")
  ) {
    return null;
  }

  const filter: any = {};

  if (startDate && startDate.trim() !== "") {
    filter.$gte = new Date(startDate);
  }

  if (endDate && endDate.trim() !== "") {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    filter.$lte = end;
  }

  return Object.keys(filter).length > 0 ? { [dateField]: filter } : null;
}
