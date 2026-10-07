# Task: Advanced Community Reputation Algorithm and Subtle Rating Filters

## Execution Profile

- **Wave / Batch**: Wave 1 (Reputation Engine & Filter Precision)
- **Execution Mode**: `SEQUENTIAL`
- **Assigned Role**: `Worker Agent (Domain Algorithms & Search Filtering)`
- **Dependencies (`depends_on`)**: None
- **Collision Risk**: `LOW (Isolated domain rating files and filter matchers)`

## Target Files

- **Exclusive**:
  - `src/lib/rating-tier.ts`
  - `src/lib/filter-matcher.ts`
  - `src/lib/filter-chips.ts`
  - `src/components/layout/filter-drawer.tsx`
  - `tests/components/rating-tier.spec.tsx`
  - `tests/lib/filter-matcher.spec.ts`
- **Shared / Integration Points**:
  - None

## Objective

Replace the naive flat-star rating categorization with an advanced, multi-metric **Community Reputation Score (CRS)** algorithm inspired by Bayesian smoothing (IMDb/Airbnb models).

Concurrently, adopt subtle, non-stigmatizing filter labels across the UI:
1. `"Favoritas de la comunidad"` (for high-consensus, verified accommodations)
2. `"Experiencia positiva"` (for solid, well-reviewed options and promising emerging listings)
3. `"Otras alternativas"` (diplomatic category that includes both unreviewed/new listings and developing accommodations, eliminating harsh `"Baja"` labelling)

## Architectural & Mathematical Specification

### 1. Bayesian Rating Confidence Smoothing ($R_{adj}$)

Raw averages can mislead users: a property with 1 review of 5.0 stars does not represent community consensus, whereas a property with 20 reviews of 4.4 stars has proven excellence.

We compute the Bayesian adjusted rating:
$$R_{adj} = \left( \frac{N}{N + K} \right) \cdot \bar{R} + \left( \frac{K}{N + K} \right) \cdot \mu_0$$

Where:
- $N$: Total review count (`reviewsCount`).
- $\bar{R}$: Raw average rating (`ratingAverage`).
- $K = 3$: Confidence inertia threshold (requires at least 3 reviews for own score to outweigh the prior).
- $\mu_0 = 3.5$: Neutral community prior.

**Mathematical Behavior**:
- **0 reviews** (New): Treated as unreviewed ($\bar{R} = 0, N = 0$). Automatically routed to `"Otras alternativas"`.
- **1 review of 5.0**: $R_{adj} = \frac{1}{4}(5) + \frac{3}{4}(3.5) = 3.875 \rightarrow$ Prevented from qualifying as "Favorita", routed to "Experiencia positiva".
- **4 reviews of 5.0**: $R_{adj} = \frac{4}{7}(5) + \frac{3}{7}(3.5) = 4.357 \rightarrow$ Qualifies for "Favoritas de la comunidad".
- **4 reviews (one 5★, three 2★, $\bar{R} = 2.75$)**: $R_{adj} = \frac{4}{7}(2.75) + \frac{3}{7}(3.5) = 3.07 \rightarrow$ Routed to "Otras alternativas".
- **15 reviews of 4.4★**: $R_{adj} = \frac{15}{18}(4.4) + \frac{3}{18}(3.5) = 4.25 \rightarrow$ Solid "Favoritas de la comunidad".

### 2. Multi-Metric Reputation Composition ($CRS$)

We evaluate domain signals from `PensionItem` to compute the **Community Reputation Score ($CRS$)**:

1. **Base**: $R_{adj}$ (0 to 5.0).
2. **Verification Bonus ($\Delta_{verif}$)**:
   - `isVerified === true` adds $+0.25$ bonus points (terreno-inspected authentic property).
3. **Study & Connectivity Infrastructure ($\Delta_{amenities}$)**:
   - `includesWifi === true`: Mandatory prerequisite for "Favoritas"; adds $+0.10$.
   - `includesStudyRoom === true`: Adds $+0.15$ (dedicated study space).
4. **Campus Proximity Bonus ($\Delta_{prox}$)**:
   - `distanceToUniversityMeters > 0 && distanceToUniversityMeters <= 1200`: Adds $+0.15$ (walkable student lifestyle).

$$CRS = R_{adj} + \Delta_{verif} + \Delta_{amenities} + \Delta_{prox}$$

### 3. Tier Classification Thresholds

