# ERP Frontend — Code Quality & Bad Practices Audit Report

> Branch Audited: stage  
> Repository: marka7242119/erp-frontend  
> Date: August 30, 2026  
> Auditor: Antigravity AI Code Analysis  

---

## Executive Summary

A comprehensive code scan was conducted on the remote stage branch of the ERP Frontend codebase. The audit identified 11 critical TypeScript compilation errors breaking the production build, 1,350 ESLint problems (1,226 errors, 124 warnings), and several dozen systemic anti-patterns across React state management, Clean Architecture/DDD boundaries, security, data integrity, real-time networking, and typing.

### Summary of Audit Findings

| Category | Severity | Issues Found | Impact |
| :--- | :--- | :--- | :--- |
| Build & Compilation | Critical | 11 TypeScript build errors; uninstalled package dependencies | npm run build fails; blocks CI/CD deployments |
| React & State Management | High | Router reinstantiation in render body; unmemoized useCases causing infinite re-render hazards; 23+ ESLint suppressions | App reload flickers, discarded route state, cascading renders, memory churn |
| Clean Architecture / DDD | High | Core layer depending on feature modules; business rules leaking into UI views; monolithic eager bundle | Breaks modularity, high coupling, oversized initial bundle (52K+ LOC upfront) |
| Security & Data Integrity | High | Unhandled JSON.parse crash on storage; destructive cleanPayload stripping null and File; unescaped querySelector crashes | App crash on corrupted storage; impossible to unset fields; form submit crashes |
| WebSockets & Real-Time | Medium | Module-level singleton subscription flags; mismatched echo.leave channel names | Multi-user session bugs; connection and callback leaks |
| Type Safety & TypeScript | Medium | 628+ any / as any occurrences; strict mode disabled in tsconfig; runtime dummy schemas for typing | Loss of compile-time type safety; silent runtime failures |
| Localization & Helpers | Medium | getLocalizedName ignores active language (always hardcoded to Arabic first) | Broken English localization across 30+ tables and views |
| Naming & Typos | Medium | 10+ misspelled files, directories (responce), functions (createCrufRepository), and variables | High cognitive load, broken imports, poor maintainability |

---

## Table of Contents

