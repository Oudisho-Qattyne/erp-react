export interface DpomainResponsePaginated<T> {
        "status": string;
        "message": string;
        "lastPage"?: number;
        "currentPage"?: number;
        "hasMore"?: boolean;
        "total"?: boolean;
        "options"?: {
          "path": string;
          "pageName": string;
        },
        "data": T
      }
