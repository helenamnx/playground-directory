/**
 * Class representing a paginated result.
 * @template T - The type of data contained in the paginated result.
 */
export class PaginatedResult<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  previousPage: number | null;
  nextPage: number | null;

  /**
   * Creates an instance of PaginatedResult.
   * @param {T[]} data - The data for the current page.
   * @param {Object} paginationParams - The pagination parameters.
   * @param {number} paginationParams.totalDocs - The total number of documents.
   * @param {number} paginationParams.currentPage - The current page number.
   * @param {number} paginationParams.limit - The number of documents per page.
   */
  constructor(
    data: T[],
    paginationParams: {
      totalDocs: number;
      currentPage: number;
      limit: number;
    },
  ) {
    const { totalDocs, currentPage, limit } = paginationParams;

    this.data = data;
    this.currentPage = currentPage;

    // Calculate the total number of pages based on the total number of documents and the limit
    this.totalPages = Math.ceil(totalDocs / limit);
    // Set the total count of documents
    this.totalRecords = totalDocs;

    this.previousPage = this.getPreviousPage();
    this.nextPage = this.getNextPage();
  }

  /**
   * Get the data for the current page.
   * @returns {T[]} The data for the current page.
   */
  getCurrentPageData(): T[] {
    return this.data;
  }

  /**
   * Check if there is a previous page and return the number of the previous page.
   * @returns {number | null} The number of the previous page, or null if there is no previous page.
   */
  getPreviousPage(): number | null {
    return this.currentPage > 1 ? this.currentPage - 1 : null;
  }

  /**
   * Check if there is a next page and return the number of the next page.
   * @returns {number | null} The number of the next page, or null if there is no next page.
   */
  getNextPage(): number | null {
    return this.currentPage < this.totalPages ? this.currentPage + 1 : null;
  }
}
