# Task: Landlord Community Proposals Review Drawer

## Execution Profile

- **Wave / Batch**: Wave 3 (Data Contracts, Landlord Atoms & Semantics)
- **Execution Mode**: `PARALLEL`
- **Assigned Role**: `Worker Agent (Web Proposals Drawer)`
- **Dependencies (`depends_on`)**: `[]`
- **Collision Risk**: `LOW`

## Target Files

- **Exclusive**:
  - `src/components/landlord/landlord-proposals-drawer.tsx` [NEW]

## Objective

Build a mobile bottom-sheet drawer (`LandlordProposalsDrawer`) for reviewing community edit suggestions submitted by students:
1. List pending edit proposals for the selected pension (`proposalsService.fetchPensionProposals(pensionId)`).
2. Render proposal metadata (author, date, notes) and a visual diff comparing current values with suggested values.
3. Provide `Aprobar Sugerencia` and `Descartar` action buttons calling `proposalsService.reviewProposal`.

## Technical Specifications

1. **`LandlordProposalsDrawer` Props (`src/components/landlord/landlord-proposals-drawer.tsx`)**:
   ```ts
   export interface LandlordProposalsDrawerProps {
     isOpen: boolean;
     onClose: () => void;
     pensionId: string;
     onProposalReviewed?: () => void;
   }
   ```

2. **Visual Structure**:
   - Header with title "Sugerencias de la Comunidad" and badge with pending count.
   - List of proposals with cards showing:
     - Student author note / reason for suggestion.
     - Field-by-field diff comparison (e.g. `Precio: $240.000 -> $260.000` or `WiFi Fibra: No -> Sí`).
     - Decision actions: Button `Aprobar` (calls `reviewProposal(id, { status: 'APPROVED' })`) and `Descartar` (calls `reviewProposal(id, { status: 'REJECTED' })`).
   - Empty state when no proposals are pending ("¡Tu ficha está al día!").

## Checklist

- [ ] Build `LandlordProposalsDrawer` bottom sheet drawer in `src/components/landlord/landlord-proposals-drawer.tsx`.
- [ ] Display visual diff for field suggestions.
- [ ] Implement approval and rejection handlers with optimistic item dismissal.
- [ ] Stage target file and commit with `feat(landlord): implement LandlordProposalsDrawer for community suggestions review`.
