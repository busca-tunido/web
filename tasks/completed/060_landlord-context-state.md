# Task: Landlord Global Context & State Management

## Execution Profile

- **Wave / Batch**: Wave 4 (Filter Drawer Redesign, Landlord Screens & Context)
- **Execution Mode**: `PARALLEL`
- **Assigned Role**: `Worker Agent (Web Landlord Context)`
- **Dependencies (`depends_on`)**: `[web/tasks/price-histogram-service-hook.md]`
- **Collision Risk**: `LOW`

## Target Files

- **Exclusive**:
  - `src/contexts/landlord-context.tsx` [NEW]

## Objective

Establish a centralized React context (`LandlordContext`) to orchestrate multi-pension landlord operations, active tab routing, and optimistic status updates.

## Technical Specifications

1. **`LandlordContext` Types & Provider (`src/contexts/landlord-context.tsx`)**:
   - Define `LandlordTab = 'rooms' | 'pension' | 'reviews' | 'account'`.
   - Expose context interface:
     ```ts
     export interface LandlordContextValue {
       pensions: PensionItem[];
       selectedPension: PensionItem | null;
       setSelectedPension: (pension: PensionItem) => void;
       activeTab: LandlordTab;
       setActiveTab: (tab: LandlordTab) => void;
       isLoading: boolean;
       error: string | null;
       togglePensionActive: (pensionId: string, isActive: boolean) => Promise<void>;
       refetchPensions: () => Promise<void>;
     }
     ```
   - On initial mount, fetch properties via `pensionsService.fetchMinePensions()`.
   - Default `selectedPension` to the first property in the array.
   - Implement `togglePensionActive`:
     - Optimistically update `selectedPension.isActive` and the corresponding item in `pensions`.
     - Call `pensionsService.update(pensionId, { isActive })`.
     - Revert on failure with a notification.

## Checklist

- [ ] Define `LandlordContext` and `LandlordProvider` in `src/contexts/landlord-context.tsx`.
- [ ] Implement initial fetch of owned properties on mount.
- [ ] Implement optimistic active/pause toggle for listings.
- [ ] Provide custom hook `useLandlord()`.
- [ ] Stage target file and commit with `feat(landlord): implement LandlordContext for property and tab state management`.
