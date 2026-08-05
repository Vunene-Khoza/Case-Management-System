# University of Venda - Legal & Labour Case Management System
## Component Refactoring & REST API Integration Walkthrough

I have successfully refactored the Angular frontend structure, integrated your custom branding assets, **removed all frontend dummy/mock data**, and fully integrated the app components with the Spring Boot REST API endpoints.

---

## 1. Accomplished Tasks

### 🔌 Complete REST API Connection (Mock Data Removed)
We deleted the local frontend mock data arrays (`cases`, `notes`, `users` collections) and connected all services to the real database REST endpoints on `http://localhost:8080/api/v1`:
* **Outbound JWT Interceptor:** Built `authInterceptor` in [auth.interceptor.ts](file:///C:/Users/vunene.khoza/OneDrive%20-%20University%20of%20Venda/Documents/GitHub/Case-Management-System/src/app/interceptors/auth.interceptor.ts) to intercept all outgoing HTTP requests and automatically inject the standard authorization header:
  `Authorization: Bearer <token>`
* **HTTP Client Setup:** Registered the interceptor globally inside [app.config.ts](file:///C:/Users/vunene.khoza/OneDrive%20-%20University%20of%20Venda/Documents/GitHub/Case-Management-System/src/app/app.config.ts) provider options.
* **REST Service Refactoring:** Updated [case.service.ts](file:///C:/Users/vunene.khoza/OneDrive%20-%20University%20of%20Venda/Documents/GitHub/Case-Management-System/src/app/services/case.service.ts) to execute real HTTP request operations:
  - `getCases` -> Queries `GET /api/v1/cases` with search, type, and pagination parameters.
  - `getCaseById` -> Queries `GET /api/v1/cases/{caseId}`.
  - `getNotesForCase` -> Queries `GET /api/v1/cases/{caseId}/notes`.
  - `createCase` -> `POST /api/v1/cases` (if an initial note is supplied, performs a secondary comment request to link it).
  - `updateCase` -> `PUT /api/v1/cases/{caseId}`.
  - `closeCase` -> `POST /api/v1/cases/{caseId}/close`.
  - `getDashboardSummary` -> Combines report summary statistics (`GET /api/v1/reports/summary`) and recent cases (`GET /api/v1/cases?page=0&size=5`) using `forkJoin`.
  - `getReportsSummary` -> Queries all cases and aggregates monthly timelines and classification lists on the fly.
  - `getUsers` -> Lists active accounts from `GET /api/v1/users`.
  - `addUser` -> `POST /api/v1/users` (provides default account setup parameters).
  - `deleteUser` -> `DELETE /api/v1/users/{userId}`.

---

### 🔐 Backend Authentication Integration (JWT)
* **Activated HttpClient:** Configured `provideHttpClient()` for API calls.
* **Created AuthService:** Built `auth.service.ts` to execute `POST /api/v1/auth/login`. Saves credentials in `localStorage` upon success.
* **Secured Protected Routes (AuthGuard):** Developed `auth.guard.ts` to protect core paths in `app.routes.ts` (redirects unauthenticated traffic to `/login`).
* **Dynamic Sidebar Profile & Logout:** Configured `sidebar.component` to display the actual logged-in user name and role dynamically, and bind profile clicks to logout action.
* **Login Error Handling:** Refactored `login.component` to catch database failures and display custom alert messages.

### 📋 Component Code Reorganization (Split Structure)
To keep the codebase modular, I refactored every standalone page and component in the application into its own separate files (typescript, template, stylesheet).

### 🎨 Sidebar Branding & Bootstrap Icons
* **Bootstrap SVGs:** Replaced the custom PNG image paths inside the sidebar with standard inline Bootstrap SVG icons.
* **Branded Logo Placement:** Configured `logo/univen1logo.jpeg` as the main branding logo on the Login page and removed the welcome SVG badge as requested.

### 📝 Figma Case Form UI Refactoring & Theme Swaps
* **Color Layout Swap:** Reconfigured the page background to grey (`#f3f4f6`) and swapped the card/block backgrounds to pure white (`#ffffff`).
* **Selection Placeholders:** Changed default select options to disabled placeholders (`Select Case Type`, `Select Classification`).

### 🔍 Cases List Filters & Columns Formatting
* **Structured Columns:** Reorganized the cases list table to display exactly the columns requested (`CASE ID`, `EMPLOYEE`, `EMPLOYEE NO`, `TYPE`, `CLASSIFICATION`, `STATUS`, `DATE OPENED`, `TRIAL DATE`, `ACTION`).
* **Compact Table Presentation:** Reduced cell padding to `8px 12px` and shrank text fonts, badge paddings, and button dimensions to render a data-dense layout.

---

## 2. Compilation Verification Results
- **Build Command Executed:** `$env:NG_FORCE_CACHE_DISABLED="1"; npm run build`
- **Build Status:** ✅ **SUCCESS**
- **Note:** Compiles with zero errors. Cache-layer database pre-allocation was disabled to prevent Windows LMDB write issues.

---

## 3. How to Run Locally

1. **Start the Java Spring Boot Backend:**
   Run the backend application on port `8080` (e.g. via IntelliJ IDEA or Maven).
2. **Start the Angular Frontend:**
   ```powershell
   cd "C:\Users\vunene.khoza\OneDrive - University of Venda\Documents\GitHub\Case-Management-System"
   npm run start
   ```
   Open `http://localhost:4200/` in your browser.
