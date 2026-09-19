# Task: Landlord Mobile Navigation Components (Header & Bottom Nav)

## Execution Profile

- **Wave / Batch**: Wave 2 (Backend Scope, SSR Unblock, Search Sync & Landlord Nav Atoms)
- **Execution Mode**: `PARALLEL`
- **Assigned Role**: `Worker Agent (Web Landlord Navigation UI)`
- **Dependencies (`depends_on`)**: `[]`
- **Collision Risk**: `LOW`

## Target Files

- **Exclusive**:
  - `src/components/layout/landlord-bottom-nav.tsx` [NEW]
  - `src/components/layout/landlord-mobile-header.tsx` [NEW]

## Objective

Build the dedicated mobile-first navigation controls for the landlord experience:
1. `LandlordMobileHeader`: Sticky top header **WITHOUT LOGO** to maximize mobile screen space, featuring the pension selector dropdown and an instant active/paused listing toggle switch.
2. `LandlordBottomNav`: Fixed bottom navigation bar with 4 tabs (`Habitaciones`, `Mi Pensión`, `Reseñas & Sugerencias`, `Cuenta`).

## Technical Specifications

1. **`LandlordMobileHeader` (`src/components/layout/landlord-mobile-header.tsx`)**:
   - Strictly omit the brand logo.
   - Left section:
     - Property selector dropdown/button displaying the currently active pension name (e.g. `🏠 Pensión Central ▾`) and total owned properties count.
     - Allows selecting a different pension if the landlord owns multiple listings.
   - Right section:
     - Switch toggle `Pensión Activa / Pausada` with green live indicator dot when active.
   - Accessible touch targets (minimum 44x44px).

2. **`LandlordBottomNav` (`src/components/layout/landlord-bottom-nav.tsx`)**:
   - Fixed bottom bar (`fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t border-border/60 pb-safe`).
   - 4 equal tabs:
     - `rooms`: `BedDouble` icon + "Habitaciones"
     - `pension`: `Home` / `FileText` icon + "Mi Pensión"
     - `reviews`: `Star` icon + "Reseñas" (with badge counter for pending proposals)
     - `account`: `User` icon + "Cuenta"
   - Active tab highlight with `text-primary` and micro-indicator.

## Checklist

- [ ] Create `LandlordMobileHeader` without logo in `src/components/layout/landlord-mobile-header.tsx`.
- [ ] Create `LandlordBottomNav` with 4 tabs in `src/components/layout/landlord-bottom-nav.tsx`.
- [ ] Add badge indicator for pending community proposals.
- [ ] Stage target files and commit with `feat(landlord): implement mobile header without logo and bottom navigation bar`.
