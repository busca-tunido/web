# Task: Price Histogram Service Contracts & Reactive Hook

## Execution Profile

- **Wave / Batch**: Wave 3 (Data Contracts, Landlord Atoms & Semantics)
- **Execution Mode**: `ISOLATED`
- **Assigned Role**: `Worker Agent (Web Client Data Layer)`
- **Dependencies (`depends_on`)**: `[api/tasks/pension-filters-histogram-backend.md, api/tasks/landlord-pensions-mine.md]`
- **Collision Risk**: `LOW`

## Target Files

- **Exclusive**:
  - `src/lib/types.ts`
  - `src/services/pensions.service.ts`
  - `src/hooks/use-price-histogram.ts` [NEW]

## Objective

Connect the frontend to the backend price histogram and landlord endpoints:
1. Define TypeScript types for price bins, histogram responses, and extended filter criteria.
2. Extend `SearchFilters` to include advanced room and meal filters (`minPriceClp`, `maxPriceClp`, `roomType`, `hasPrivateBathroom`, `includesMeals`).
3. Add `fetchPriceHistogram` and `fetchMinePensions` in `pensions.service.ts`.
4. Implement `usePriceHistogram` hook with in-memory caching to avoid redundant refetches.

## Technical Specifications

1. **`src/lib/types.ts` Updates**:
   - Define:
     ```ts
     export type PriceBinItem = {
       min: number;
       max: number;
       count: number;
     };

     export type PriceHistogramResponse = {
       minPrice: number;
       maxPrice: number;
       currency: string;
       totalListings: number;
       bins: PriceBinItem[];
     };
     ```
   - Extend `SearchFilters`:
     ```ts
     minPriceClp?: number;
     maxPriceClp?: number;
     roomType?: 'SINGLE' | 'SHARED' | 'STUDIO';
     hasPrivateBathroom?: boolean;
     includesMeals?: boolean;
     minBeds?: number;
     ```

2. **`pensions.service.ts`**:
   - Add method for price histogram:
     ```ts
     async fetchPriceHistogram(params?: PensionFilterParams): Promise<ApiResponse<PriceHistogramResponse>>
     ```
   - Add method for landlord owned pensions:
     ```ts
     async fetchMinePensions(): Promise<ApiResponse<PensionItem[]>>
     ```

3. **`usePriceHistogram` (`src/hooks/use-price-histogram.ts`)**:
   - Accepts current geographic filter context (`city`, `userLocation`, or coordinates).
   - Fetches histogram data and exposes `{ data, isLoading, error, refetch }`.
   - Caches histogram data in-memory keyed by city/coordinates so opening/closing the filter drawer does not trigger unnecessary network fetches.

## Checklist

- [ ] Add `PriceBinItem`, `PriceHistogramResponse`, and extended filter properties in `src/lib/types.ts`.
- [ ] Implement `fetchPriceHistogram` and `fetchMinePensions` in `src/services/pensions.service.ts`.
- [ ] Create reactive cached hook in `src/hooks/use-price-histogram.ts`.
- [ ] Stage target files and commit with `feat(pensions): add price histogram and landlord client services with reactive hook`.