1. [Critical Build & Compilation Breakages](#1-critical-build--compilation-breakages)
2. [React & State Management Anti-Patterns](#2-react--state-management-anti-patterns)
3. [Clean Architecture & DDD Violations](#3-clean-architecture--ddd-violations)
4. [Security, Data Handling & Runtime Reliability](#4-security-data-handling--runtime-reliability)
5. [WebSockets & Real-Time Networking Flaws](#5-websockets--real-time-networking-flaws)
6. [TypeScript & Type Safety Degradation](#6-typescript--type-safety-degradation)
7. [Localization & Internationalization Bugs](#7-localization--internationalization-bugs)
8. [Naming Inconsistencies & Typographical Errors](#8-naming-inconsistencies--typographical-errors)
9. [Prioritized Remediation Roadmap](#9-prioritized-remediation-roadmap)

---

## 1. Critical Build & Compilation Breakages

Running npm run build (tsc -b && vite build) currently fails with 11 TypeScript errors. The project cannot be built or deployed without resolving these errors:

### 1.1 Broken Sandbox Mock Properties
- Location: [Sabdbox.tsx:L95](file:///mnt/data/projects/Marka/erp-frontend/src/Sabdbox.tsx#L95) and [Sabdbox.tsx:L330](file:///mnt/data/projects/Marka/erp-frontend/src/Sabdbox.tsx#L330)
- Error:
  `
  src/Sabdbox.tsx:95:7 - error TS2353: Object literal may only specify known properties, and 'id' does not exist in type 'SubscriptionPartnerEntry'.
  src/Sabdbox.tsx:330:35 - error TS2741: Property 'id' is missing in type '{ version: "1.0.0"; payload: SubscriptionRequestV100; }' but required in type 'SubscriptionRequestV100Record'.
 
- **Cause**: Type definition for `SubscriptionRequestV100Record` requires a top-level `id: number`, which is missing in the sandbox component. Additionally, `SubscriptionPartnerEntry` does not declare `id`.

### 1.2 Broken Mock Subscription Requests
- **Location**: [mockSubscriptionRequests.ts:L32,L153-L169](file:///mnt/data/projects/Marka/erp-frontend/src/modules/investments/domain/entities/subscriptionRequests/mockSubscriptionRequests.ts#L153-L169)
- **Errors**:
  - `item.id = n` (Property `id` does not exist on `SubscriptionRequestV100`)
  - `item.status = statuses[...]` (Property `status` does not exist on `SubscriptionRequestV100`)
  - `item.facilities = ...` (Typo: the entity defines `facility`, not plural `facilities`)
  - Parameter `f` implicitly has an `any` type
  - Type mismatch: `{ version: "1.0.0", payload: ... }[]` missing required top-level `id: number`
  - Unsafe access: `r.payload.id` where `payload` is optional and lacks `id`

---

## 2. React & State Management Anti-Patterns

### 2.1 Browser Router Reinstantiation on Every Render
- **Location**: [App.tsx:L66](file:///mnt/data/projects/Marka/erp-frontend/src/App.tsx#L66)
- **Code Snippet**:
  
tsx
  function AppContent() {
    const { loading } = useAuth();
    // ...
    const router = createBrowserRouter(routeConfigs); // <-- ANTI-PATTERN
    return <RouterProvider router={roProblem }
  `
- **Problem**: `createBrowserRouter` is called inside the component render function. Every time auth state, context, or language changes, a brand-new router instancConsequences.
- **Consequences**:
  - Resets all internal navigation history and scroll restoration.
  - Aborts in-flight navigation promises and re-mounts the entire route tree.
  - Causes visual flickering and potential infinite rRemediations.
- **Remediation**: Create the router instance outside the component body (at module level) or memoize route objects and router creation using `useMemo`.

---

### 2.2 Unmemoized UseCases & Repositories (InfiLocationsard)
- **Locations**:
  - [userManageUsers.ts:L59-L60](file:///mnt/data/projects/Marka/erp-frontend/src/modules/users/presentation/hooks/user/userManageUsers.ts#L59-L60)
  - [useTransactions.ts:L52-L53](file:///mnt/data/projects/Marka/erp-frontend/src/modules/finance/presentation/hooks/useTransactions.ts#L52-L53)
  - [useCurrencies.ts:L52-L53](file:///mnt/data/projects/Marka/erp-frontend/src/modules/finance/presentation/hooks/useCurrencies.ts#L52-L53)
  - [useFees.ts:L53-L54](file:///mnt/data/projects/Marka/erp-frontend/src/modules/finance/presentation/hooks/useFees.ts#L53-L54)
  - [useEmployee.ts:L62-L63](file:///mnt/data/projects/Marka/erp-frontend/src/modules/hr/presentation/hooks/employee/useEmployee.ts#L62-L63)
  - [useLeaveTypes.ts:L90-L91](file:///mnt/data/projects/Marka/erp-frontend/src/modules/hr/presentation/hooks/leave/useLeaveTypes.ts#L90-L91)
  - [useLeaveBalance.ts:L71-L72](file:///mnt/data/projects/Marka/erp-frontend/src/modules/hr/presentation/hooks/leaveBalance/useLeaveBalance.ts#L71-L72)
  - [useLeaveRequest.ts:L62-L63](file:///mnt/data/projects/Marka/erp-frontend/src/modules/hr/presentation/hooks/leaveRequest/useLeaveRequest.ts#L62-L63)
  - [useFileExplorer.ts:L96-L97](file:///mnt/data/projects/Marka/erp-frontend/src/modules/storage/presentation/hooks/useFileExplorer.ts#L96-L97)
  - [useDossierPartners.ts:L42-L43](file:///mnt/data/projects/Marka/erp-frontend/src/modules/investments/presentation/hooks/useDossierPartners.ts#L42-L43)
  - [useInstallments.ts:L39-L40](file:///mnt/data/projects/Marka/erp-frontend/src/modules/investments/presentation/hooks/useInstallments.ts#L39-L40)
  - [usePlotStatus.ts:L13-L14](file:///mnt/data/projects/Marka/erp-frontend/src/modules/investments/presentation/hooks/usePlotStatus.ts#L13-L14)
- Code Pattern:
 
  export const useTransactions = (initialFilter?: Partial<TransactionFilters>) => {
    const apiClient = useApiClient();
    const repository = createTransactionRepository(apiClient); // <-- Recreated on EVERY render
    const useCase = createManageTransactionsUseCase(repository); // <-- Recreated on EVERY render

    const findAllTransactions = useCallback(async () => {
      // ...
    }, [useCase, filter]); // <-- useCase changes EVERY render!
  
- Problem: Because useCase is a new object reference on every render, all useCallback functions depending on useCase are recreated on every render.
- Consequences:
  - Child components receiving these callbacks re-render needlessly.
  - If a component puts findAllTransactions in a useEffect dependency array, it creates an infinite render loop.

---

### 2.3 Massive ESLint Rule Suppressions Instead of Fixing Root Causes
- Over 23 explicit ESLint disable comments (react-hooks/exhaustive-deps and react-hooks/set-state-in-effect) were added across the codebase:
  - [useEntity.ts:L289,L291](file:///mnt/data/projects/Marka/erp-frontend/src/core/presentation/hooks/data/useEntity.ts#L289-L291)
  - [useStatistics.ts:L113,L115](file:///mnt/data/projects/Marka/erp-frontend/src/core/presentation/hooks/data/statistics/useStatistics.ts#L113-L115)
  - [TransactionsPage.tsx:L114,L122,L129](file:///mnt/data/projects/Marka/erp-frontend/src/modules/finance/presentation/pages/TransactionsPage.tsx#L122)
  - [useTransactions.ts:L91,L93](file:///mnt/data/projects/Marka/erp-frontend/src/modules/finance/presentation/hooks/useTransactions.ts#L91-L93)
  - [RolesListPage.tsx:L56](file:///mnt/data/projects/Marka/erp-frontend/src/modules/users/presentation/pages/RolesListPage.tsx#L56)
  - [usePersons.ts:L107,L109](file:///mnt/data/projects/Marka/erp-frontend/src/modules/crm/presentation/hooks/usePersons.ts#L107-L109)
- Problem: When developers encountered infinite re-rendering loops caused by unmemoized useCases (Issue 2.2) and synchronous setState in effects, they suppressed the linter instead of fixing the root cause.

---

### 2.4 Non-Reactive Global Module Registries
- Locations: [UserProvider.tsx:L7](file:///mnt/data/projects/Marka/erp-frontend/src/core/registry/user/UserProvider.tsx#L7), [userRegistry.ts](file:///mnt/data/projects/Marka/erp-frontend/src/core/registry/user/userRegistry.ts), [HrProvider.tsx](file:///mnt/data/projects/Marka/erp-frontend/src/core/registry/hr/HrProvider.tsx), [StorageProvider.tsx](file:///mnt/data/projects/Marka/erp-frontend/src/core/registry/storage/StorageProvider.tsx)
- Code Pattern:
 
  export const UserProvider = ({ children }: { children: ReactNode }) => {
    const api = getUserApi(); // <-- Reads module-level mutable variable once
    return <UserContext.Provider value={api}>{children}</UserContext.Provider>;
  }
  
- Problem: userRegistry.ts stores userApi in a module-level variable let userApi: UserApi | null = null. UserProvider reads it during mount. If a module registers its API asynchronously or after the provider mounts, React has no listener or subscription mechanism to detect the change, leaving useUserApi() permanently returning null.

---

### 2.5 Unmemoized Context Values
- Locations:
  - [AuthProvider.tsx:L106](file:///mnt/data/projects/Marka/erp-frontend/src/core/infrastructure/auth/AuthProvider.tsx#L106) (value={{ isAuthenticated, user, loading, login, logout, hasPermission, hasRole }})
  - [I18nProvider.tsx:L73](file:///mnt/data/projects/Marka/erp-frontend/src/core/presentation/context/i18n/I18nProvider.tsx#L73) (value={{ language, direction, setLanguage, t }})
  - Problem: Context values are declared as plain inline object literals without useMemo. Every time the provider renders, a new object reference is passed to Context.Provider, forcing every consuming component across the entire app tree to re-render.

---

### 2.6 Imperative State Bypassing via useReducer
- Location: [FileExplorer.tsx:L32](file:///mnt/data/projects/Marka/erp-frontend/src/modules/storage/presentation/components/FileExplorer.tsx#L32)
- Code Pattern:
 
  const [, forceRender] = useReducer(x => x + 1, 0);
  
- Problem: Using forceRender() to forcefully trigger React re-renders is a known React anti-pattern indicating mutable state was improperly stored in refs rather than React state.

---

## 3. Clean Architecture & DDD Violations

### 3.1 Core Layer Depending on Concrete Feature Modules (Inversion of Control Violation)
- Locations:
  - [useEntity.ts:L2](file:///mnt/data/projects/Marka/erp-frontend/src/core/presentation/hooks/data/useEntity.ts#L2):
   
    import type { CreateEntityDTO, UpdateEntityDTO } from '../../../../modules/hr/application/dtos/entityDto';
    
  - [userRegistry.ts:L3](file:///mnt/data/projects/Marka/erp-frontend/src/core/registry/user/userRegistry.ts#L3):
   
    import type { User } from "../../../modules/users/domain/entities/user/user";
    
- Problem: The generic core infrastructure/presentation layer imports types directly from concrete feature modules (modules/hr and modules/users).
- Impact: Violates Dependency Inversion Principle. Core cannot be compiled or tested independently of specific modules, creating tight circular coupling.

---

### 3.2 Domain Rules Evaluation Leaking into Presentation UI
- Location: [ShowLeaveRequestAdminPage.tsx:L62-L87](file:///mnt/data/projects/Marka/erp-frontend/src/modules/hr/presentation/pages/leaveRequest/ShowLeaveRequestAdminPage.tsx#L62-L87)
- Code Pattern:
 
  const evalRuleCondition = (cond: RuleCondition, values: RuleFieldValues): boolean => { ... }
  const evalRuleGroup = (group: RuleGroup, values: RuleFieldValues): boolean => { ... }
  
- Problem: The complete boolean expression evaluation engine for leave eligibility conditions (supporting =, !=, >, <, >=, <=, in, between, contains) is implemented directly inside a UI view component.
- Remediation: Move all rule evaluation logic to a dedicated domain service src/modules/hr/domain/services/LeaveEligibilityService.ts or src/modules/hr/application/usecases/.

---

### 3.3 Monolithic Eager Loading (Zero Route-Level Code Splitting)
- Locations: [moduleRegistry.ts:L126-L139](file:///mnt/data/projects/Marka/erp-frontend/src/core/moduleRegistry.ts#L126-L139) and [investments/index.tsx:L10-L43](file:///mnt/data/projects/Marka/erp-frontend/src/modules/investments/index.tsx#L10-L43)
- Problem: All 50+ page components are statically imported at the top of module definition files, and moduleRegistry.ts uses { eager: true } globbing:
 
  const modulesMap = import.meta.glob<{ default?: Module }>("/src/modules/*/index.{ts,tsx}", { eager: true });
  
- Impact: The entire application bundle (over 52,000 lines of code) is compiled into a single monolithic JavaScript bundle. Initial page load must download and parse all modules before rendering the login screen.
- Remediation: Use React.lazy() for route components and enable dynamic import() chunking in Vite.

---

## 4. Security, Data Handling & Runtime Reliability

### 4.1 Unhandled Application Crash on LocalStorage JSON Parse
- Location: [authStorage.ts:L28-L29](file:///mnt/data/projects/Marka/erp-frontend/src/core/infrastructure/auth/authStorage.ts#L28-L29)
- Code Pattern:
  `ts
  export function getAuthUser(): any | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('auth_user');
      return userStr ? JSON.parse(userStr) : null; // <-- UNPROTECTED PARSE
    }
    return null;
  }
 
- **Problem**: If `auth_user` contains invalid JSON or is corrupted, `JSON.parse` throws an unhandled `SyntaxError` that halts application execution on startup.
- **JWT Decode Vulnerability**:
  - [authStorage.ts:L48,L64](file:///mnt/data/projects/Marka/erp-frontend/src/core/infrastructure/auth/authStorage.ts#L48): `atob(token.split('.')[1])` throws a `DOMException` on UTF-8 strings or unpadded base64url characters (`-`, `_`). Must use base64url decoding with `decodeURIComponent(escape(atob(...)))`.

---

### 4.2 Data Destruction in `cleanPayload` Utility
- **Location**: [cleanPayload.ts:L5,L7](file:///mnt/data/projects/Marka/erp-frontend/src/core/utils/cleanPayload.ts#L5-L7)
- **Code Pattern**:
  
ts
  export function cleanPayload<T extends Record<string, any>>(obj: T): T {
    const result: Record<string, any> = {}
    for (const [key, val] of Object.entries(obj)) {
      if (val === null || val === undefined) continue; // <-- BUG: Deletes null
      if (val !== null && typeof val === "object" && !(val instanceof Date)) {
   Bugs...
 
- **Bugs**:
  1. **Cannot Clear Nullable Fields**: Stripping `null` prevents users from clearing optional fields (e.g. unsetting a date, manager ID, or notes on update requests). The backend never receives `{"field": null}`.
  2. **Corrupts File & Blob Uploads**: `cleanPayload` checks `!(val instanceof Date)`, but fails to check `File`, `Blob`, `FormData`, or `RegExp`. A `File` object has no enumerable own properties in `Object.entries()`, so `cleanPayload` transforms uploaded files into empty objects `{}` or drops them entirely.

---

### 4.3 Unescaped Selector Crash in Server Validation Mapper
- **Location**: [handleApiError.ts:L155](file:///mnt/data/projects/Marka/erp-frontend/src/core/presentation/utils/handleApiError.ts#L155)
- **Code Pattern**:
  
ts
  const firstField = entries[0][0];
  const el = document.querySelector([for="${firstField}"]);
 
- **Problem**: When backend validation errors target nested dot-notation fields (e.g. `employment_details.org_unit_id` in [EmployeeForm.tsx:L555](file:///mnt/data/projects/Marka/erp-frontend/src/modules/hr/presentation/pages/EmployeeForm.tsx#L555)), `document.querySelector('[for="employment_details.org_unit_id"]')` throws an unhandled `DOMException: Failed to execute 'querySelector': '[for="employment_details.org_unit_id"]' is not a valid selector.`

---

## 5. WebSockets & Real-Time Networking Flaws

### 5.1 Module-Level Singleton Flags Breaking Multi-User Sessions
- **Locations**: [notificationEchoUseCase.ts:L3](file:///mnt/data/projects/Marka/erp-frontend/src/core/application/usecases/notificationEchoUseCase.ts#L3) and [chatEchoUseCase.ts:L4-L5](file:///mnt/data/projects/Marka/erp-frontend/src/modules/chat/application/usecases/chatEchoUseCase.ts#L4-L5)
- **Code Pattern**:
  
ts
  let notificationChannelSubscribed = false;
  let userChannelSubscribed = false;ProblemneChannelSubscribed = false;
 
- **Problem**: Module-level booleans track subscription status. When user A logs out and user B logs in, the flags remain `true`. User B is never subscribed to their private notification/chat channels.
- **Missing Cleanup**: No `unsubscribe` function exists in `notificationEchoUseCase.ts` to leave channels when logging out or unmounting.

---

### 5.2 Mismatched Channel Names in `echo.leave`
- **Location**: [chatEchoUseCase.ts:L78-L81,L93](file:///mnt/data/projects/Marka/erp-frontend/src/modules/chat/application/usecases/chatEchoUseCase.ts#L78-L81)
- **Code Pattern**:
  
ts
  const name = private-messages.${conversationId};channelName = name;
  const channel = echo.private(messages.${conversationId});
  // ...
  unsubscribe() {
    if (channelName) {
      echo.leave(channelName); // <-- Passes 'private-messages.X'
    }
  }
 
- **Problem**: `echo.private('messages.X')` expects `echo.leave('messages.X')` or `echo.leave('private-messages.X')` depending on how Echo formats channel prefixes. In Laravel Echo, `echo.leave('messages.X')` should match the name passed to `echo.private`. Passing mismatched prefixes prevents Echo from removing the subscription, causing connection and event listener leaks.

---

### 5.3 Hardcoded Secrets & Global Pollution
- **Location**: [echo.ts:L10,L16-L20](file:///mnt/data/projects/Marka/erp-frontend/src/core/infrastructure/echo/echo.ts#L10)
- **Code Pattern**:
  
ts
  (window as any).Pusher = Pusher; // <-- Global window pollution
  // ...
  key: import.meta.env.VITE_REVERB_APP_KEY ?? 'ha-st-k',
  wsHost: import.meta.env.VITE_REVERB_HOST ?? 'ws.stage-erp-api.marka-tech.com',
 
- **Problem**: Pollutes the global window object and falls back to hardcoded staging WebSocket credentials in production code.

---

## 6. TypeScript & Type Safety Degradation

### 6.1 Proliferation of `any` Types
- **Occurrences**: **628 instances** of `any`, `as any`, and `: any` across `src/`.
- **Impact**: Bypasses the compiler's static analysis, disabling type checking and masking bugs across DTOs, API clients, form state, and entity models.

### 6.2 Strict Mode Disabled in `tsconfig.app.json`
- **Location**: [tsconfig.app.json:L18-L22](file:///mnt/data/projects/Marka/erp-frontend/tsconfig.app.json#L18-L22)
- **Current Settings**:
  - `"strict": true` is **missing** (defaults to `false`)
  - `"noImplicitAny": true` is **missing**
  - `"noUnusedLocals": false`
  - `"noUnusedParameters": false`

### 6.3 Runtime Overhead for Static Type Inference
- **Locations**: [roleForm.ts:L11](file:///mnt/data/projects/Marka/erp-frontend/src/modules/users/presentation/schemas/roleForm.ts#L11) and [plotForm.schema.ts:L28-L29](file:///mnt/data/projects/Marka/erp-frontend/src/modules/investments/presentation/schemas/plotForm.schema.ts#L28-L29)
- **Code Pattern**:
  
ts
  const dummySchema = getCreateRoleSchema(() => '');
  export typProblemalues = z.infer<typeof dummySchema>;
 
- **Problem**: Instantiating a runtime object with a fake translation closure just to infer a type creates unnecessary runtime memory allocations and triggers ESLint `@typescript-eslint/no-unused-vars` errors.
- **Remediation**: Use `export type RoleFormValues = z.infer<ReturnType<typeof getCreateRoleSchema>>;`.

---

## 7. Localization & Internationalization Bugs

### 7.1 `getLocalizedName` Ignores Active Application Language
- **Location**: [helpes.ts:L4](file:///mnt/data/projects/Marka/erp-frontend/src/core/presentation/utils/helpes.ts#L4)
- **Code Pattern**:
  
ts
  export const getLocalizedName = (name: string | { ar?: string; en?: string } | null | undefined): string => {
    if (!name) return '';
    if (typeof name === 'string') return name;
    return name.ar || nProblem'; // <-- Always defaults to Arabic first
  };
  `
- **Problem**: `getLocalizedName` does not accept the current Impact parameter and always returns `name.ar` if present.
- **32 tables and view pageses language to English (`en`), over **32 tables and view pages** across HR, Finance, and Investments continue to display Arabic text for all entity names.

---

## 8. Naming Inconsistencies & Typographical Errors

The following typos exist in file names, directory names, function names, and identifiers:

| Current Identifier / Path | Correct Spelling | Scope / Impact |
| :--- | :--- | :---58 filesre/domain/common/responce/` | `response/` | Affects **58 files** across all modules || src/core/presentation/context/api/ApiClinetProvider.tsx | ApiClientProvider.tsx | Core API context provider |
| src/core/presentation/utils/helpes.ts | helpers.ts | Utility helper imported in 32+ files |
| src/core/application/usecases/manageAufitLogsUseCase.ts | manageAuditLogsUseCase.ts | Core audit logs use case |
| src/modules/users/domain/repositories/ICrudRoleRepositry.ts | ICrudRoleRepository.ts | Role repository interface |
| src/modules/users/presentation/hooks/user/userManageUsers.ts | useManageUsers.ts | User management hook |
| src/Sabdbox.tsx | Sandbox.tsx | Sandbox test component |
| createCrufRepository (CrudRepository.ts:5) | createCrudRepository | Core generic CRUD repository factory |
| useDynamicForm221.ts | useDynamicForm.ts | Arbitrary numeric suffix beside dead duplicate |
| idempotency_wrog_data (useIdempotency.ts:49) | idempotency_wrong_data | Backend idempotency error code |
| copidItems (FileExplorer.tsx:68) | copiedItems | State variable name |
| UpdateuserDto (userDto.ts) | UpdateUserDto | Case inconsistency in type name |

---

## 9. Prioritized Remediation Roadmap

flowchart TD
    A[Phase 1: Build & Critical Fixes] --> B[Phase 2: React & State Architecture]
    B --> C[Phase 3: Security & Data Integrity]
    C --> D[Phase 4: Refactoring & Clean Code]

    subgraph Phase 1
    A1[Fix mockSubscriptionRequests & Sabdbox.tsx]
    A2[Restore npm run build success]
    end

    subgraph Phase 2
    B1[Memoize UseCases & Repositories in Hooks]
    B2[Move createBrowserRouter out of AppContent]
    B3[Remove 23+ ESLint suppressions]
    B4[Scope WebSocket subscriptions to session]
    end

    subgraph Phase 3
    C1[Fix cleanPayload for null & File objects]
    C2[Safely parse localStorage with try/catch]
    C3[Fix querySelector escaping in handleApiError]
    C4[Fix getLocalizedName locale awareness]
    end

    subgraph Phase 4
    D1[Rename responce/ -> response/ across 58 files]
    D2[Fix typos in file & function names]
    D3[Enable strict mode in tsconfig.app.json]
    D4[Implement React.lazy route chunking]
    end
### Phase 1: Build & Critical Fixes (Immediate)
1. **Fix mockSubscriptionRequests.ts and Sabdbox.tsx**: Align mock data with SubscriptionRequestV100Record and SubscriptionPartnerEntry definitions so npm run build exits with code 0.Verify CI/CD Build Pipelinene**: Ensure npm run build and npm run lint execute successfully in .gitlab-ci.yml.

### Phase 2: React & State Architecture (High Priority)Memoize Custom Hooksks**: Wrap createRepository and createUseCase instantiations in useMemo across all presentation hooks to stabilize function references and eliminate infinite re-render loops.
2. **Refactor App.tsx Routing**: Create the router at module scope or memoize route configurations so createBrowserRouter is not invoked on every renRemove ESLint Suppressionsssions**: Delete the 23 // eslint-disable-next-line comments after hook dependencies are stabiliFix WebSocket Subscriptionsptions**: Replace module-level subscription flags with session-scoped state and add proper unsubscribe cleanup on logout/unmount.

### Phase 3: Security & Data Integrity (High Priority)
1. **Update cleanPayload**: Preserve explicit null values for clearing fields on update, and guard File/Blob instances against recursive stripping.
2. **Harden authStorage**: Wrap JSON.parse in try...catch with automatic fallback/cleanup, and fix base64url JWT decoding.
3. **Escape CSS.escape(field)** in applyServerValidationErrors before passing to document.querySelector.
4. **Fix getLocalizedName**: Pass the active locale (language) and return the appropriate language string (lang === 'en' ? (name.en || name.ar) : (name.ar || name.en)).### Phase 4: Clean Architecture & Refactoring (Medium Priority)
1. Correct Global Typographical Errors: Batch rename responce to response across 58 files, and fix misnamed files (ApiClinetProvider, helpes, useDynamicForm221).
2. Decouple Core Layer: Remove direct imports of modules/hr and modules/users from core/ by introducing generic type parameters and domain-agnostic interfaces.
3. Extract Domain Logic: Move eligibility condition evaluations from ShowLeaveRequestAdminPage.tsx to a dedicated domain service.
4. Enable TypeScript Strict Mode: Incrementally enable "strict": true in tsconfig.app.json and replace any types with proper domain interfaces.
5. Implement Route Lazy-Loading: Replace eager module loading with React.lazy() to optimize bundle size and page load speed.