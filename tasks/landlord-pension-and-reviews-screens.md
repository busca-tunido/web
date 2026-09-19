# Task: Landlord Pension Profile Editor & Reviews/Proposals Screen

## Execution Profile

- **Wave / Batch**: Wave 4 (Filter Drawer Redesign, Landlord Screens & Context)
- **Execution Mode**: `PARALLEL`
- **Assigned Role**: `Worker Agent (Web Landlord Profile & Reviews)`
- **Dependencies (`depends_on`)**: `[web/tasks/landlord-proposals-drawer.md]`
- **Collision Risk**: `LOW`

## Target Files

- **Exclusive**:
  - `src/components/landlord/landlord-pension-screen.tsx` [NEW]
  - `src/components/landlord/landlord-reviews-screen.tsx` [NEW]

## Objective

Build the mobile screens for managing property rules, amenities, contact details, student reviews inspection, and community proposal access:
1. `LandlordPensionScreen`: Mobile editor for basic utilities (water, electricity, gas, WiFi), house rules (curfew, visits, smoking, pets), Chilean WhatsApp contact (`+56 9 ...`), and student preview button opening `PensionDetailModal`.
2. `LandlordReviewsScreen`: Display the 4-dimensional satisfaction breakdown (Limpieza, Trato Anfitrión, Tranquilidad, WiFi), student reviews feed with attached photos, and community proposals banner opening `LandlordProposalsDrawer`. *(Strictly no landlord reply feature as per product design)*.

## Technical Specifications

1. **`LandlordPensionScreen` (`src/components/landlord/landlord-pension-screen.tsx`)**:
   - Card sections:
     - **Servicios**: Switches for `waterIncluded`, `electricityIncluded`, `gasIncluded`, `internetIncluded`.
     - **Reglas**: Switches for `guestsAllowed`, `smokingAllowed`, `petsAllowed`. Curfew and quiet hours.
     - **Preferencia**: `ANY` (Mixto), `FEMALE_ONLY` (Solo mujeres), `MALE_ONLY` (Solo hombres).
     - **Contacto**: Name and WhatsApp input with Chilean format.
   - Action Bar:
     - `Guardar Cambios`: Calls `pensionsService.update(selectedPension.id, data)`.
     - `Vista Previa`: Opens `PensionDetailModal`.

2. **`LandlordReviewsScreen` (`src/components/landlord/landlord-reviews-screen.tsx`)**:
   - Community edit proposals banner with pending count and button opening `LandlordProposalsDrawer`.
   - 4-dimensional satisfaction metrics:
     - Limpieza (`cleanlinessRating`)
     - Trato del Anfitrión (`landlordRating`)
     - Tranquilidad (`quietnessRating`)
     - WiFi (`wifiRating`)
   - Scrollable feed of student reviews with photos and helpful votes (no landlord reply form).

## Checklist

- [ ] Implement `LandlordPensionScreen` with utilities, house rules, WhatsApp contact, and student preview button.
- [ ] Implement `LandlordReviewsScreen` with 4D satisfaction bars and proposals trigger banner.
- [ ] Stage target files and commit with `feat(landlord): implement mobile pension profile editor and reviews inspection screens`.
