# Task: Fix Pension Rating and Contract Mappers (`web/tasks/030_fix-pension-rating-and-contract-mappers.md`)

## Execution Profile

- **Wave / Batch**: Wave 1
- **Execution Mode**: `PARALLEL`
- **Assigned Role**: `Worker Agent (Web Contracts)`
- **Dependencies (`depends_on`)**: `[]`
- **Collision Risk**: `LOW (Core contract types and mapper functions)`

## Target Files

- **Exclusive**:
  - `src/types/api-contracts.ts`
  - `src/lib/types.ts`
  - `src/services/pensions.service.ts`
  - `src/lib/api-client.ts`

## Objective

Resolve the "Nuevo" rating bug on the map and explore screen, fix the stream consumption bug in `fetchPensionReviews`, and standardize rating and image types across DTOs and entities.

## Technical Specifications

1. **`src/types/api-contracts.ts`**:
   - Add `ratingAverage?: number;` to `PensionItemDto` alongside `averageRating?: number;`.
   - Add `ratingCount?: number;` to `PensionItemDto` alongside `reviewsCount?: number;`.

2. **`src/services/pensions.service.ts` (`mapPensionItemDto`)**:
   - Extract `const parsedRating = raw.averageRating !== undefined && raw.averageRating !== null ? Number(raw.averageRating) : raw.ratingAverage !== undefined && raw.ratingAverage !== null ? Number(raw.ratingAverage) : undefined;`
   - Extract `const parsedReviewsCount = raw.reviewsCount !== undefined && raw.reviewsCount !== null ? Number(raw.reviewsCount) : raw.ratingCount !== undefined && raw.ratingCount !== null ? Number(raw.ratingCount) : undefined;`
   - Populate both fields in returned DTO: `averageRating: parsedRating`, `ratingAverage: parsedRating`, `reviewsCount: parsedReviewsCount`, `ratingCount: parsedReviewsCount`.

3. **`src/lib/api-client.ts` (`mapRawPensionToItem`)**:
   - Support both `raw.ratingAverage` and `raw.averageRating`:
     `const rawAvg = raw.ratingAverage ?? raw.averageRating;`
     `ratingAverage: rawAvg !== undefined && rawAvg !== null && !Number.isNaN(Number(rawAvg)) ? Number(rawAvg) : 0,`
   - Support both `raw.ratingCount` and `raw.reviewsCount`:
     `const rawCount = raw.ratingCount ?? raw.reviewsCount ?? (raw._count as { reviews?: number })?.reviews;`
     `reviewsCount: rawCount !== undefined && rawCount !== null ? Number(rawCount) : 0,`

4. **`src/lib/api-client.ts` (`fetchPensionReviews`)**:
   - Fix `apiClient.GET`: `openapi-fetch` returns `{ data, error, response }`.
   - Never call `await response.json()` on an already consumed response stream.
   - If `response.ok && data`, check if `data` is wrapped in envelope (`data.data`) or array directly, and return `PensionReview[]`.

5. **`src/lib/types.ts` (`PensionReview`)**:
   - Update `images?: Array<string | { id?: string; url: string; caption?: string }>;` to support both flat URL strings and object structures.

## Checklist

- [ ] Update `PensionItemDto` in `src/types/api-contracts.ts`.
- [ ] Update `mapPensionItemDto` in `src/services/pensions.service.ts`.
- [ ] Update `mapRawPensionToItem` in `src/lib/api-client.ts`.
- [ ] Fix stream read in `fetchPensionReviews` in `src/lib/api-client.ts`.
- [ ] Flexibilize `images` in `src/lib/types.ts`.
- [ ] No `any` type annotations.
- [ ] Stage exclusively target files and commit with `fix(pensions): standardize ratingAverage and reviewsCount in mappers`.
