# Transformer Guard - Project Handoff

## Project Overview
This is a **Next.js 16** (App Router) web application for "Transformer Guard", a utility management dashboard.
*   **Tech Stack**: Next.js (TypeScript), Tailwind CSS, Lucide Icons, Shadcn-like UI components.
*   **Backend**: .NET Core (External API). URLs are configured in `src/services/api.ts` and `src/lib/api-config-store.ts`.

## Current State (As of Jan 2, 2026)

### 1. Modules Implemented
*   **Company Master**: `/dashboard/admin/company` (Full CRUD, Real API).
*   **Location Master**: `/dashboard/admin/locations` (Unified CRUD for Circle, Division, SubDivision, Section, Substation).
*   **User Management**: `/dashboard/admin/users` (Active Users list + Pending Approvals tab).
*   **API Configuration**: `/dashboard/admin/api-config` (Tool to test/configure endpoints, populated with ~110 Swagger endpoints).
*   **Language Settings**: `/dashboard/admin/language` (Multi-language grid: En, Hi, Ta, Te, Kn with Sticky Columns).
*   **Authentication**:
    *   **Signup**: `/signup` (Public registration).
    *   **Login**: `/login` (Existing).
    *   **Auth Service**: Refined to support Register/Approve/Reject.

### 2. Architecture Notes
*   **Mock Stores**:
    *   `src/lib/language-store.ts`: Uses LocalStorage for translations.
    *   `src/lib/api-config-store.ts`: Uses LocalStorage for API endpoint definitions.
    *   `src/lib/default-apis.ts`: Auto-generated list of endpoints from Swagger.
*   **API Service**: `src/services/api.ts` is the central Axios-like wrapper.
*   **Admin Dashboard**: `src/app/dashboard/admin/page.tsx` contains the list of modules.

### 3. Key Files
*   `src/services/api.ts`: Main API logic.
*   `src/app/dashboard/admin/locations/page.tsx`: Complex generic CRUD.
*   `src/app/dashboard/admin/language/page.tsx`: Data table with sticky columns.
*   `src/components/DataTable/DataTable.tsx`: Enhanced to support `meta.className` and `meta.style`.

## Instructions for New "Antigravity" Agent
1.  **Read this file** to understand the scope.
2.  **Run `npm install`** and `npm run dev` to verify the environment.
3.  **Check `src/services/api.ts`** if backend URLs need changing on the new machine.
4.  **Pending Tasks**:
    *   Verify "Location Master" dropdowns (currently inputs).
    *   Verify "User Approval" real API integration.
    *   Testing of "API Config" custom requests.

## Command to Resume
"I have transferred this project. Please read `HANDOFF.md`, verify the app runs, and help me continue with [Next Task]."
