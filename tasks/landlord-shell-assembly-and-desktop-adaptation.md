# Task: Landlord Shell Assembly & Responsive Desktop Adaptation

## Execution Profile

- **Wave / Batch**: Wave 5 (Landlord Shell Assembly & Desktop Adaptation)
- **Execution Mode**: `ISOLATED`
- **Assigned Role**: `Worker Agent (Web Landlord Shell & Desktop)`
- **Dependencies (`depends_on`)**: `[web/tasks/landlord-rooms-screen.md, web/tasks/landlord-pension-and-reviews-screens.md, web/tasks/landlord-navigation-components.md, web/tasks/landlord-context-state.md]`
- **Collision Risk**: `LOW`

## Target Files

- **Exclusive**:
  - `src/components/landlord/landlord-desktop-sidebar.tsx` [NEW]
  - `src/components/landlord/landlord-desktop-header.tsx` [NEW]
  - `src/components/shells/landlord-app-shell.tsx`

## Objective

Assemble the complete landlord user experience: first ensuring a 100% functional mobile-first layout, then adapting it seamlessly for desktop viewports:
1. **Mobile Experience First**:
   - Wrap interface in `LandlordProvider`.
   - Top: `LandlordMobileHeader` **WITHOUT LOGO** to maximize vertical room on mobile.
   - Body: Dynamically render active tab screen (`rooms`, `pension`, `reviews`, `account`).
   - Bottom: Fixed `LandlordBottomNav` with 4 mobile tabs.
2. **Desktop Adaptation**:
   - Create `LandlordDesktopSidebar`: Visible on `hidden md:flex`, featuring BrandLogo with "Panel Propietario" badge, property switcher, vertical navigation tabs, occupancy mini-widget, and student preview toggle.
   - Create `LandlordDesktopHeader`: Visible on `hidden md:flex`, top bar with breadcrumbs, public listing toggle switch, and user profile avatar.
   - Integrate responsive layout in `LandlordAppShell`: On `md:` viewports, hide mobile header and bottom nav (`md:hidden`), expand to multi-column responsive layout (`max-w-6xl`).

## Technical Specifications

1. **`LandlordDesktopSidebar` (`src/components/landlord/landlord-desktop-sidebar.tsx`)**:
   - Width `w-64 lg:w-72`, full height, sticky top.
   - Brand logo, property dropdown selector, vertical navigation links with active indicators.

2. **`LandlordDesktopHeader` (`src/components/landlord/landlord-desktop-header.tsx`)**:
   - Height `h-16`, sticky top, breadcrumbs, property active/pause switch.

3. **`LandlordAppShell` (`src/components/shells/landlord-app-shell.tsx`)**:
   - Responsive container:
     ```tsx
     <LandlordProvider>
       <div className="min-h-screen bg-background flex flex-col md:flex-row">
         <LandlordDesktopSidebar />
         <div className="flex-1 flex flex-col min-w-0">
           <LandlordMobileHeader className="md:hidden" />
           <LandlordDesktopHeader className="hidden md:flex" />
           <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto pb-24 md:pb-12">
             {activeTab === 'rooms' && <LandlordRoomsScreen />}
             {activeTab === 'pension' && <LandlordPensionScreen />}
             {activeTab === 'reviews' && <LandlordReviewsScreen />}
             {activeTab === 'account' && <LandlordAccountSection />}
           </main>
           <LandlordBottomNav className="md:hidden" />
         </div>
       </div>
     </LandlordProvider>
     ```

## Checklist

- [ ] Assemble mobile landlord shell with `LandlordMobileHeader` (without logo), tabs, and `LandlordBottomNav`.
- [ ] Build `LandlordDesktopSidebar` in `src/components/landlord/landlord-desktop-sidebar.tsx`.
- [ ] Build `LandlordDesktopHeader` in `src/components/landlord/landlord-desktop-header.tsx`.
- [ ] Integrate responsive desktop sidebar and header in `src/components/shells/landlord-app-shell.tsx`.
- [ ] Ensure mobile controls hide cleanly on `md:` breakpoints (`md:hidden`).
- [ ] Stage target files and commit with `feat(landlord): assemble mobile shell and responsive desktop adaptation`.
