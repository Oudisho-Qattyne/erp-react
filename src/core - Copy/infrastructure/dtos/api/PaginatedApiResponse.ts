export interface PaginatedApiResponseInterface<T> {
    status: 'Success';
    plan: null,
    pagination: {
        lastPage: number | null,
        currentPage: number | null,
        hasMore: boolean | null,
        total: number
    },
    data: T[]
}