- 🌟 **`high` ("Favoritas de la comunidad")**:
  - $N \ge 3$ reviews.
  - Raw rating $\bar{R} \ge 4.2$ AND $R_{adj} \ge 4.2$.
  - Essential connectivity (`includesWifi === true`).
  - $CRS \ge 4.35$.
  - Internal label: `"Favoritas de la comunidad"`.

- 👍 **`medium` ("Experiencia positiva")**:
  - Properties with solid community feedback ($3.2 \le CRS < 4.35$ and raw $\bar{R} \ge 3.0$).
  - Emerging properties with 1–2 reviews of high rating ($\bar{R} \ge 4.0$).
  - Internal label: `"Experiencia positiva"`.

- 📌 **`low` ("Otras alternativas")**:
  - Unreviewed / New properties ($N = 0$ or raw $\bar{R} = 0$).
  - Developing properties with $CRS < 3.2$ or raw $\bar{R} < 3.0$.
  - Internal label: `"Otras alternativas"`.

### 4. Search Filter Inclusion Rule (Including Unrated in "Otras alternativas")

In `filter-matcher.ts` and `rating-tier.ts`:
When a user filters by `filters.ratingTier === 'low'` ("Otras alternativas"), the predicate must return `true` for BOTH:
1. `classification.tier === 'low'`
2. `classification.tier === 'unreviewed'` (new / unrated listings)

This satisfies the requirement that new or unrated pensions are included under "Otras alternativas".

### 5. UI Presentation & Text Harmonization

- **`src/lib/filter-chips.ts`**:
  - `rating_high`: `label: "Favoritas de la comunidad"`
  - `rating_medium`: `label: "Experiencia positiva"`
  - `rating_low`: `label: "Otras alternativas"`

- **`src/components/layout/filter-drawer.tsx`**:
  - `high`:
    - `label: "Favoritas de la comunidad"`
    - `subtitle: "Top valoradas"`
  - `medium`:
    - `label: "Experiencia positiva"`
    - `subtitle: "Buenas opiniones"`
  - `low`:
    - `label: "Otras alternativas"`
    - `subtitle: "Nuevas o por evaluar"`

- **`src/lib/rating-tier.ts` (`classifyPensionRating`)**:
  - Overloaded or polymorphic signature supporting both:
    - `classifyPensionRating(pension: PensionItem | Partial<PensionItem>): RatingClassification`
    - `classifyPensionRating(ratingAverage?: number | null, reviewsCount?: number | null, extraOptions?: Partial<PensionItem>): RatingClassification`
  - Fully backward compatible with legacy map marker styles and existing unit tests.

## Checklist

- [ ] Implement Bayesian smoothing $R_{adj}$ and multi-metric composite score in `src/lib/rating-tier.ts`.
- [ ] Update `RatingClassification` labels in `src/lib/rating-tier.ts` to `"Favoritas de la comunidad"`, `"Experiencia positiva"`, and `"Otras alternativas"`.
- [ ] Update `filterPensionsByRatingTier` in `src/lib/rating-tier.ts` to include `unreviewed` when filtering by `low`.
- [ ] Update `matchesSearchFilters` in `src/lib/filter-matcher.ts` to match both `'low'` and `'unreviewed'` when `filters.ratingTier === 'low'`.
- [ ] Update chip labels in `src/lib/filter-chips.ts` to `"Favoritas de la comunidad"`, `"Experiencia positiva"`, `"Otras alternativas"`.
- [ ] Update drawer labels and subtitles in `src/components/layout/filter-drawer.tsx`.
- [ ] Update and expand unit tests in `tests/components/rating-tier.spec.tsx` covering edge cases:
  - 1 review of 5.0 (Bayesian dampening)
  - 4 reviews of 5.0 (Consolidated high)
  - 4 reviews mixed with low average (Otras alternativas)
  - 0 reviews / unreviewed inclusion in `'low'` filter
- [ ] Update unit tests in `tests/lib/filter-matcher.spec.ts`.
- [ ] Run global Biome quality gate (`pnpm run check && pnpm run review`).
- [ ] Run TypeScript incremental typecheck (`pnpm exec tsc --noEmit`).
- [ ] Run Vitest unit tests (`pnpm exec vitest run`).
- [ ] Stage and commit with conventional commit message (`feat(filters): implement bayesian community reputation algorithm and subtle rating labels`).

## Verification

- Code Quality (Biome): `pnpm run check && pnpm run review`
- Typecheck: `pnpm exec tsc --noEmit`
- Tests: `pnpm exec vitest run`
