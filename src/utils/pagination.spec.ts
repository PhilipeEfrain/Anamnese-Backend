import {
  getPaginationParams,
  createPaginationResult,
  getSortParams,
  buildSortObject,
  buildSearchFilter,
  buildDateRangeFilter,
} from "./pagination";
import { Request } from "express";

describe("Pagination Utils", () => {
  describe("getPaginationParams", () => {
    it("should return default pagination params when no query params provided", () => {
      const req = { query: {} } as Request;
      const result = getPaginationParams(req);

      expect(result).toEqual({
        page: 1,
        limit: 10,
        skip: 0,
      });
    });

    it("should parse valid pagination params from query", () => {
      const req = { query: { page: "3", limit: "20" } } as any as Request;
      const result = getPaginationParams(req);

      expect(result).toEqual({
        page: 3,
        limit: 20,
        skip: 40, // (3-1) * 20
      });
    });

    it("should enforce minimum page of 1", () => {
      const req = { query: { page: "0" } } as any as Request;
      const result = getPaginationParams(req);

      expect(result.page).toBe(1);
      expect(result.skip).toBe(0);
    });

    it("should enforce minimum limit of 1", () => {
      const req = { query: { limit: "0" } } as any as Request;
      const result = getPaginationParams(req);

      expect(result.limit).toBe(1);
    });

    it("should enforce maximum limit of 100", () => {
      const req = { query: { limit: "500" } } as any as Request;
      const result = getPaginationParams(req);

      expect(result.limit).toBe(100);
    });

    it("should handle invalid page param", () => {
      const req = { query: { page: "invalid" } } as any as Request;
      const result = getPaginationParams(req);

      expect(result.page).toBe(1);
    });

    it("should handle invalid limit param", () => {
      const req = { query: { limit: "invalid" } } as any as Request;
      const result = getPaginationParams(req);

      expect(result.limit).toBe(10);
    });

    it("should calculate correct skip value", () => {
      const req = { query: { page: "5", limit: "15" } } as any as Request;
      const result = getPaginationParams(req);

      expect(result.skip).toBe(60); // (5-1) * 15
    });
  });

  describe("createPaginationResult", () => {
    const mockData = [
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
      { id: 3, name: "Item 3" },
    ];

    it("should create correct pagination result for first page", () => {
      const result = createPaginationResult(mockData, 30, 1, 10);

      expect(result).toEqual({
        data: mockData,
        pagination: {
          page: 1,
          limit: 10,
          total: 30,
          totalPages: 3,
          hasNextPage: true,
          hasPrevPage: false,
        },
      });
    });

    it("should create correct pagination result for middle page", () => {
      const result = createPaginationResult(mockData, 30, 2, 10);

      expect(result).toEqual({
        data: mockData,
        pagination: {
          page: 2,
          limit: 10,
          total: 30,
          totalPages: 3,
          hasNextPage: true,
          hasPrevPage: true,
        },
      });
    });

    it("should create correct pagination result for last page", () => {
      const result = createPaginationResult(mockData, 30, 3, 10);

      expect(result).toEqual({
        data: mockData,
        pagination: {
          page: 3,
          limit: 10,
          total: 30,
          totalPages: 3,
          hasNextPage: false,
          hasPrevPage: true,
        },
      });
    });

    it("should handle single page result", () => {
      const result = createPaginationResult(mockData, 3, 1, 10);

      expect(result).toEqual({
        data: mockData,
        pagination: {
          page: 1,
          limit: 10,
          total: 3,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
    });

    it("should handle empty result", () => {
      const result = createPaginationResult([], 0, 1, 10);

      expect(result).toEqual({
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
    });

    it("should calculate total pages correctly with remainder", () => {
      const result = createPaginationResult(mockData, 25, 1, 10);

      expect(result.pagination.totalPages).toBe(3); // Math.ceil(25/10)
    });
  });

  describe("getSortParams", () => {
    it("should return default sort params when no query params provided", () => {
      const req = { query: {} } as Request;
      const result = getSortParams(req, "name");

      expect(result).toEqual({
        field: "name",
        order: "desc",
      });
    });

    it("should parse valid sort params from query", () => {
      const req = {
        query: { sortBy: "email", sortOrder: "asc" },
      } as any as Request;
      const result = getSortParams(req, "name");

      expect(result).toEqual({
        field: "email",
        order: "asc",
      });
    });

    it("should use custom default sort order", () => {
      const req = { query: {} } as Request;
      const result = getSortParams(req, "name", "asc");

      expect(result.order).toBe("asc");
    });

    it("should handle invalid sort order", () => {
      const req = { query: { sortOrder: "invalid" } } as any as Request;
      const result = getSortParams(req, "name");

      expect(result.order).toBe("desc");
    });

    it("should accept desc sort order", () => {
      const req = { query: { sortOrder: "desc" } } as any as Request;
      const result = getSortParams(req, "name");

      expect(result.order).toBe("desc");
    });

    it("should accept asc sort order", () => {
      const req = { query: { sortOrder: "asc" } } as any as Request;
      const result = getSortParams(req, "name");

      expect(result.order).toBe("asc");
    });
  });

  describe("buildSortObject", () => {
    it("should build sort object for ascending order", () => {
      const result = buildSortObject({ field: "name", order: "asc" });

      expect(result).toEqual({ name: 1 });
    });

    it("should build sort object for descending order", () => {
      const result = buildSortObject({ field: "date", order: "desc" });

      expect(result).toEqual({ date: -1 });
    });

    it("should handle different field names", () => {
      const result = buildSortObject({ field: "createdAt", order: "asc" });

      expect(result).toEqual({ createdAt: 1 });
    });
  });

  describe("buildSearchFilter", () => {
    it("should return null when search term is empty", () => {
      const result = buildSearchFilter("", ["name", "email"]);

      expect(result).toBeNull();
    });

    it("should return null when search term is undefined", () => {
      const result = buildSearchFilter(undefined, ["name", "email"]);

      expect(result).toBeNull();
    });

    it("should build OR filter for single field", () => {
      const result = buildSearchFilter("john", ["name"]);

      expect(result).toEqual({
        $or: [{ name: /john/i }],
      });
    });

    it("should build OR filter for multiple fields", () => {
      const result = buildSearchFilter("test", ["name", "email", "phone"]);

      expect(result).toEqual({
        $or: [{ name: /test/i }, { email: /test/i }, { phone: /test/i }],
      });
    });

    it("should handle special regex characters", () => {
      const result = buildSearchFilter("test.value", ["name"]);

      expect(result).toEqual({
        $or: [{ name: /test.value/i }],
      });
    });

    it("should be case insensitive", () => {
      const result = buildSearchFilter("JOHN", ["name"]);

      expect(result?.$or[0].name).toEqual(/JOHN/i);
      expect(result?.$or[0].name.ignoreCase).toBe(true);
    });
  });

  describe("buildDateRangeFilter", () => {
    it("should return null when both dates are missing", () => {
      const result = buildDateRangeFilter("createdAt", undefined, undefined);

      expect(result).toBeNull();
    });

    it("should build filter with only start date", () => {
      const result = buildDateRangeFilter("createdAt", "2024-01-01", undefined);

      expect(result).toEqual({
        createdAt: { $gte: new Date("2024-01-01T00:00:00.000Z") },
      });
    });

    it("should build filter with only end date", () => {
      const result = buildDateRangeFilter("createdAt", undefined, "2024-12-31");
      const expectedDate = new Date("2024-12-31T00:00:00.000Z");
      expectedDate.setHours(23, 59, 59, 999);

      expect(result).toEqual({
        createdAt: { $lte: expectedDate },
      });
    });

    it("should build filter with both dates", () => {
      const result = buildDateRangeFilter(
        "createdAt",
        "2024-01-01",
        "2024-12-31"
      );
      const expectedEndDate = new Date("2024-12-31T00:00:00.000Z");
      expectedEndDate.setHours(23, 59, 59, 999);

      expect(result).toEqual({
        createdAt: {
          $gte: new Date("2024-01-01T00:00:00.000Z"),
          $lte: expectedEndDate,
        },
      });
    });

    it("should handle different field names", () => {
      const result = buildDateRangeFilter("date", "2024-01-01", undefined);

      expect(result).toEqual({
        date: { $gte: new Date("2024-01-01T00:00:00.000Z") },
      });
    });

    it("should set end date to end of day", () => {
      const result = buildDateRangeFilter("date", undefined, "2024-06-15");
      const date = (result as any).date.$lte;

      expect(date.getHours()).toBe(23);
      expect(date.getMinutes()).toBe(59);
      expect(date.getSeconds()).toBe(59);
      expect(date.getMilliseconds()).toBe(999);
    });

    it("should handle empty string dates as missing", () => {
      const result = buildDateRangeFilter("date", "", "");

      expect(result).toBeNull();
    });
  });
});
