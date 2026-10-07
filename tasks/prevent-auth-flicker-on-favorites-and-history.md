# Task: Prevent Unauthenticated Flash and Hydration Flicker on Favorites and History Screens

## Execution Profile

- **Wave / Batch**: Wave 1 (Authentication Hydration & Screen Stability)
- **Execution Mode**: `SEQUENTIAL`
- **Assigned Role**: `Worker Agent (Web Auth & Protected Screens)`
- **Dependencies (`depends_on`)**: None
- **Collision Risk**: `LOW (Isolated favorites, history, and auth gate screens)`

## Target Files

- **Exclusive**:
  - `src/components/favorites/favorites-screen.tsx`
  - `src/components/history/history-screen.tsx`
  - `src/components/auth/auth-gate.tsx`
  - `tests/components/auth-gate-and-incentives.spec.tsx`
- **Shared / Integration Points**:
  - None

## Objective

Eliminate the premature flash of guest incentive messages ("Inicia sesión para ver tus favoritos" / "Donde me he alojado") when a logged-in student navigates to "Favoritos" or "Mis Estadías", or refreshes the browser while on these views.

While authentication credentials are being restored from storage or verified (`useAuth().isLoading === true`), protected views must render an empty invisible state (`return null`) rather than temporarily rendering the unauthenticated incentive UI before snapping into the authenticated state.

## Technical Specifications

### 1. Guard against Premature Rendering in `FavoritesScreen` (`src/components/favorites/favorites-screen.tsx`)
- Currently:
  ```tsx
  export function FavoritesScreen(props: FavoritesScreenProps) {
    const { isAuthenticated } = useAuth();
    const { openAuthModal } = useNavigation();

    if (!isAuthenticated) {
      return <FavoritesGuestIncentive onOpenAuth={openAuthModal} />;
    }

    return <FavoritesContent {...props} />;
  }
  ```
- **Fix**: Destructure `isLoading` from `useAuth()` and return `null` while `isLoading === true`:
  ```tsx
  export function FavoritesScreen(props: FavoritesScreenProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const { openAuthModal } = useNavigation();

    if (isLoading) {
      return null;
    }

    if (!isAuthenticated) {
      return <FavoritesGuestIncentive onOpenAuth={openAuthModal} />;
    }

    return <FavoritesContent {...props} />;
  }
  ```

### 2. Guard against Premature Rendering in `HistoryScreen` (`src/components/history/history-screen.tsx`)
- **Fix**: Destructure `isLoading` from `useAuth()` and return `null` while `isLoading === true`:
  ```tsx
  export function HistoryScreen(props: HistoryScreenProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const { openAuthModal } = useNavigation();

    if (isLoading) {
      return null;
    }

    if (!isAuthenticated) {
      return <HistoryGuestIncentive onOpenAuth={openAuthModal} />;
    }

    return <HistoryContent {...props} />;
  }
  ```

### 3. Guard against Lock Overlay Flash in `AuthGate` (`src/components/auth/auth-gate.tsx`)
- **Fix**: Destructure `isLoading` from `useAuth()`. If `isLoading === true`, return `null` (or unobtrusive placeholder) to avoid flashing the lock banner before user identity is verified.

### 4. Unit Test Verification (`tests/components/auth-gate-and-incentives.spec.tsx`)
- Add test scenarios verifying that:
  - When `isLoading === true` and `isAuthenticated === false`, `FavoritesScreen` renders nothing (`null`), without mounting `FavoritesGuestIncentive`.
  - When `isLoading === true` and `isAuthenticated === false`, `HistoryScreen` renders nothing (`null`), without mounting `HistoryGuestIncentive`.
  - When `isLoading === false` and `isAuthenticated === false`, guest incentive cards render normally.
  - When `isLoading === false` and `isAuthenticated === true`, authenticated content renders normally.

## Checklist

- [ ] Add `isLoading` guard to `src/components/favorites/favorites-screen.tsx` returning `null` during auth hydration.
- [ ] Add `isLoading` guard to `src/components/history/history-screen.tsx` returning `null` during auth hydration.
- [ ] Add `isLoading` guard to `src/components/auth/auth-gate.tsx` returning `null` during auth hydration.
- [ ] Update `tests/components/auth-gate-and-incentives.spec.tsx` to assert zero guest incentive flash when `isLoading === true`.
- [ ] Run global Biome quality gate (`pnpm run check && pnpm run review`).
- [ ] Run TypeScript typecheck (`pnpm exec tsc --noEmit`).
- [ ] Run Vitest unit tests (`pnpm exec vitest run`).
- [ ] Stage and commit with conventional commit message (`fix(auth): prevent guest incentive flash on favorites and history during auth hydration`).

## Verification

- Code Quality (Biome): `pnpm run check && pnpm run review`
- Typecheck: `pnpm exec tsc --noEmit`
- Tests: `pnpm exec vitest run`
