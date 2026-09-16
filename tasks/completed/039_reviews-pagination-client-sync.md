# Task: Reviews Pagination Client Synchronization (`web/tasks/039_reviews-pagination-client-sync.md`)

## Execution Profile

- **Wave / Batch**: Wave 1
- **Execution Mode**: `PARALLEL`
- **Assigned Role**: `Worker Agent (Web API Client Sync)`
- **Dependencies (`depends_on`)**: `[api/tasks/022_reviews-pagination-backend.md]`
- **Collision Risk**: `LOW (Isolated services and api client)`

## Target Files

- **Exclusive**:
  - `src/services/reviews.service.ts`
  - `src/lib/api-client.ts`

## Objective

Adapt the frontend API client and service layer to natively consume the server-side paginated envelope returned by `GET /pensions/:pensionId/reviews` (`PaginatedReviewsResponse`), eliminating manual client-side array slicing (`allMapped.slice`) while maintaining seamless fallback resilience for legacy arrays.

## Technical Specifications

### 1. `src/services/reviews.service.ts` (`fetchPensionReviews`)

Update `fetchPensionReviews` to detect if the API response is already a paginated envelope:
```typescript
if (isApiSuccess(response)) {
  const rawData = response.data;
  if (
    rawData &&
    typeof rawData === 'object' &&
    'items' in rawData &&
    Array.isArray((rawData as { items: unknown[] }).items)
  ) {
    const paginatedData = rawData as {
      items: RawReviewResponse[];
      total: number;
      page: number;
      limit: number;
      hasMore?: boolean;
      totalPages?: number;
    };
    return createSuccess<PaginatedReviewsResponse>(
      {
        items: paginatedData.items.map(mapRawReviewToItem),
        total: paginatedData.total,
        page: paginatedData.page,
        limit: paginatedData.limit,
        hasMore: Boolean(paginatedData.hasMore),
      },
      response.statusCode,
    );
  }

  // Resilient fallback for legacy unpaginated arrays:
  if (Array.isArray(rawData)) {
    const allMapped = rawData.map(mapRawReviewToItem);
    const page = query?.page ?? 1;
    const limit = query?.limit ?? (allMapped.length || 10);
    const startIndex = (page - 1) * limit;
    return createSuccess<PaginatedReviewsResponse>(
      {
        items: allMapped.slice(startIndex, startIndex + limit),
        total: allMapped.length,
        page,
        limit,
        hasMore: startIndex + limit < allMapped.length,
      },
      response.statusCode,
    );
  }
}
```

### 2. `src/lib/api-client.ts` (`fetchPensionReviews`)

Update `fetchPensionReviews(pensionId: string)` to safely unpack both flat review arrays and paginated object envelopes:
```typescript
if (response.ok && data) {
  if (Array.isArray(data)) {
    return data as unknown as PensionReview[];
  }
  const obj = data as Record<string, unknown>;
  if (Array.isArray(obj.items)) {
    return obj.items as unknown as PensionReview[];
  }
  if (obj.data && Array.isArray((obj.data as Record<string, unknown>).items)) {
    return (obj.data as Record<string, unknown>).items as unknown as PensionReview[];
  }
}
```

## Checklist

- [ ] Update `fetchPensionReviews` in `src/services/reviews.service.ts` to consume native paginated data.
- [ ] Update `fetchPensionReviews` in `src/lib/api-client.ts` to support paginated envelope unpacking.
- [ ] Strict TypeScript typing notation with no `any`.
- [ ] Do NOT execute slow commands (`pnpm build`, `tsc`, `biome`).
- [ ] Stage exclusively target files and commit with `feat(reviews): sync client data layer with server-side pagination`.
